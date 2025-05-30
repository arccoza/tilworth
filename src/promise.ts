export type ResultGetters<T, U> = { get val(): T, get err(): U }
export type ResultPair<T, U> = readonly [T, U] & ResultGetters<T, U>
export type PromiseResult<T, U extends {}> = ResultPair<T, undefined> | ResultPair<undefined, U>

function result<T, U>(val: T, err: U) {
  const res = [val, err] as const

  return Object.defineProperties(res, {
    val: {
      get() {
        return this[0]
      }
    },
    err: {
      get() {
        return this[1]
      }
    },
  }) as ResultPair<T, U>
}

/**
 * A cleaner alternative to `try`/`catch` blocks that captures the rejection or resolution of a Promise as a ResultPair tuple.
 * The ResultPair contains either the resolved value and undefined, or undefined and the rejection error,
 * accessible via `val`/`err` getters or array destructuring.
 *
 * Example:
 * ```ts
 * const r = await resultOf(Promise.resolve("Hello"))
 * const [val, err] = r // ["Hello", undefined]
 * r.val // "Hello"
 * r.err // undefined
 * ```
 * ```ts
 * const r = await resultOf(Promise.reject("Error"))
 * const [val, err] = r // [undefined, "Error"]
 * r.val // undefined
 * r.err // "Error"
 * ```
 *
 * @param p A Promise.
 * @returns A new Promise that resolves to a ResultPair.
 */
export async function resultOf<T, E extends {}>(p: Promise<T>): Promise<PromiseResult<T, E>> {
  return p
    .then((val) => result(val, undefined))
    // Typescript can't distinguish between `any` and `null | undefined`, because `any` includes `null | undefined`.
    // A promise error is always `any`, making the return type of `[T, undefined] | [undefined, any]`
    // ambiguous when trying to narrow the type with type checks or guards.
    // What we need is an `any - (null | undefined)` type, see: https://github.com/microsoft/TypeScript/issues/7648
    // We can use `{}` in the interim.
    .catch((err) => result(undefined, err as E))
}

/**
 * Creates a Promise that is resolved with an array of results when all of the provided Promises
 * resolve, or rejected when any one of the provided Promises is rejected, with the first rejection error.
 * @param values An array of Promises.
 * @returns A new Promise.
 */
export async function allOf<T extends readonly unknown[] | []>(...values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>{
  return Promise.all(values)
}

/**
 * Creates a Promise that is resolved with the first of the provided Promises to resolve,
 * or rejected with an `AggregateError` containing an array of rejection reasons if all of the given promises are rejected.
 * @param values An array of Promises.
 * @returns A new Promise.
 */
export async function anyOf<T extends readonly unknown[] | []>(...values: T): Promise<Awaited<T[number]>>{
  return Promise.any(values)
}

/**
 * Creates a Promise that is resolved with an array of `PromiseSettledResult` results when all
 * of the provided Promises have settled (resolved or rejected).
 * @param values An array of Promises.
 * @returns A new Promise.
 */
export async function eachOf<T extends readonly unknown[] | []>(...values: T): Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>; }> {
  return Promise.allSettled(values)
}

/**
 * Creates a Promise that is resolved or rejected with the state of the first of the provided Promises to resolve
 * or reject.
 * @param values An array of Promises.
 * @returns A new Promise.
 */
export async function firstOf<T extends readonly unknown[] | []>(...values: T): Promise<Awaited<T[number]>>{
  return Promise.race(values)
}

/**
 * Takes a callback of any kind (returns or throws, synchronously or asynchronously) and wraps
 * its result in a Promise. Also accepts a value, which is wrapped in a Promise.
 * @param callback A callback of any kind (returns or throws, synchronously or asynchronously) or a value.
 * @param args Arguments to pass to the callback.
 * @returns A new Promise.
 */
export async function tryMe<T, Args extends readonly unknown[]>(
  callback: (...args: Args) => (T | Promise<T>),
  ...args: Args
): Promise<T>
export async function tryMe<T>(callback: T): Promise<T>
export async function tryMe<T, Args extends readonly unknown[] = []>(
  callback: T | ((...args: Args) => (T | Promise<T>)),
  ...args: Args
): Promise<T> {
  if (typeof callback === "function") {
    const fn = callback as (...args: Args) => (T | Promise<T>)
    return new Promise((resolve) => resolve(fn(...args)))
  }

  return Promise.resolve(callback as T)
}
