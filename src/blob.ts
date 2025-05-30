export const blob = {
  async toDataUrl(blob: Blob, reader?: FileReader) {
    const r = reader ?? new FileReader()

    const p = new Promise<string>((res, rej) => {
      r.onloadend = () => res(r.result as string)
      r.onerror = (err) => rej(err)
    })

    r.readAsDataURL(blob)
    return p
  },

  async toBase64(blob: Blob, reader?: FileReader) {
    return this.toDataUrl(blob, reader).then((dataURL) => dataURL.split(",")[1])
  },
}
