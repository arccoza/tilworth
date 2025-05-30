import { base64 as base64x, hex as hexx, utf8 as utf8x } from "./transcoders"


export const blob = {
  async toDataUrl(blob: Blob) {
    return `data:${blob.type};base64,${await this.toBase64(blob)}`
  },

  async toBase64(blob: Blob, urlSafe=false) {
    return base64x.encode(await blob.arrayBuffer(), urlSafe)
  },

  async toHex(blob: Blob) {
    return hexx.encode(await blob.arrayBuffer())
  },

  async toText(blob: Blob) {
    return utf8x.decode(await blob.arrayBuffer())
  },

  fromDataUrl(dataUrl: string, forcedType?: string) {
    if (!dataUrl.startsWith("data:")) {
      throw new Error("Invalid data URL")
    }

    const [prefix, payload] = dataUrl.slice(5).split(",", 2)
    const [type, encoding] = prefix.split(";", 2)

    if (encoding !== "base64") {
      throw new Error(`Unsupported encoding: ${encoding}`)
    }

    return this.fromBase64(payload, forcedType ?? type ?? "application/octet-stream")
  },

  fromBase64(base64: string, type = "application/octet-stream") {
    return new Blob([base64x.decode(base64)], { type })
  },

  fromHex(hex: string, type = "application/octet-stream") {
    return new Blob([hexx.decode(hex)], { type })
  },

  fromText(text: string, type = "text/plain") {
    return new Blob([utf8x.encode(text)], { type })
  },
}
