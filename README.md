# Tilworth

A collection of utility functions and types for common JavaScript/TypeScript tasks.

## Installation

```bash
npm install tilworth
```

## Table of Contents

- [Tilworth](#tilworth)
  - [Installation](#installation)
  - [Table of Contents](#table-of-contents)
  - [API Reference](#api-reference)
    - [Buffer Utilities](#buffer-utilities)
      - [`buffer.concat<T extends TypedArrays>(...bufs: T[])`](#bufferconcatt-extends-typedarraysbufs-t)
      - [`buffer.pad(buf: Uint8Array, len: number)`](#bufferpadbuf-uint8array-len-number)
      - [`buffer.padRand(buf: Uint8Array)`](#bufferpadrandbuf-uint8array)
    - [Event Utilities](#event-utilities)
      - [`listen<K extends keyof WindowEventMap>(elm: Window | Document | Element, type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions)`](#listenk-extends-keyof-windoweventmapelm-window--document--element-type-k-listener-this-window-ev-windoweventmapk--any-options-boolean--addeventlisteneroptions)
    - [Path Utilities](#path-utilities)
      - [`joinPath(...args: string[])`](#joinpathargs-string)
      - [`trimSlashes(s: string)`](#trimslashess-string)
    - [Blob Utilities](#blob-utilities)
      - [`blob.toDataUrl(blob: Blob, reader?: FileReader)`](#blobtodataurlblob-blob-reader-filereader)
      - [`blob.toBase64(blob: Blob, reader?: FileReader)`](#blobtobase64blob-blob-reader-filereader)
    - [Async Utilities](#async-utilities)
      - [`delay(ms: number, fn: () => void)`](#delayms-number-fn---void)
      - [`wait(ms: number, abort?: AbortController)`](#waitms-number-abort-abortcontroller)
    - [Promise Utilities](#promise-utilities)
      - [`allOf<T extends readonly unknown[] | []>(...values: T)`](#alloft-extends-readonly-unknown--values-t)
      - [`eachOf<T extends readonly unknown[] | []>(...values: T)`](#eachoft-extends-readonly-unknown--values-t)
      - [`tryMe<T, Args extends readonly unknown[]>(callback: (...args: Args) => (T | Promise<T>), ...args: Args)`](#trymet-args-extends-readonly-unknowncallback-args-args--t--promiset-args-args)
    - [Transcoders](#transcoders)
      - [Base64 Utilities](#base64-utilities)
        - [`base64.encode(buf: ArrayBuffer, urlSafe?: boolean)`](#base64encodebuf-arraybuffer-urlsafe-boolean)
        - [`base64.decode(base64: string, urlSafe?: boolean)`](#base64decodebase64-string-urlsafe-boolean)
      - [Hex Utilities](#hex-utilities)
        - [`hex.encode(buf: ArrayBuffer)`](#hexencodebuf-arraybuffer)
        - [`hex.decode(hex: string)`](#hexdecodehex-string)
      - [UTF-8 Utilities](#utf-8-utilities)
        - [`utf8.encode(text: string)`](#utf8encodetext-string)
        - [`utf8.decode(buf: ArrayBuffer)`](#utf8decodebuf-arraybuffer)
  - [License](#license)

## API Reference

### Buffer Utilities

#### `buffer.concat<T extends TypedArrays>(...bufs: T[])`
Concatenates multiple typed arrays into a single new typed array of the same type.

```typescript
import { buffer } from 'tilworth'

const arr1 = new Uint8Array([1, 2, 3])
const arr2 = new Uint8Array([4, 5, 6])
const result = buffer.concat(arr1, arr2)
// result is a new Uint8Array([1, 2, 3, 4, 5, 6])
```

#### `buffer.pad(buf: Uint8Array, len: number)`
Pads a Uint8Array with `len` zeros.

```typescript
const buf = new Uint8Array([1, 2, 3])
const padded = buffer.pad(buf, 2)
// padded is a new Uint8Array with 2 zeros followed by [1, 2, 3]
```

#### `buffer.padRand(buf: Uint8Array)`
Pads a Uint8Array with a random number of zeros.

```typescript
const buf = new Uint8Array([1, 2, 3])
const padded = buffer.padRand(buf)
// padded is a new Uint8Array with random number of zeros followed by [1, 2, 3]
```

### Event Utilities

#### `listen<K extends keyof WindowEventMap>(elm: Window | Document | Element, type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions)`
Adds an event listener to an element and returns a function to remove it. Supports both typed window events and general DOM events.

```typescript
import { listen } from 'tilworth'

// Typed window event
const cleanup = listen(window, 'click', (ev) => {
  console.log(ev.clientX, ev.clientY)
})

// General DOM event
const cleanup2 = listen(document.body, 'custom-event', (ev) => {
  console.log(ev)
})

// Later, remove the listeners
cleanup()
cleanup2()
```

### Path Utilities

#### `joinPath(...args: string[])`
Joins multiple path segments into a single path string, handling slashes appropriately. Empty segments are ignored, and leading/trailing slashes are trimmed.

```typescript
import { joinPath } from 'tilworth'

joinPath('foo', 'bar', 'baz') // returns "foo/bar/baz"
joinPath('/foo/', '/bar/', '/baz/') // returns "foo/bar/baz"
joinPath('foo', '', 'bar') // returns "foo/bar"
```

#### `trimSlashes(s: string)`
Removes leading and trailing slashes from a string.

```typescript
import { trimSlashes } from 'tilworth'

trimSlashes('/foo/bar/') // returns "foo/bar"
trimSlashes('foo/bar') // returns "foo/bar"
```

### Blob Utilities

#### `blob.toDataUrl(blob: Blob, reader?: FileReader)`
Converts a Blob to a data URL.

```typescript
import { blob } from 'tilworth'

const dataUrl = await blob.toDataUrl(myBlob)
// dataUrl is a string like "data:image/png;base64,..."
```

#### `blob.toBase64(blob: Blob, reader?: FileReader)`
Converts a Blob to a base64 string.

```typescript
import { blob } from 'tilworth'

const base64 = await blob.toBase64(myBlob)
// base64 is a string like "iVBORw0KGgoAAAANSUhEUgAA..."
```

### Async Utilities

#### `delay(ms: number, fn: () => void)`
Executes a function after a delay and returns a function to cancel the execution.

```typescript
import { delay } from 'tilworth'

const cancel = delay(1000, () => {
  console.log('Delayed execution')
})

// Cancel the delayed execution
cancel()
```

#### `wait(ms: number, abort?: AbortController)`
Returns a Promise that resolves after the specified delay. Can be aborted.

```typescript
import { wait } from 'tilworth'

const controller = new AbortController()

// Wait for 1 second
await wait(1000)

// Wait with abort capability
try {
  await wait(1000, controller)
} catch (err) {
  // Handle abort
}

// Abort the wait
controller.abort()
```

### Promise Utilities

#### `allOf<T extends readonly unknown[] | []>(...values: T)`
Creates a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any one of the provided Promises is rejected.

```typescript
import { allOf } from 'tilworth'

const results = await allOf(
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
)
// results is [1, 2, 3]
```

#### `eachOf<T extends readonly unknown[] | []>(...values: T)`
Creates a Promise that is resolved with an array of `PromiseSettledResult` results when all of the provided Promises have settled.

```typescript
import { eachOf } from 'tilworth'

const results = await eachOf(
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
)
// results contains both fulfilled and rejected promises
```

#### `tryMe<T, Args extends readonly unknown[]>(callback: (...args: Args) => (T | Promise<T>), ...args: Args)`
Takes a callback of any kind (returns or throws, synchronously or asynchronously) and wraps its result in a Promise.

```typescript
import { tryMe } from 'tilworth'

// With a function
const result1 = await tryMe(() => 42)
// result1 is 42

// With a value
const result2 = await tryMe(42)
// result2 is 42

// With async function
const result3 = await tryMe(async () => 42)
// result3 is 42
```

### Transcoders

#### Base64 Utilities

##### `base64.encode(buf: ArrayBuffer, urlSafe?: boolean)`
Encodes an ArrayBuffer to a base64 string. Optionally converts the output to URL-safe base64 format.

```typescript
import { base64 } from 'tilworth'

const buf = new Uint8Array([1, 2, 3]).buffer
const encoded = base64.encode(buf)
// encoded is "AQID"

// URL-safe encoding
const urlSafe = base64.encode(buf, true)
// urlSafe is "AQID" with URL-safe characters
```

##### `base64.decode(base64: string, urlSafe?: boolean)`
Decodes a base64 string to a Uint8Array. Handles both standard and URL-safe base64 formats.

```typescript
import { base64 } from 'tilworth'

const decoded = base64.decode('AQID')
// decoded is a Uint8Array([1, 2, 3])

// URL-safe decoding
const decoded2 = base64.decode('AQID', true)
// decoded2 is a Uint8Array([1, 2, 3])
```

#### Hex Utilities

##### `hex.encode(buf: ArrayBuffer)`
Encodes an ArrayBuffer to a hexadecimal string. Each byte is converted to a two-character hex string, padded with leading zeros if necessary.

```typescript
import { hex } from 'tilworth'

const buf = new Uint8Array([1, 2, 3]).buffer
const encoded = hex.encode(buf)
// encoded is "010203"
```

##### `hex.decode(hex: string)`
Decodes a hexadecimal string to a Uint8Array. Handles odd-length strings by padding with a leading zero.

```typescript
import { hex } from 'tilworth'

const decoded = hex.decode("010203")
// decoded is Uint8Array([1, 2, 3])
```

#### UTF-8 Utilities

##### `utf8.encode(text: string)`
Encodes a string to UTF-8 bytes.

```typescript
import { utf8 } from 'tilworth'

const encoded = utf8.encode("Hello")
// encoded is Uint8Array([72, 101, 108, 108, 111])
```

##### `utf8.decode(buf: ArrayBuffer)`
Decodes UTF-8 bytes to a string.

```typescript
import { utf8 } from 'tilworth'

const decoded = utf8.decode(new Uint8Array([72, 101, 108, 108, 111]).buffer)
// decoded is "Hello"
```

## License

MIT