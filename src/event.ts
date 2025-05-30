/**
 * Adds an event listener to an element and returns a function to remove it.
 * This function has two overloads:
 * 1. For typed window events with proper TypeScript event types
 * 2. For general DOM events
 *
 * @template K - The type of window event (only used in the first overload)
 * @param {Window | Document | Element} elm - The element to attach the event listener to
 * @param {K | string} type - The event type to listen for
 * @param {((this: Window, ev: WindowEventMap[K]) => any) | EventListenerOrEventListenerObject} listener - The event listener function or object
 * @param {boolean | AddEventListenerOptions} [options] - Optional options for the event listener
 * @returns {() => void} A function that removes the event listener when called
 */
export function listen<K extends keyof WindowEventMap>(elm: Window | Document | Element, type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void
export function listen(elm: Window | Document | Element, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void
export function listen(elm: Window | Document | Element, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void {
  elm.addEventListener(type, listener, options)

  return () => elm.removeEventListener(type, listener)
}
