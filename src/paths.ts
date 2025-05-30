/**
 * Joins multiple path segments into a single path string, handling slashes appropriately.
 * Empty segments are ignored, and leading/trailing slashes are trimmed.
 *
 * @param {...string[]} args - The path segments to join
 * @returns {string} The joined path with segments separated by forward slashes
 * @example
 * joinPath("foo", "bar", "baz") // returns "foo/bar/baz"
 * joinPath("/foo/", "/bar/", "/baz/") // returns "foo/bar/baz"
 * joinPath("foo", "", "bar") // returns "foo/bar"
 */
export function joinPath(...args: string[]) {
  const path: string[] = []

  for (let i = 0; i < args.length; i++) {
    let v = args[i]
    v = v && trimSlashes(v)
    v && path.push(v)
  }

  return path.join("/")
}

/**
 * Removes leading and trailing slashes from a string.
 *
 * @param {string} s - The string to trim slashes from
 * @returns {string} The string with leading and trailing slashes removed
 * @example
 * trimSlashes("/foo/bar/") // returns "foo/bar"
 * trimSlashes("foo/bar") // returns "foo/bar"
 */
export function trimSlashes(s: string) {
  let i = 0
  let j = s.length - 1
  for (; s[i] === "/" && i < s.length; i++) { }
  for (; s[j] === "/" && j >= 0; j--) { }

  return s.slice(i, j + 1)
}
