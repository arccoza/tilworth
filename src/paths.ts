export function joinPath(...args: string[]) {
  const path: string[] = []

  for (let i = 0; i < args.length; i++) {
    let v = args[i]
    v = v && trimSlashes(v)
    v && path.push(v)
  }

  return path.join("/")
}

export function trimSlashes(s: string) {
  let i = 0
  let j = s.length - 1
  for (; s[i] === "/" && i < s.length; i++) { }
  for (; s[j] === "/" && j >= 0; j--) { }

  return s.slice(i, j + 1)
}
