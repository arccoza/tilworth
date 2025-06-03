const utf8Enc = new TextEncoder()
const utf8Dec = new TextDecoder()

export const text = {
  toBuffer(text: string) {
    return utf8Enc.encode(text)
  },

  intoBuffer(text: string, dest: Uint8Array) {
    return utf8Enc.encodeInto(text, dest)
  },

  fromBuffer(buf: ArrayBuffer | ArrayBufferView) {
    return utf8Dec.decode(buf)
  },
}
