# Vite Example - Error Mock Plugin

This example demonstrates how to use the `@error-mock/plugin` in a Vite project.

## Features

- **User API Module**: Demonstrates user-related endpoints (get user, login, update profile)
- **Storage API Module**: Demonstrates file storage endpoints (upload, list, delete)
- **Custom Request Wrapper**: Shows how to integrate with existing request utilities
- **Interactive UI**: Simple buttons to trigger API calls and see results

## Project Structure

```
vite-example/
├── src/
│   ├── api/
│   │   ├── user/
│   │   │   ├── index.ts         # User API endpoints
│   │   │   └── _interface.ts    # User API types
│   │   └── storage/
│   │       ├── index.ts         # Storage API endpoints
│   │       └── _interface.ts    # Storage API types
│   ├── utils/
│   │   └── request.ts           # createRequest implementation
│   └── main.ts                  # Main application entry
├── index.html                   # HTML entry
├── vite.config.ts              # Vite config with errorMockPlugin
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## Getting Started

### Install Dependencies

From the project root:

```bash
pnpm install
```

### Build Packages

Build all packages first:

```bash
pnpm build
```

### Run Development Server

```bash
cd examples/vite-example
pnpm dev
```

The application will be available at `http://localhost:3000/`.

## Using the Error Mock Plugin

1. **Open the App**: Navigate to `http://localhost:3000/`
2. **Open Developer Tools**: Right-click and select "Inspect" or press F12
3. **Find the Error Mock UI**: The plugin injects a UI panel in the browser
4. **Configure Mock Rules**:
   - Select an API endpoint from the list
   - Choose a mock type (success, business error, network error)
   - Configure parameters like delay, error codes, etc.
   - Enable the rule

5. **Test the Mock**: Click the corresponding button in the app UI to trigger the API call

## API Endpoints

### User API

- `GET /api/user/info` - Get user information
- `POST /api/user/login` - User login
- `PUT /api/user/profile` - Update user profile

### Storage API

- `POST /api/storage/upload` - Upload a file
- `GET /api/storage/files` - List files
- `DELETE /api/storage/file` - Delete a file

## How It Works

The plugin automatically:

1. Scans the `src/api` directory for API definitions
2. Extracts URL patterns and creates mock rules
3. Injects a UI panel for configuring mocks
4. Intercepts fetch requests matching the patterns
5. Returns mocked responses based on configured rules

## Key Files

### vite.config.ts

```typescript
import errorMockPlugin from '@error-mock/plugin';

export default defineConfig({
  plugins: [
    errorMockPlugin({
      apiDir: 'src/api',
    }),
  ],
});
```

### API Definition Pattern

```typescript
export const getUserUrl = '/api/user/info';
export const getUser = createRequest<GetUserResponse, GetUserRequest>({
  url: getUserUrl,
  method: 'GET',
});
```

The plugin recognizes:
- Variables ending with `Url` containing URL strings
- Adjacent `createRequest` calls using those URLs

## Learn More

- [Main Documentation](../../README.md)
- [Getting Started](../../docs/getting-started.md)
- [API Parsing](../../docs/api-parsing.md)
