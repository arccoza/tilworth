import { describe, it, expect, beforeEach, vi } from "vitest"
import { buffer, TypedArrays } from "./buffer"


describe("buffer", () => {
  describe("concat", () => {
    it("should concatenate multiple Int8Array buffers", () => {
      const buf1 = new Int8Array([1, 2, 3])
      const buf2 = new Int8Array([4, 5])
      const buf3 = new Int8Array([6])

      const result = buffer.concat(buf1, buf2, buf3)!

      expect(result).toBeInstanceOf(Int8Array)
      expect(Array.from(result)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it("should concatenate multiple Uint8Array buffers", () => {
      const buf1 = new Uint8Array([10, 20])
      const buf2 = new Uint8Array([30, 40, 50])

      const result = buffer.concat(buf1, buf2)!

      expect(result).toBeInstanceOf(Uint8Array)
      expect(Array.from(result)).toEqual([10, 20, 30, 40, 50])
    })

    it("should concatenate multiple Float32Array buffers", () => {
      const buf1 = new Float32Array([1.5, 2.5])
      const buf2 = new Float32Array([3.5])

      const result = buffer.concat(buf1, buf2)!

      expect(result).toBeInstanceOf(Float32Array)
      expect(Array.from(result)).toEqual([1.5, 2.5, 3.5])
    })

    it("should concatenate multiple BigInt64Array buffers", () => {
      const buf1 = new BigInt64Array([1n, 2n])
      const buf2 = new BigInt64Array([3n, 4n])

      const result = buffer.concat(buf1, buf2)!

      expect(result).toBeInstanceOf(BigInt64Array)
      expect(Array.from(result)).toEqual([1n, 2n, 3n, 4n])
    })

    it("should handle single buffer", () => {
      const buf = new Uint8Array([1, 2, 3])

      const result = buffer.concat(buf)!

      expect(result).toBeInstanceOf(Uint8Array)
      expect(Array.from(result)).toEqual([1, 2, 3])
    })

    it("should handle empty buffers", () => {
      const buf1 = new Uint8Array([1, 2])
      const buf2 = new Uint8Array([])
      const buf3 = new Uint8Array([3])

      const result = buffer.concat(buf1, buf2, buf3)!

      expect(result).toBeInstanceOf(Uint8Array)
      expect(Array.from(result)).toEqual([1, 2, 3])
    })

    it("should return undefined for empty input", () => {
      const result = buffer.concat()

      expect(result).toBeUndefined()
    })

    it("should preserve byte order and values correctly", () => {
      const buf1 = new Uint16Array([0x1234, 0x5678])
      const buf2 = new Uint16Array([0x9abc])

      const result = buffer.concat(buf1, buf2)!

      expect(result).toBeInstanceOf(Uint16Array)
      expect(Array.from(result)).toEqual([0x1234, 0x5678, 0x9abc])
    })
  })

  describe("pad", () => {
    it("should pad buffer with specified length", () => {
      const buf = new Uint8Array([1, 2, 3])
      const len = 5

      const result = buffer.pad(buf, len)

      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBe(2 + len + buf.length) // 2 bytes for length + padding + original

      // Check length header (big-endian)
      const dv = new DataView(result.buffer)
      expect(dv.getUint16(0, false)).toBe(len)

      // Check padding is zeros
      for (let i = 2; i < 2 + len; i++) {
        expect(result[i]).toBe(0)
      }

      // Check original data is at the end
      expect(Array.from(result.slice(2 + len))).toEqual([1, 2, 3])
    })

    it("should handle zero padding length", () => {
      const buf = new Uint8Array([1, 2, 3])
      const len = 0

      const result = buffer.pad(buf, len)

      expect(result.length).toBe(2 + buf.length) // 2 bytes for length + original

      // Check length header
      const dv = new DataView(result.buffer)
      expect(dv.getUint16(0, false)).toBe(0)

      // Check original data starts immediately after length header
      expect(Array.from(result.slice(2))).toEqual([1, 2, 3])
    })

    it("should handle empty buffer", () => {
      const buf = new Uint8Array([])
      const len = 3

      const result = buffer.pad(buf, len)

      expect(result.length).toBe(2 + len) // 2 bytes for length + padding

      // Check length header
      const dv = new DataView(result.buffer)
      expect(dv.getUint16(0, false)).toBe(len)

      // Check all padding is zeros
      for (let i = 2; i < result.length; i++) {
        expect(result[i]).toBe(0)
      }
    })

    it("should handle large padding length", () => {
      const buf = new Uint8Array([1])
      const len = 255

      const result = buffer.pad(buf, len)

      expect(result.length).toBe(2 + len + 1)

      // Check length header
      const dv = new DataView(result.buffer)
      expect(dv.getUint16(0, false)).toBe(len)

      // Check padding
      for (let i = 2; i < 2 + len; i++) {
        expect(result[i]).toBe(0)
      }

      // Check original data
      expect(result[2 + len]).toBe(1)
    })
  })

  describe("padRand", () => {
    beforeEach(() => {
      // Mock crypto.getRandomValues to make tests deterministic
      vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
        if (array instanceof Uint8Array && array.length === 1) {
          array[0] = 42 // Fixed value for testing
        }
        return array
      })
    })

    it("should pad buffer with random length", () => {
      const buf = new Uint8Array([1, 2, 3])

      const result = buffer.padRand(buf)

      expect(result).toBeInstanceOf(Uint8Array)
      expect(result.length).toBe(2 + 42 + buf.length) // 2 bytes for length + 42 padding + original

      // Check length header
      const dv = new DataView(result.buffer)
      expect(dv.getUint16(0, false)).toBe(42)

      // Check padding is zeros
      for (let i = 2; i < 2 + 42; i++) {
        expect(result[i]).toBe(0)
      }

      // Check original data
      expect(Array.from(result.slice(2 + 42))).toEqual([1, 2, 3])
    })

    it("should use crypto.getRandomValues for padding length", () => {
      const buf = new Uint8Array([1])

      buffer.padRand(buf)

      expect(crypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
      expect(crypto.getRandomValues).toHaveBeenCalledWith(expect.objectContaining({ length: 1 }))
    })

    it("should handle empty buffer with random padding", () => {
      const buf = new Uint8Array([])

      const result = buffer.padRand(buf)

      expect(result.length).toBe(2 + 42) // 2 bytes for length + padding

      // Check length header
      const dv = new DataView(result.buffer)
      expect(dv.getUint16(0, false)).toBe(42)
    })

    it("should produce different results with different random values", () => {
      // Test with different mock values
      vi.mocked(crypto.getRandomValues).mockImplementation((array) => {
        if (array instanceof Uint8Array && array.length === 1) {
          array[0] = 10
        }
        return array
      })

      const buf = new Uint8Array([1, 2])
      const result = buffer.padRand(buf)

      expect(result.length).toBe(2 + 10 + 2)

      const dv = new DataView(result.buffer)
      expect(dv.getUint16(0, false)).toBe(10)
    })
  })

  describe("TypedArrays type coverage", () => {
    it("should work with all supported typed array types", () => {
      const testCases: Array<{ array: Exclude<TypedArrays, BigInt64Array | BigUint64Array>; expected: number[] }> = [
        { array: new Int8Array([1, 2]), expected: [1, 2] },
        { array: new Uint8Array([3, 4]), expected: [3, 4] },
        { array: new Uint8ClampedArray([5, 6]), expected: [5, 6] },
        { array: new Int16Array([7, 8]), expected: [7, 8] },
        { array: new Uint16Array([9, 10]), expected: [9, 10] },
        { array: new Int32Array([11, 12]), expected: [11, 12] },
        { array: new Uint32Array([13, 14]), expected: [13, 14] },
        { array: new Float32Array([15.5, 16.5]), expected: [15.5, 16.5] }
      ]

      testCases.forEach(({ array, expected }) => {
        const result = buffer.concat(array)!
        expect(result).toBeInstanceOf(array.constructor)
        expect(Array.from(result)).toEqual(expected)
      })
    })

    it("should work with BigInt arrays", () => {
      const bigInt64 = new BigInt64Array([1n, 2n])
      const bigUint64 = new BigUint64Array([3n, 4n])

      const result1 = buffer.concat(bigInt64)!
      const result2 = buffer.concat(bigUint64)!

      expect(result1).toBeInstanceOf(BigInt64Array)
      expect(result2).toBeInstanceOf(BigUint64Array)
      expect(Array.from(result1)).toEqual([1n, 2n])
      expect(Array.from(result2)).toEqual([3n, 4n])
    })
  })
})
