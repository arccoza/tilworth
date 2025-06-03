const utf8Enc = new TextEncoder()
const utf8Dec = new TextDecoder()

export const $text = {
  /**
   * Encodes a string to UTF-8 bytes.
   *
   * @param text - The string to encode
   * @returns A Uint8Array containing the UTF-8 encoded bytes
   * @example
   * utf8.encode("Hello") // returns Uint8Array([72, 101, 108, 108, 111])
   */
  toBuffer(text: string) {
    return utf8Enc.encode(text)
  },

  /**
   * Encodes a string to UTF-8 bytes and writes them into a destination buffer.
   *
   * @param text - The string to encode
   * @param dest - The destination buffer to write the encoded bytes into
   * @returns An object with the properties `read` and `written`
   * @example
   * const dest = new Uint8Array(10)
   * utf8.intoBuffer("Hello", dest) // returns { read: 5, written: 5 }
   * console.log(dest.subarray(0, 5)) // prints [72, 101, 108, 108, 111]
   */
  intoBuffer(text: string, dest: Uint8Array): { read: number, written: number } {
    return utf8Enc.encodeInto(text, dest)
  },

  /**
   * Decodes UTF-8 bytes to a string.
   *
   * @param buf - The buffer containing UTF-8 encoded bytes
   * @returns The decoded string
   * @example
   * utf8.decode(new Uint8Array([72, 101, 108, 108, 111]).buffer) // returns "Hello"
   */
  fromBuffer(buf: ArrayBuffer | ArrayBufferView) {
    return utf8Dec.decode(buf)
  },
}

export const $base64 = {
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
  fromBuffer(buf: ArrayBuffer, urlSafe = false) {
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
   * @returns A Uint8Array containing the decoded bytes
   * @example
   * base64.decode("AQID") // returns Uint8Array([1, 2, 3])
   */
  toBuffer(base64: string) {
    base64 = makeUrlUnsafe(base64)

    const byteStr = atob(base64)
    const buffer = new Uint8Array(byteStr.length)

    for (let i = 0; i < byteStr.length; i++) {
      buffer[i] = byteStr.charCodeAt(i)
    }

    return buffer
  },

  /**
   * Decodes a base64 string to a Uint8Array and writes them into a destination buffer.
   * Handles both standard and URL-safe base64 formats.
   *
   * @param base64 - The base64 string to decode
   * @param dest - The destination buffer to write the decoded bytes into
   * @returns An object with the properties `read` and `written`
   * @example
   * const dest = new Uint8Array(10)
   * base64.intoBuffer("AQID", dest) // returns { read: 4, written: 4 }
   * console.log(dest.subarray(0, 4)) // prints [1, 2, 3, 0]
   */
  intoBuffer(base64: string, dest: Uint8Array): { read: number, written: number } {
    base64 = makeUrlUnsafe(base64)
    const byteStr = atob(base64)
    const written = Math.min(dest.byteLength, byteStr.length)

    for (let i = 0; i < written; i++) {
      dest[i] = byteStr.charCodeAt(i)
    }

    return { read: byteStr.length, written }
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
