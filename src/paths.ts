export function joinPath(...args: string[]) {
  const path: string[] = []

  for (let i = 0; i < args.length; i++) {
    const v = args[i]
    v && path.push(trimSlashes(v))
  }

  return path.join("/")
}

function trimSlashes(s: string) {
  let i = 0
  let j = s.length - 1
  for (; s[i] === "/" && i < s.length; i++) { }
  for (; s[j] === "/" && j >= 0; j--) { }

  return s.slice(i, j + 1)
}
