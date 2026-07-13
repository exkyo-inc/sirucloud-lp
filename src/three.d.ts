declare module 'three' {
  export const LinearFilter: unknown
  export const GLSL3: unknown

  export class Texture {
    constructor(canvas?: HTMLCanvasElement)
    minFilter: unknown
    magFilter: unknown
    generateMipmaps: boolean
    needsUpdate: boolean
  }

  export class Uniform<T = unknown> {
    constructor(value: T)
    value: T
  }

  export class Vector2 {
    constructor(x?: number, y?: number)
    set(x: number, y: number): this
  }

  export class Color {
    constructor(color?: string | number)
    set(color: string | number): this
  }

  export class WebGLRenderer {
    constructor(options?: Record<string, unknown>)
    domElement: HTMLCanvasElement
    setPixelRatio(value: number): void
    getPixelRatio(): number
    setClearAlpha(value: number): void
    setClearColor(color: number, alpha?: number): void
    setSize(width: number, height: number, updateStyle?: boolean): void
    render(scene: Scene, camera: OrthographicCamera): void
    dispose(): void
    forceContextLoss(): void
  }

  export class Scene {
    add(object: unknown): void
  }

  export class OrthographicCamera {
    constructor(left: number, right: number, top: number, bottom: number, near?: number, far?: number)
  }

  export class ShaderMaterial {
    constructor(options?: Record<string, unknown>)
    dispose(): void
  }

  export class PlaneGeometry {
    constructor(width?: number, height?: number)
    dispose(): void
  }

  export class Mesh {
    constructor(geometry: PlaneGeometry, material: ShaderMaterial)
    geometry: PlaneGeometry
  }

  export class Clock {
    getElapsedTime(): number
  }
}
