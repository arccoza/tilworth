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
