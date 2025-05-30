import { describe, it, expect } from "vitest"
import { resultOf, allOf, anyOf, eachOf, firstOf, tryMe } from "./promise"


describe("Promise Utilities", () => {
  describe("resultOf", () => {
    it("should capture resolved values", async () => {
      const result = await resultOf(Promise.resolve("success"))

      expect(result.val).toBe("success")
      expect(result.err).toBeUndefined()
      expect(result[0]).toBe("success")
      expect(result[1]).toBeUndefined()
    })

    it("should capture rejected errors", async () => {
      const error = new Error("test error")
      const result = await resultOf(Promise.reject(error))

      expect(result.val).toBeUndefined()
      expect(result.err).toBe(error)
      expect(result[0]).toBeUndefined()
      expect(result[1]).toBe(error)
    })
  })

  describe("allOf", () => {
    it("should resolve when all promises resolve", async () => {
      const result = await allOf(
        Promise.resolve(1),
        Promise.resolve("hello"),
        Promise.resolve(true)
      )

      expect(result).toEqual([1, "hello", true])
    })

    it("should reject when any promise rejects", async () => {
      const error = new Error("test error")

      await expect(allOf(
        Promise.resolve(1),
        Promise.reject(error),
        Promise.resolve(true)
      )).rejects.toBe(error)
    })
  })

  describe("anyOf", () => {
    it("should resolve with the first resolved value", async () => {
      const result = await anyOf(
        new Promise(resolve => setTimeout(() => resolve("second"), 10)),
        Promise.resolve("first"),
        new Promise(resolve => setTimeout(() => resolve("third"), 20))
      )

      expect(result).toBe("first")
    })

    it("should reject with AggregateError when all promises reject", async () => {
      const error1 = new Error("error 1")
      const error2 = new Error("error 2")

      await expect(anyOf(
        Promise.reject(error1),
        Promise.reject(error2)
      )).rejects.toBeInstanceOf(AggregateError)
    })
  })

  describe("eachOf", () => {
    it("should return settled results for all promises", async () => {
      const error = new Error("test error")
      const results = await eachOf(
        Promise.resolve("success"),
        Promise.reject(error),
        Promise.resolve(42)
      )

      expect(results[0]).toEqual({ status: "fulfilled", value: "success" })
      expect(results[1]).toEqual({ status: "rejected", reason: error })
      expect(results[2]).toEqual({ status: "fulfilled", value: 42 })
    })
  })

  describe("firstOf", () => {
    it("should resolve with the first promise to settle", async () => {
      const result = await firstOf(
        new Promise(resolve => setTimeout(() => resolve("second"), 10)),
        Promise.resolve("first"),
        new Promise(resolve => setTimeout(() => resolve("third"), 20))
      )

      expect(result).toBe("first")
    })

    it("should reject with the first promise to reject", async () => {
      const error = new Error("test error")

      await expect(firstOf(
        new Promise((_, reject) => setTimeout(() => reject(error), 1)),
        new Promise(resolve => setTimeout(() => resolve("success"), 10))
      )).rejects.toBe(error)
    })
  })

  describe("tryMe", () => {
    it("should wrap synchronous functions", async () => {
      const fn = (x: number, y: number) => x + y
      const result = await tryMe(fn, 2, 3)

      expect(result).toBe(5)
    })

    it("should wrap asynchronous functions", async () => {
      const fn = async (x: number) => x * 2
      const result = await tryMe(fn, 5)

      expect(result).toBe(10)
    })

    it("should wrap values", async () => {
      const result = await tryMe(42)

      expect(result).toBe(42)
    })

    it("should handle throwing functions", async () => {
      const fn = () => { throw new Error("sync error") }

      await expect(tryMe(fn)).rejects.toThrow("sync error")
    })

    it("should handle rejecting async functions", async () => {
      const fn = async () => { throw new Error("async error") }

      await expect(tryMe(fn)).rejects.toThrow("async error")
    })
  })
})
