export function delay(ms: number, fn: () => void) {
  let done = false
  const tid = setTimeout(() => {
    done = true
    fn()
  }, ms)

  return () => (clearTimeout(tid), !done)
}

export function wait(ms: number, abort?: AbortController) {
  return new Promise((resolve, reject) => {
    const tid = setTimeout(() => {
      resolve(undefined)
    }, ms)

    abort?.signal.addEventListener("abort", (_ev) => {
      clearTimeout(tid)
      reject(abort.signal.reason)
    }, {
      once: true,
    })
  })
}
