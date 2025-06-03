export type TypedArrays =
  Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array


export const buffer = {
  /**
   * Concatenates multiple typed arrays into a single new typed array of the same type.
   * @template T - The type of the input and output typed arrays
   * @param {...T[]} bufs - The typed arrays to concatenate
   * @returns {T | undefined} A new typed array containing the concatenated data, or undefined if no arrays were provided
   */
  concat<T extends TypedArrays>(...bufs: T[]) {
    if (bufs.length === 0) {
      return
    }

    const len = bufs.reduce((acc, buf) => acc + buf.byteLength, 0)
    const merged = new Uint8Array(len)

    for (let i = 0, offset = 0; i < bufs.length; i++) {
      const buf = new Uint8Array(bufs[i].buffer)
      merged.set(buf, offset)
      offset += buf.byteLength
    }

    const Constructor = bufs[0].constructor as new (buffer: ArrayBuffer) => T
    return new Constructor(merged.buffer)
  },

  /**
   * Pads a Uint8Array with `len` zeros.
   * @param {Uint8Array} buf - The buffer to pad
   * @param {number} len - The length of the padding
   * @returns {Uint8Array} A new padded buffer
   */
  pad(buf: Uint8Array, len: number) {
    const offset = 2 + len
    const padded = new Uint8Array(offset + buf.length)
    padded.fill(0, 0, offset)
    padded.set(buf, offset)
    const dv = new DataView(padded.buffer)
    dv.setUint16(0, len, false)
    return padded
  },

  /**
   * Pads a Uint8Array with a random number of zeros.
   * @param {Uint8Array} buf - The buffer to pad
   * @returns {Uint8Array} A new padded buffer with random length
   */
  padRand(buf: Uint8Array) {
    const lenBuf = crypto.getRandomValues(new Uint8Array(1))
    const dv = new DataView(lenBuf.buffer)
    const len = dv.getUint8(0)
    return this.pad(buf, len)
  },

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
  toBase64(buf: ArrayBuffer | TypedArrays, urlSafe=false) {
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
  fromBase64(base64: string) {
    base64 = makeUrlUnsafe(base64)

    const byteStr = atob(base64)
    const buffer = new Uint8Array(byteStr.length)

    for (let i = 0; i < byteStr.length; i++) {
      buffer[i] = byteStr.charCodeAt(i)
    }

    return buffer
  },

  /**
   * Encodes an ArrayBuffer to a hexadecimal string.
   * Each byte is converted to a two-character hex string, padded with leading zeros if necessary.
   *
   * @param buf - The buffer to encode
   * @returns A hexadecimal string representation of the buffer
   * @example
   * hex.encode(new Uint8Array([1, 2, 3]).buffer) // returns "010203"
   */
  toHex(buf: ArrayBuffer | TypedArrays) {
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
  fromHex(hex: string) {
    hex = hex.length % 2 ? hex.padStart(hex.length + 1, "0") : hex
    const size = hex.length / 2
    const bytes = new Uint8Array(size)

    for (let i = 0; i < size; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }

    return bytes
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
