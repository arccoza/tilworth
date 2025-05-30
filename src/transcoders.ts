export const hex = {
  encode(buf: ArrayBuffer) {
    const bytes = new Uint8Array(buf)
    return Array.prototype.map.call(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  },

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
  encode(buf: ArrayBuffer, urlSafe=false) {
    const bytes = new Uint8Array(buf)
    const byteStr = String.fromCharCode(...bytes)
    const base64 = btoa(byteStr)
    return urlSafe ? makeUrlSafe(base64) : base64
  },

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

export function makeUrlSafe(base64: string) {
  return base64.replace(/[=+/]/gm, (m) => unsafeToSafe[m])
}

export function makeUrlUnsafe(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  return base64.replace(/[-_]/gm, (m) => safeToUnsafe[m]) + padding
}

const utf8Enc = new TextEncoder()
const utf8Dec = new TextDecoder()
export const utf8 = {
  encode(text: string) {
    return utf8Enc.encode(text)
  },

  decode(buf: ArrayBuffer) {
    return utf8Dec.decode(buf)
  },
}
