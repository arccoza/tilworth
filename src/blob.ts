import { base64, hex } from "./transcoders"


export const blob = {
  async toDataUrl(blob: Blob) {
    return `data:${blob.type};base64,${await this.toBase64(blob)}`
  },

  async toBase64(blob: Blob, urlSafe=false) {
    return base64.encode(await blob.arrayBuffer(), urlSafe)
  },

  async toHex(blob: Blob) {
    return hex.encode(await blob.arrayBuffer())
  },
}
