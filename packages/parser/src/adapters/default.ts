import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import type { ApiMeta, ApiAdapter } from '../types';

/**
 * Parse a single API file using TypeScript AST
 */
export function parseApiFile(code: string, moduleName: string): ApiMeta[] {
  const sourceFile = ts.createSourceFile(
    'api.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const results: ApiMeta[] = [];
  const urlConstants = new Map<string, string>();

  // First pass: collect URL constants
  function collectUrlConstants(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) &&
            decl.name.text.endsWith('Url') &&
            decl.initializer) {
          if (ts.isStringLiteral(decl.initializer)) {
            urlConstants.set(decl.name.text, decl.initializer.text);
          } else if (ts.isNoSubstitutionTemplateLiteral(decl.initializer)) {
            urlConstants.set(decl.name.text, decl.initializer.text);
          }
        }
      }
    }
    ts.forEachChild(node, collectUrlConstants);
  }

  // Second pass: find createRequest calls
  function findCreateRequestCalls(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
        if (!ts.isCallExpression(decl.initializer)) continue;

        const call = decl.initializer;
        const callExpr = call.expression;

        // Check if it's createRequest<...>(...)
        if (ts.isIdentifier(callExpr) && callExpr.text === 'createRequest') {
          const apiMeta = extractApiMeta(decl.name.text, call, sourceFile, urlConstants);
          if (apiMeta) {
            results.push({ ...apiMeta, module: moduleName });
          }
        }
      }
    }
    ts.forEachChild(node, findCreateRequestCalls);
  }

  ts.forEachChild(sourceFile, collectUrlConstants);
  ts.forEachChild(sourceFile, findCreateRequestCalls);

  return results;
}

function extractApiMeta(
  name: string,
  call: ts.CallExpression,
  sourceFile: ts.SourceFile,
  urlConstants: Map<string, string>
): Omit<ApiMeta, 'module'> | null {
  const typeArgs = call.typeArguments;
  const [arg] = call.arguments;

  if (!arg || !ts.isObjectLiteralExpression(arg)) return null;

  let url = '';
  let method = 'GET';

  for (const prop of arg.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;

    const propName = prop.name.text;

    if (propName === 'url') {
      if (ts.isStringLiteral(prop.initializer)) {
        url = prop.initializer.text;
      } else if (ts.isIdentifier(prop.initializer)) {
        url = urlConstants.get(prop.initializer.text) || '';
      }
    }

    if (propName === 'method') {
      if (ts.isStringLiteral(prop.initializer)) {
        method = prop.initializer.text.toUpperCase();
      }
    }
  }

  if (!url) return null;

  const responseType = typeArgs?.[0]?.getText(sourceFile) || 'unknown';
  const requestType = typeArgs?.[1]?.getText(sourceFile) || 'unknown';

  return { name, url, method, responseType, requestType };
}

/**
 * Create the default adapter that scans src/api directories
 */
export function createDefaultAdapter(): ApiAdapter {
  return {
    parse(apiDir: string): ApiMeta[] {
      const results: ApiMeta[] = [];

      if (!fs.existsSync(apiDir)) {
        console.warn(`[ErrorMock] API directory not found: ${apiDir}`);
        return results;
      }

      const modules = fs.readdirSync(apiDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const moduleName of modules) {
        const indexPath = path.join(apiDir, moduleName, 'index.ts');

        if (!fs.existsSync(indexPath)) {
          continue;
        }

        try {
          const code = fs.readFileSync(indexPath, 'utf-8');
          const apis = parseApiFile(code, moduleName);
          results.push(...apis);
        } catch (e) {
          console.warn(`[ErrorMock] Failed to parse ${indexPath}:`, e);
        }
      }

      return results;
    },
  };
}
