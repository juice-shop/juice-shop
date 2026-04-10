// Provide a stub for HTMLCanvasElement.getContext in jsdom.
// jsdom does not implement the Canvas API, so getContext('2d') returns null.
// This causes canvas-confetti and qrcode to crash with errors like
// "Cannot read properties of null (reading 'clearRect')".
// Return a minimal mock context to prevent these uncaught exceptions.
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (contextId: string, ...args: any[]) {
  if (contextId === '2d') {
    return {
      clearRect: () => {},
      fillRect: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray(0) }),
      putImageData: () => {},
      createImageData: () => ({ data: new Uint8ClampedArray(0) }),
      setTransform: () => {},
      resetTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
      canvas: this,
    } as unknown as CanvasRenderingContext2D
  }
  return originalGetContext.call(this, contextId, ...args)
}
