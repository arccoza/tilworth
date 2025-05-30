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
}
