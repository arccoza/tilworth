export function listen<K extends keyof WindowEventMap>(elm: Window | Document | Element, type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void
export function listen(elm: Window | Document | Element, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void
export function listen(elm: Window | Document | Element, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void {
  elm.addEventListener(type, listener, options)

  return () => elm.removeEventListener(type, listener)
}
