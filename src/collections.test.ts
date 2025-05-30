import { describe, it, expect } from "vitest"
import { BetterSet } from "./collections"


describe("BetterSet", () => {
  describe("clone", () => {
    it("should create a new BetterSet with the same values", () => {
      const original = new BetterSet([1, 2, 3])
      const cloned = original.clone()

      expect(cloned).toBeInstanceOf(BetterSet)
      expect(cloned).not.toBe(original)
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })
  })

  describe("toggle (symmetric difference)", () => {
    it("should add values that are not present", () => {
      const set = new BetterSet([1, 2])
      const result = set.toggle([3, 4].values())

      expect(result.toArray().sort()).toEqual([1, 2, 3, 4])
    })

    it("should remove values that are present", () => {
      const set = new BetterSet([1, 2, 3])
      const result = set.toggle([2, 3].values())

      expect(result.toArray()).toEqual([1])
    })

    it("should both add and remove values in one operation", () => {
      const set = new BetterSet([1, 2])
      const result = set.toggle([2, 3].values())

      expect(result.toArray().sort()).toEqual([1, 3])
    })
  })

  describe("subtract (difference)", () => {
    it("should remove values that exist in both sets", () => {
      const set = new BetterSet([1, 2, 3, 4])
      const result = set.subtract([2, 4].values())

      expect(result.toArray().sort()).toEqual([1, 3])
    })

    it("should not affect values that do not exist in the original set", () => {
      const set = new BetterSet([1, 2])
      const result = set.subtract([3, 4].values())

      expect(result.toArray().sort()).toEqual([1, 2])
    })
  })

  describe("merge (union)", () => {
    it("should combine values from both sets", () => {
      const set = new BetterSet([1, 2])
      const result = set.merge([3, 4].values())

      expect(result.toArray().sort()).toEqual([1, 2, 3, 4])
    })

    it("should not duplicate existing values", () => {
      const set = new BetterSet([1, 2])
      const result = set.merge([2, 3].values())

      expect(result.toArray().sort()).toEqual([1, 2, 3])
    })
  })

  describe("intersect", () => {
    it("should keep only values that exist in both sets", () => {
      const set = new BetterSet([1, 2, 3])
      const result = set.intersect([2, 3, 4].values())

      expect(result.toArray().sort()).toEqual([2, 3])
    })

    it("should return empty set when no intersection exists", () => {
      const set = new BetterSet([1, 2])
      const result = set.intersect([3, 4].values())

      expect(result.toArray()).toEqual([])
    })
  })

  describe("toArray", () => {
    it("should convert set to array", () => {
      const set = new BetterSet([3, 1, 2])
      const array = set.toArray()

      expect(Array.isArray(array)).toBe(true)
      expect(array.sort()).toEqual([1, 2, 3])
    })

    it("should return empty array for empty set", () => {
      const set = new BetterSet()
      expect(set.toArray()).toEqual([])
    })
  })
})
