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

### Drawing

GPUs mostly use triangles to draw. These triangles are defined by three vertices, each with an x and y coordinate.

```zsh
           (0,1)
             |
             |
             |
(-1,0)-----(0,0)-----(1,0)
             |
             |
             |
           (0,-1)
```

That means that `(0, 0)` is always the center of the canvas, `(-1, -1)` is always the bottom-left corner, and `(1, 1)` is always the top-right corner. This is known as `Clip Space`.

## Shaders - Empowering and Overwhelming

As a graphic dev(_you_), shaders will prove to be both empowering and overwhelming. I suggest you strap yourself fit and snug.

GPUs rely on small programs called `vertex shaders` to draw graphics. Shaders are written in a language called GLSL (OpenGL Shading Language).

### Vertex Shader

A vertex shader is responsible for transforming vertices from `model space` to `clip space`.
