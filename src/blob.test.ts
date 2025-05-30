import { describe, it, expect } from "vitest"
import { blob } from "./blob"


describe("blob", () => {
  // Helper function to create test blobs
  function createBlob(data: string, type = "text/plain") {
    return new Blob([data], { type })
  }

  function createBinaryBlob(data: Uint8Array, type = "application/octet-stream") {
    return new Blob([data], { type })
  }

  describe("toDataUrl", () => {
    it("should convert text blob to data URL", async () => {
      const testBlob = createBlob("Hello, World!")

      const result = await blob.toDataUrl(testBlob)

      expect(result).toMatch(/^data:text\/plain;base64,/)
      expect(result).toBe("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==")
    })

    it("should handle empty blob", async () => {
      const testBlob = createBlob("")

      const result = await blob.toDataUrl(testBlob)

      expect(result).toBe("data:text/plain;base64,")
    })

    it("should preserve MIME type in data URL", async () => {
      const testBlob = createBlob("test", "application/json")

      const result = await blob.toDataUrl(testBlob)

      expect(result).toMatch(/^data:application\/json;base64,/)
      expect(result).toBe("data:application/json;base64,dGVzdA==")
    })

    it("should handle binary data", async () => {
      const binaryData = new Uint8Array([0, 1, 2, 3, 255])
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toDataUrl(testBlob)

      expect(result).toMatch(/^data:application\/octet-stream;base64,/)
      expect(result).toBe("data:application/octet-stream;base64,AAECA/8=")
    })

    it("should handle special characters", async () => {
      const testBlob = createBlob("Hello 世界! 🌍")

      const result = await blob.toDataUrl(testBlob)

      expect(result).toMatch(/^data:text\/plain;base64,/)
      // UTF-8 encoding of "Hello 世界! 🌍"
      expect(result).toBe("data:text/plain;base64,SGVsbG8g5LiW55WMISDwn4yN")
    })

    it("should handle blob with no type", async () => {
      const testBlob = new Blob(["test"])

      const result = await blob.toDataUrl(testBlob)

      expect(result).toMatch(/^data:;base64,/)
      expect(result).toBe("data:;base64,dGVzdA==")
    })
  })

  describe("toBase64", () => {
    it("should convert text blob to base64", async () => {
      const testBlob = createBlob("Hello, World!")

      const result = await blob.toBase64(testBlob)

      expect(result).toBe("SGVsbG8sIFdvcmxkIQ==")
    })

    it("should convert empty blob to empty string", async () => {
      const testBlob = createBlob("")

      const result = await blob.toBase64(testBlob)

      expect(result).toBe("")
    })

    it("should handle binary data", async () => {
      const binaryData = new Uint8Array([0, 1, 2, 3, 255])
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toBase64(testBlob)

      expect(result).toBe("AAECA/8=")
    })

    it("should handle URL-safe encoding when requested", async () => {
      // Create data that will result in + and / characters in standard base64
      const binaryData = new Uint8Array([62, 63, 64]) // Will produce "+/A=" in standard base64
      const testBlob = createBinaryBlob(binaryData)

      const standardResult = await blob.toBase64(testBlob, false)
      const urlSafeResult = await blob.toBase64(testBlob, true)

      expect(standardResult).toBe("Pj9A")
      expect(urlSafeResult).toBe("Pj9A") // This particular data doesn't have + or /

      // Test with data that definitely produces + and /
      const specialData = new Uint8Array([248, 255, 254]) // Will produce "+P/+" in standard base64
      const specialBlob = createBinaryBlob(specialData)

      const standardSpecial = await blob.toBase64(specialBlob, false)
      const urlSafeSpecial = await blob.toBase64(specialBlob, true)

      expect(standardSpecial).toBe("+P/+")
      expect(urlSafeSpecial).toBe("-P_-")
    })

    it("should handle special characters in UTF-8", async () => {
      const testBlob = createBlob("Hello 世界! 🌍")

      const result = await blob.toBase64(testBlob)

      expect(result).toBe("SGVsbG8g5LiW55WMISDwn4yN")
    })

    it("should handle large data", async () => {
      const largeData = "A".repeat(1000)
      const testBlob = createBlob(largeData)

      const result = await blob.toBase64(testBlob)

      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(1000)
      // Base64 encoding increases size by ~33%
      expect(result.length).toBeLessThan(1400)
    })

    it("should default to non-URL-safe encoding", async () => {
      const binaryData = new Uint8Array([248, 255, 254])
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toBase64(testBlob)

      expect(result).toBe("+P/+")
      expect(result).toContain("+")
      expect(result).toContain("/")
    })
  })

  describe("toHex", () => {
    it("should convert text blob to hex", async () => {
      const testBlob = createBlob("Hello")

      const result = await blob.toHex(testBlob)

      // "Hello" in ASCII: H=72, e=101, l=108, l=108, o=111
      expect(result).toBe("48656c6c6f")
    })

    it("should convert empty blob to empty string", async () => {
      const testBlob = createBlob("")

      const result = await blob.toHex(testBlob)

      expect(result).toBe("")
    })

    it("should handle binary data", async () => {
      const binaryData = new Uint8Array([0, 1, 2, 3, 255])
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toHex(testBlob)

      expect(result).toBe("00010203ff")
    })

    it("should handle single byte values", async () => {
      const binaryData = new Uint8Array([0])
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toHex(testBlob)

      expect(result).toBe("00")
    })

    it("should handle maximum byte values", async () => {
      const binaryData = new Uint8Array([255, 254, 253])
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toHex(testBlob)

      expect(result).toBe("fffefd")
    })

    it("should handle UTF-8 encoded characters", async () => {
      const testBlob = createBlob("世")

      const result = await blob.toHex(testBlob)

      // "世" in UTF-8 is encoded as [228, 184, 150]
      expect(result).toBe("e4b896")
    })

    it("should produce lowercase hex", async () => {
      const binaryData = new Uint8Array([171, 205, 239]) // 0xABCDEF
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toHex(testBlob)

      expect(result).toBe("abcdef")
      expect(result).not.toMatch(/[A-F]/)
    })

    it("should pad single-digit hex values with zero", async () => {
      const binaryData = new Uint8Array([1, 2, 3, 15]) // Should produce "01", "02", "03", "0f"
      const testBlob = createBinaryBlob(binaryData)

      const result = await blob.toHex(testBlob)

      expect(result).toBe("0102030f")
      expect(result.length).toBe(8) // 4 bytes * 2 hex chars each
    })

    it("should handle large data", async () => {
      const largeData = new Uint8Array(1000).fill(65) // 1000 bytes of 'A'
      const testBlob = createBinaryBlob(largeData)

      const result = await blob.toHex(testBlob)

      expect(result).toBe("41".repeat(1000))
      expect(result.length).toBe(2000) // 1000 bytes * 2 hex chars each
    })
  })

  describe("method interactions", () => {
    it("should produce consistent results across methods for the same data", async () => {
      const testData = "Hello, World! 🌍"
      const testBlob = createBlob(testData)

      const base64Result = await blob.toBase64(testBlob)
      const hexResult = await blob.toHex(testBlob)
      const dataUrlResult = await blob.toDataUrl(testBlob)

      // Verify that the base64 in data URL matches standalone base64
      expect(dataUrlResult).toBe(`data:text/plain;base64,${base64Result}`)

      // Verify all methods work with the same blob
      expect(base64Result).toBeTruthy()
      expect(hexResult).toBeTruthy()
      expect(dataUrlResult).toBeTruthy()
    })

    it("should handle the same binary data consistently", async () => {
      const binaryData = new Uint8Array([72, 101, 108, 108, 111]) // "Hello" in ASCII
      const testBlob = createBinaryBlob(binaryData)

      const base64Result = await blob.toBase64(testBlob)
      const hexResult = await blob.toHex(testBlob)

      expect(base64Result).toBe("SGVsbG8=")
      expect(hexResult).toBe("48656c6c6f")
    })
  })
})
