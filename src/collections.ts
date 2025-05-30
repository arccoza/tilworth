export class BetterSet<T> extends Set<T> {
  declare ["constructor"]: typeof BetterSet

  clone() {
    return new this.constructor(this)
  }

  // Symmetric difference
  toggle(it: IterableIterator<T>) {
    return op(this.clone(), it, (s, v) => s.has(v) ? s.delete(v) : s.add(v))
  }

  // Difference
  subtract(it: IterableIterator<T>) {
    return op(this.clone(), it, (s, v) => s.delete(v))
  }

  // Union
  merge(it: IterableIterator<T>) {
    return op(this.clone(), it, (s, v) => s.add(v))
  }

  // Intersection o.O
  intersect(it: IterableIterator<T>) {
    return op(new this.constructor<T>(), it, (s, v) => this.has(v) && s.add(v))
  }

  toArray() {
    return [...this.values()]
  }
}

function op<T>(s: BetterSet<T>, it: IterableIterator<T>, fn: (s: BetterSet<T>, v: T) => void) {
  for (const v of it) {
    fn(s, v)
  }

  return s
}
