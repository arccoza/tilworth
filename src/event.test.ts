import { describe, it, expect, beforeEach, vi } from "vitest"
import { listen } from "./event"


describe("listen", () => {
  let mockElement: Element
  let mockDocument: Document
  let mockWindow: Window
  let mockListener: EventListenerOrEventListenerObject

  beforeEach(() => {
    // Mock Element
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Element

    // Mock Document
    mockDocument = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Document

    // Mock Window
    mockWindow = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window

    // Mock listener function
    mockListener = vi.fn()
  })

  describe("with Element", () => {
    it("should add event listener to element", () => {
      const cleanup = listen(mockElement, "click", mockListener)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("click", mockListener, undefined)
      expect(typeof cleanup).toBe("function")
    })

    it("should add event listener with options", () => {
      const options = { once: true, passive: true }
      const cleanup = listen(mockElement, "scroll", mockListener, options)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("scroll", mockListener, options)
      expect(typeof cleanup).toBe("function")
    })

    it("should add event listener with boolean options", () => {
      const cleanup = listen(mockElement, "focus", mockListener, true)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("focus", mockListener, true)
      expect(typeof cleanup).toBe("function")
    })

    it("should remove event listener when cleanup function is called", () => {
      const cleanup = listen(mockElement, "mousedown", mockListener)

      cleanup()

      expect(mockElement.removeEventListener).toHaveBeenCalledWith("mousedown", mockListener)
    })

    it("should handle custom event types", () => {
      const cleanup = listen(mockElement, "custom-event", mockListener)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("custom-event", mockListener, undefined)
      expect(typeof cleanup).toBe("function")
    })
  })

  describe("with Document", () => {
    it("should add event listener to document", () => {
      const cleanup = listen(mockDocument, "DOMContentLoaded", mockListener)

      expect(mockDocument.addEventListener).toHaveBeenCalledWith("DOMContentLoaded", mockListener, undefined)
      expect(typeof cleanup).toBe("function")
    })

    it("should add event listener with options to document", () => {
      const options = { capture: true }
      const cleanup = listen(mockDocument, "click", mockListener, options)

      expect(mockDocument.addEventListener).toHaveBeenCalledWith("click", mockListener, options)
      expect(typeof cleanup).toBe("function")
    })

    it("should remove event listener from document when cleanup is called", () => {
      const cleanup = listen(mockDocument, "keydown", mockListener)

      cleanup()

      expect(mockDocument.removeEventListener).toHaveBeenCalledWith("keydown", mockListener)
    })
  })

  describe("with Window", () => {
    it("should add event listener to window", () => {
      const cleanup = listen(mockWindow, "resize", mockListener)

      expect(mockWindow.addEventListener).toHaveBeenCalledWith("resize", mockListener, undefined)
      expect(typeof cleanup).toBe("function")
    })

    it("should add event listener with options to window", () => {
      const options = { passive: false }
      const cleanup = listen(mockWindow, "scroll", mockListener, options)

      expect(mockWindow.addEventListener).toHaveBeenCalledWith("scroll", mockListener, options)
      expect(typeof cleanup).toBe("function")
    })

    it("should remove event listener from window when cleanup is called", () => {
      const cleanup = listen(mockWindow, "beforeunload", mockListener)

      cleanup()

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith("beforeunload", mockListener)
    })
  })

  describe("listener types", () => {
    it("should work with function listeners", () => {
      const functionListener = () => {}
      const cleanup = listen(mockElement, "click", functionListener)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("click", functionListener, undefined)
      expect(typeof cleanup).toBe("function")
    })

    it("should work with EventListener object", () => {
      const objectListener = {
        handleEvent: vi.fn()
      }
      const cleanup = listen(mockElement, "click", objectListener)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("click", objectListener, undefined)
      expect(typeof cleanup).toBe("function")
    })

    it("should work with arrow function listeners", () => {
      const arrowListener = (e: Event) => {}
      const cleanup = listen(mockElement, "input", arrowListener)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("input", arrowListener, undefined)
      expect(typeof cleanup).toBe("function")
    })
  })

  describe("multiple listeners", () => {
    it("should handle multiple listeners on same element", () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      const cleanup1 = listen(mockElement, "click", listener1)
      const cleanup2 = listen(mockElement, "click", listener2)

      expect(mockElement.addEventListener).toHaveBeenCalledTimes(2)
      expect(mockElement.addEventListener).toHaveBeenNthCalledWith(1, "click", listener1, undefined)
      expect(mockElement.addEventListener).toHaveBeenNthCalledWith(2, "click", listener2, undefined)

      cleanup1()
      expect(mockElement.removeEventListener).toHaveBeenCalledWith("click", listener1)

      cleanup2()
      expect(mockElement.removeEventListener).toHaveBeenCalledWith("click", listener2)
    })

    it("should handle different event types on same element", () => {
      const clickListener = vi.fn()
      const hoverListener = vi.fn()

      const cleanupClick = listen(mockElement, "click", clickListener)
      const cleanupHover = listen(mockElement, "mouseenter", hoverListener)

      expect(mockElement.addEventListener).toHaveBeenCalledTimes(2)
      expect(mockElement.addEventListener).toHaveBeenNthCalledWith(1, "click", clickListener, undefined)
      expect(mockElement.addEventListener).toHaveBeenNthCalledWith(2, "mouseenter", hoverListener, undefined)

      cleanupClick()
      cleanupHover()

      expect(mockElement.removeEventListener).toHaveBeenCalledWith("click", clickListener)
      expect(mockElement.removeEventListener).toHaveBeenCalledWith("mouseenter", hoverListener)
    })
  })

  describe("cleanup function", () => {
    it("should be safe to call cleanup multiple times", () => {
      const cleanup = listen(mockElement, "click", mockListener)

      cleanup()
      cleanup()
      cleanup()

      expect(mockElement.removeEventListener).toHaveBeenCalledTimes(3)
      expect(mockElement.removeEventListener).toHaveBeenCalledWith("click", mockListener)
    })

    it("should return the same listener that was added", () => {
      const originalListener = vi.fn()
      const cleanup = listen(mockElement, "click", originalListener)

      cleanup()

      expect(mockElement.addEventListener).toHaveBeenCalledWith("click", originalListener, undefined)
      expect(mockElement.removeEventListener).toHaveBeenCalledWith("click", originalListener)
    })
  })

  describe("edge cases", () => {
    it("should handle options as false", () => {
      const cleanup = listen(mockElement, "click", mockListener, false)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("click", mockListener, false)
      expect(typeof cleanup).toBe("function")
    })

    it("should handle complex options object", () => {
      const complexOptions = {
        capture: true,
        once: false,
        passive: true,
        signal: new AbortController().signal
      }
      const cleanup = listen(mockElement, "touchstart", mockListener, complexOptions)

      expect(mockElement.addEventListener).toHaveBeenCalledWith("touchstart", mockListener, complexOptions)
      expect(typeof cleanup).toBe("function")
    })
  })
})
