# API 解析（默认解析器）

默认解析器在 `packages/parser/src/adapters/default.ts`，用于在构建期从代码里提取 API 元信息（`ApiMeta`），并注入给 UI 展示。

## 扫描范围

只扫描指定 `apiDir` 下的一级目录：

```
<apiDir>/<module>/index.ts
```

其中：
- `module` 来自目录名
- `name/url/method` 来自 `index.ts` 内的 `createRequest(...)` 定义

## 支持的写法

### 1) 顶层 `export const xxx = createRequest<Res, Req>({ ... })`

```ts
export const getUserUrl = '/api/user/info';
export const getUser = createRequest<GetUserResponse, GetUserRequest>({
  url: getUserUrl,
  method: 'GET',
});
```

### 2) `url` 写成字符串字面量

```ts
export const ping = createRequest<PingRes, void>({
  url: '/api/ping',
});
```

### 3) `url` 引用同文件内的 `*Url` 常量

```ts
export const pingUrl = `/api/ping`; // 允许无插值的模板字面量
export const ping = createRequest<PingRes, void>({
  url: pingUrl,
});
```

### 4) `method` 缺省

未声明 `method` 时默认 `GET`。

## 不支持（需要调整写法或自定义 adapter）

默认解析器是一个轻量 AST 解析，不做跨文件/类型系统解析，因此不支持：

- `url` 来自 import、拼接、`/api/${v}` 这种带插值的模板字符串
- `createRequest(...)` 写在对象属性、class 字段、工厂函数返回值、条件分支等非“顶层变量初始化”位置
- `url/method` 使用计算属性名（例如 `['url']`）

## 自定义 Adapter

可以实现 `ApiAdapter` 并传给插件：

```ts
import type { ApiAdapter } from '@error-mock/parser';

const adapter: ApiAdapter = {
  parse(apiDir) {
    // return ApiMeta[]
    return [];
  },
};
```

- Vite：`errorMockPlugin({ adapter })`
- Webpack：`new ErrorMockWebpackPlugin({ adapter })`

> `ApiMeta.responseType/requestType` 当前只是从 `createRequest<Res, Req>` 里提取出来的“文本”，用于展示/调试；不会基于类型自动生成 mock 数据。
