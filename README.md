# Launch Day

**_Modern Productivity Launcher_**

## WEBGPU

### Enabling

Create a file named `types/webgpu.d.ts` in the root or `@/` of the project.

```typescript
export {};
declare global {
  interface Navigator {
    gpu: GPU;
  }
}
```

### install a dev dependency `@webgpu/types/`

```zsh
bun i -d @webgpu/types
```

then, add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@webgpu/types"]
  }
}
```
