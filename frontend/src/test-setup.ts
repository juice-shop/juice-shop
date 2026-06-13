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

// Provide stubs for Range geometry methods in jsdom.
// jsdom does not implement Range.prototype.getClientRects/getBoundingClientRect,
// so CodeMirror's layout measurement (e.g. when drawing selection layers) crashes
// with "textRange(...).getClientRects is not a function". Returning empty geometry
// is handled gracefully by CodeMirror (it simply skips the measurement) and keeps
// the test output free of these errors.
if (typeof Range.prototype.getClientRects !== 'function') {
  Range.prototype.getClientRects = function () {
    return Object.assign([], { item: () => null }) as unknown as DOMRectList
  }
  Range.prototype.getBoundingClientRect = function () {
    return {
      x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0,
      toJSON: () => ({}),
    } as DOMRect
  }
}
