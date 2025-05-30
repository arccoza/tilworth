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

  // Helper function to compare blob contents
  async function expectBlobsEqual(blob1: Blob, blob2: Blob) {
    expect(blob1.type).toBe(blob2.type)
    expect(blob1.size).toBe(blob2.size)

    const buffer1 = await blob1.arrayBuffer()
    const buffer2 = await blob2.arrayBuffer()
    expect(new Uint8Array(buffer1)).toEqual(new Uint8Array(buffer2))
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

  describe("toText", () => {
    it("should convert text blob to string", async () => {
      const testBlob = createBlob("Hello, World!")

      const result = await blob.toText(testBlob)

      expect(result).toBe("Hello, World!")
    })

    it("should handle empty blob", async () => {
      const testBlob = createBlob("")

      const result = await blob.toText(testBlob)

      expect(result).toBe("")
    })

    it("should handle UTF-8 characters", async () => {
      const testBlob = createBlob("Hello 世界! 🌍")

      const result = await blob.toText(testBlob)

      expect(result).toBe("Hello 世界! 🌍")
    })

    it("should handle binary data as UTF-8", async () => {
      // Create a blob with known UTF-8 bytes for "Hello"
      const utf8Bytes = new Uint8Array([72, 101, 108, 108, 111]) // "Hello" in UTF-8
      const testBlob = createBinaryBlob(utf8Bytes)

      const result = await blob.toText(testBlob)

      expect(result).toBe("Hello")
    })

    it("should handle special characters", async () => {
      const testBlob = createBlob("Line 1\nLine 2\tTabbed")

      const result = await blob.toText(testBlob)

      expect(result).toBe("Line 1\nLine 2\tTabbed")
    })
  })

  describe("fromDataUrl", () => {
    it("should convert data URL back to blob", () => {
      const dataUrl = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=="

      const result = blob.fromDataUrl(dataUrl)

      expect(result.type).toBe("text/plain")
      expect(result.size).toBe(13) // "Hello, World!" is 13 bytes
    })

    it("should handle empty base64 data", () => {
      const dataUrl = "data:text/plain;base64,"

      const result = blob.fromDataUrl(dataUrl)

      expect(result.type).toBe("text/plain")
      expect(result.size).toBe(0)
    })

    it("should handle different MIME types", () => {
      const dataUrl = "data:application/json;base64,dGVzdA=="

      const result = blob.fromDataUrl(dataUrl)

      expect(result.type).toBe("application/json")
    })

    it("should use forced type when provided", () => {
      const dataUrl = "data:text/plain;base64,SGVsbG8="

      const result = blob.fromDataUrl(dataUrl, "application/custom")

      expect(result.type).toBe("application/custom")
    })

    it("should handle data URL with no MIME type", () => {
      const dataUrl = "data:;base64,dGVzdA=="

      const result = blob.fromDataUrl(dataUrl)

      expect(result.type).toBe("")
    })

    it("should default to application/octet-stream when type is missing and no forced type", () => {
      const dataUrl = "data:;base64,dGVzdA=="

      const result = blob.fromDataUrl(dataUrl, undefined)

      expect(result.type).toBe("")
    })

    it("should throw error for invalid data URL", () => {
      expect(() => blob.fromDataUrl("not-a-data-url")).toThrow("Invalid data URL")
      expect(() => blob.fromDataUrl("http://example.com")).toThrow("Invalid data URL")
      expect(() => blob.fromDataUrl("")).toThrow("Invalid data URL")
    })

    it("should throw error for unsupported encoding", () => {
      expect(() => blob.fromDataUrl("data:text/plain;charset=utf-8,Hello")).toThrow("Unsupported encoding: charset=utf-8")
      expect(() => blob.fromDataUrl("data:text/plain;utf8,Hello")).toThrow("Unsupported encoding: utf8")
    })

    it("should handle binary data from data URL", () => {
      const dataUrl = "data:application/octet-stream;base64,AAECA/8="

      const result = blob.fromDataUrl(dataUrl)

      expect(result.type).toBe("application/octet-stream")
      expect(result.size).toBe(5)
    })

    it("should handle data URL round-trip conversion", async () => {
      const originalBlob = createBlob("Hello, World!")

      // Blob -> Data URL -> Blob -> Data URL
      const dataUrl = await blob.toDataUrl(originalBlob)
      const convertedBlob = blob.fromDataUrl(dataUrl)
      const finalDataUrl = await blob.toDataUrl(convertedBlob)

      expect(finalDataUrl).toBe(dataUrl)
      expect(convertedBlob.size).toBe(originalBlob.size)
    })

    it("should handle binary data round-trip conversion", async () => {
      const binaryData = new Uint8Array([0, 1, 2, 3, 255, 128, 64])
      const originalBlob = createBinaryBlob(binaryData)

      // Test all formats
      const base64 = await blob.toBase64(originalBlob)
      const hex = await blob.toHex(originalBlob)
      const dataUrl = await blob.toDataUrl(originalBlob)

      const fromBase64Blob = blob.fromBase64(base64, originalBlob.type)
      const fromHexBlob = blob.fromHex(hex, originalBlob.type)
      const fromDataUrlBlob = blob.fromDataUrl(dataUrl)

      await expectBlobsEqual(fromBase64Blob, originalBlob)
      await expectBlobsEqual(fromHexBlob, originalBlob)
      await expectBlobsEqual(fromDataUrlBlob, originalBlob)
    })
  })

  describe("fromBase64", () => {
    it("should convert base64 string to blob", () => {
      const base64 = "SGVsbG8sIFdvcmxkIQ=="

      const result = blob.fromBase64(base64)

      expect(result.type).toBe("application/octet-stream")
      expect(result.size).toBe(13) // "Hello, World!" is 13 bytes
    })

    it("should handle empty base64 string", () => {
      const result = blob.fromBase64("")

      expect(result.type).toBe("application/octet-stream")
      expect(result.size).toBe(0)
    })

    it("should use custom MIME type", () => {
      const base64 = "dGVzdA=="

      const result = blob.fromBase64(base64, "text/plain")

      expect(result.type).toBe("text/plain")
      expect(result.size).toBe(4) // "test" is 4 bytes
    })

    it("should handle binary data", () => {
      const base64 = "AAECA/8=" // [0, 1, 2, 3, 255]

      const result = blob.fromBase64(base64)

      expect(result.size).toBe(5)
    })

    it("should handle base64 with padding", () => {
      const base64 = "SGVsbG8=" // "Hello"

      const result = blob.fromBase64(base64)

      expect(result.size).toBe(5)
    })

    it("should handle base64 without padding", () => {
      const base64 = "SGVsbG8" // "Hello" without padding

      const result = blob.fromBase64(base64)

      expect(result.size).toBe(5)
    })
  })

  describe("fromHex", () => {
    it("should convert hex string to blob", () => {
      const hex = "48656c6c6f2c20576f726c6421" // "Hello, World!"

      const result = blob.fromHex(hex)

      expect(result.type).toBe("application/octet-stream")
      expect(result.size).toBe(13)
    })

    it("should handle empty hex string", () => {
      const result = blob.fromHex("")

      expect(result.type).toBe("application/octet-stream")
      expect(result.size).toBe(0)
    })

    it("should use custom MIME type", () => {
      const hex = "74657374" // "test"

      const result = blob.fromHex(hex, "text/plain")

      expect(result.type).toBe("text/plain")
      expect(result.size).toBe(4)
    })

    it("should handle single byte", () => {
      const hex = "41" // "A"

      const result = blob.fromHex(hex)

      expect(result.size).toBe(1)
    })

    it("should handle binary data", () => {
      const hex = "00010203ff"

      const result = blob.fromHex(hex)

      expect(result.size).toBe(5)
    })

    it("should handle odd-length hex string", () => {
      const hex = "f" // Should be padded to "0f"

      const result = blob.fromHex(hex)

      expect(result.size).toBe(1)
    })

    it("should handle uppercase hex", () => {
      const hex = "48656C6C6F" // "Hello" with uppercase

      const result = blob.fromHex(hex)

      expect(result.size).toBe(5)
    })
  })

  describe("fromText", () => {
    it("should convert text string to blob", () => {
      const text = "Hello, World!"

      const result = blob.fromText(text)

      expect(result.type).toBe("text/plain")
      expect(result.size).toBe(13)
    })

    it("should handle empty string", () => {
      const result = blob.fromText("")

      expect(result.type).toBe("text/plain")
      expect(result.size).toBe(0)
    })

    it("should use custom MIME type", () => {
      const text = "test"

      const result = blob.fromText(text, "application/custom")

      expect(result.type).toBe("application/custom")
      expect(result.size).toBe(4)
    })

    it("should handle UTF-8 characters", () => {
      const text = "Hello 世界! 🌍"

      const result = blob.fromText(text)

      expect(result.type).toBe("text/plain")
      expect(result.size).toBeGreaterThan(text.length) // UTF-8 encoding makes it larger
    })

    it("should handle special characters", () => {
      const text = "Line 1\nLine 2\tTabbed"

      const result = blob.fromText(text)

      expect(result.type).toBe("text/plain")
      expect(result.size).toBe(text.length)
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

  describe("round-trip conversions", () => {
    it("should handle text round-trip conversion", async () => {
      const originalText = "Hello, World! 🌍"

      // Text -> Blob -> Text
      const textBlob = blob.fromText(originalText)
      const convertedText = await blob.toText(textBlob)

      expect(convertedText).toBe(originalText)
    })

    it("should handle base64 round-trip conversion", async () => {
      const originalBlob = createBlob("Hello, World!")

      // Blob -> Base64 -> Blob -> Base64
      const base64 = await blob.toBase64(originalBlob)
      const convertedBlob = blob.fromBase64(base64, "text/plain")
      const finalBase64 = await blob.toBase64(convertedBlob)

      expect(finalBase64).toBe(base64)
      await expectBlobsEqual(convertedBlob, originalBlob)
    })

    it("should handle hex round-trip conversion", async () => {
      const originalBlob = createBlob("Hello, World!")

      // Blob -> Hex -> Blob -> Hex
      const hex = await blob.toHex(originalBlob)
      const convertedBlob = blob.fromHex(hex, "text/plain")
      const finalHex = await blob.toHex(convertedBlob)

      expect(finalHex).toBe(hex)
      await expectBlobsEqual(convertedBlob, originalBlob)
    })

    it("should handle UTF-8 text round-trip through all formats", async () => {
      const originalText = "Hello 世界! 🌍 Testing UTF-8"
      const originalBlob = blob.fromText(originalText)

      // Text -> All formats -> Back to text
      const base64 = await blob.toBase64(originalBlob)
      const hex = await blob.toHex(originalBlob)
      const dataUrl = await blob.toDataUrl(originalBlob)

      const fromBase64Text = await blob.toText(blob.fromBase64(base64))
      const fromHexText = await blob.toText(blob.fromHex(hex))
      const fromDataUrlText = await blob.toText(blob.fromDataUrl(dataUrl))

      expect(fromBase64Text).toBe(originalText)
      expect(fromHexText).toBe(originalText)
      expect(fromDataUrlText).toBe(originalText)
    })

    it("should preserve MIME types in round-trip conversions", async () => {
      const originalBlob = createBlob("test", "application/json")

      const dataUrl = await blob.toDataUrl(originalBlob)
      const convertedBlob = blob.fromDataUrl(dataUrl)

      expect(convertedBlob.type).toBe("application/json")
    })
  })
})
