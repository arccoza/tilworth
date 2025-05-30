export const hex = {
  /**
   * Encodes an ArrayBuffer to a hexadecimal string.
   * Each byte is converted to a two-character hex string, padded with leading zeros if necessary.
   *
   * @param buf - The buffer to encode
   * @returns A hexadecimal string representation of the buffer
   * @example
   * hex.encode(new Uint8Array([1, 2, 3]).buffer) // returns "010203"
   */
  encode(buf: ArrayBuffer) {
    const bytes = new Uint8Array(buf)
    return Array.prototype.map.call(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  },

  /**
   * Decodes a hexadecimal string to a Uint8Array.
   * Handles odd-length strings by padding with a leading zero.
   *
   * @param hex - The hexadecimal string to decode
   * @returns A Uint8Array containing the decoded bytes
   * @example
   * hex.decode("010203") // returns Uint8Array([1, 2, 3])
   */
  decode(hex: string) {
    hex = hex.length % 2 ? hex.padStart(hex.length + 1, "0") : hex
    const size = hex.length / 2
    const bytes = new Uint8Array(size)

    for (let i = 0; i < size; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }

    return bytes
  },
}

export const base64 = {
  /**
   * Encodes an ArrayBuffer to a base64 string.
   * Optionally converts the output to URL-safe base64 format.
   *
   * @param buf - The buffer to encode
   * @param urlSafe - Whether to use URL-safe base64 encoding
   * @returns A base64 string representation of the buffer
   * @example
   * base64.encode(new Uint8Array([1, 2, 3]).buffer) // returns "AQID"
   * base64.encode(new Uint8Array([1, 2, 3]).buffer, true) // returns "AQID" (URL-safe)
   */
  encode(buf: ArrayBuffer, urlSafe=false) {
    const bytes = new Uint8Array(buf)
    const byteStr = String.fromCharCode(...bytes)
    const base64 = btoa(byteStr)
    return urlSafe ? makeUrlSafe(base64) : base64
  },

  /**
   * Decodes a base64 string to a Uint8Array.
   * Handles both standard and URL-safe base64 formats.
   *
   * @param base64 - The base64 string to decode
   * @param urlSafe - Whether the input is URL-safe base64
   * @returns A Uint8Array containing the decoded bytes
   * @example
   * base64.decode("AQID") // returns Uint8Array([1, 2, 3])
   * base64.decode("AQID", true) // returns Uint8Array([1, 2, 3])
   */
  decode(base64: string, urlSafe=false) {
    base64 = urlSafe ? makeUrlUnsafe(base64) : base64

    const byteStr = atob(base64)
    const buffer = new Uint8Array(byteStr.length)

    for (let i = 0; i < byteStr.length; i++) {
      buffer[i] = byteStr.charCodeAt(i)
    }

    return buffer
  },
}

const unsafeToSafe: Record<string, string> = {
  "=": "",
  "+": "-",
  "/": "_",
}

const safeToUnsafe: Record<string, string> = {
  "-": "+",
  "_": "/",
}

/**
 * Converts a standard base64 string to URL-safe format.
 * Replaces '+', '/', and '=' with '-', '_', and removes padding respectively.
 *
 * @param base64 - The standard base64 string to convert
 * @returns A URL-safe base64 string
 * @example
 * makeUrlSafe("AQID+") // returns "AQID-"
 */
export function makeUrlSafe(base64: string) {
  return base64.replace(/[=+/]/gm, (m) => unsafeToSafe[m])
}

/**
 * Converts a URL-safe base64 string to standard format.
 * Replaces '-', '_' with '+', '/' and adds appropriate padding.
 *
 * @param base64 - The URL-safe base64 string to convert
 * @returns A standard base64 string
 * @example
 * makeUrlUnsafe("AQID-") // returns "AQID+"
 */
export function makeUrlUnsafe(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  return base64.replace(/[-_]/gm, (m) => safeToUnsafe[m]) + padding
}

const utf8Enc = new TextEncoder()
const utf8Dec = new TextDecoder()
export const utf8 = {
  /**
   * Encodes a string to UTF-8 bytes.
   *
   * @param text - The string to encode
   * @returns A Uint8Array containing the UTF-8 encoded bytes
   * @example
   * utf8.encode("Hello") // returns Uint8Array([72, 101, 108, 108, 111])
   */
  encode(text: string) {
    return utf8Enc.encode(text)
  },

  /**
   * Decodes UTF-8 bytes to a string.
   *
   * @param buf - The buffer containing UTF-8 encoded bytes
   * @returns The decoded string
   * @example
   * utf8.decode(new Uint8Array([72, 101, 108, 108, 111]).buffer) // returns "Hello"
   */
  decode(buf: ArrayBuffer) {
    return utf8Dec.decode(buf)
  },
}
