import { describe, it, expect } from "vitest"
import { joinPath, trimSlashes } from "./paths"


describe("trimSlashes", () => {
  it("should trim leading slashes", () => {
    expect(trimSlashes("/hello")).toBe("hello")
    expect(trimSlashes("//hello")).toBe("hello")
    expect(trimSlashes("///hello")).toBe("hello")
  })

  it("should trim trailing slashes", () => {
    expect(trimSlashes("hello/")).toBe("hello")
    expect(trimSlashes("hello//")).toBe("hello")
    expect(trimSlashes("hello///")).toBe("hello")
  })

  it("should trim both leading and trailing slashes", () => {
    expect(trimSlashes("/hello/")).toBe("hello")
    expect(trimSlashes("//hello//")).toBe("hello")
    expect(trimSlashes("///hello///")).toBe("hello")
  })

  it("should preserve internal slashes", () => {
    expect(trimSlashes("/hello/world/")).toBe("hello/world")
    expect(trimSlashes("//api/v1//")).toBe("api/v1")
    expect(trimSlashes("///path/to/file///")).toBe("path/to/file")
  })

  it("should return empty string for slash-only strings", () => {
    expect(trimSlashes("/")).toBe("")
    expect(trimSlashes("//")).toBe("")
    expect(trimSlashes("///")).toBe("")
    expect(trimSlashes("////")).toBe("")
  })

  it("should handle empty string", () => {
    expect(trimSlashes("")).toBe("")
  })

  it("should handle strings without slashes", () => {
    expect(trimSlashes("hello")).toBe("hello")
    expect(trimSlashes("test")).toBe("test")
    expect(trimSlashes("123")).toBe("123")
  })

  it("should handle single character strings", () => {
    expect(trimSlashes("a")).toBe("a")
    expect(trimSlashes("/a")).toBe("a")
    expect(trimSlashes("a/")).toBe("a")
    expect(trimSlashes("/a/")).toBe("a")
  })
})

describe("joinPath", () => {
  describe("basic functionality", () => {
    it("should join two simple paths", () => {
      const result = joinPath("users", "profile")
      expect(result).toBe("users/profile")
    })

    it("should join multiple paths", () => {
      const result = joinPath("api", "v1", "users", "123", "posts")
      expect(result).toBe("api/v1/users/123/posts")
    })

    it("should handle single path", () => {
      const result = joinPath("single")
      expect(result).toBe("single")
    })

    it("should handle no arguments", () => {
      const result = joinPath()
      expect(result).toBe("")
    })
  })

  describe("slash handling", () => {
    it("should trim leading slashes", () => {
      const result = joinPath("/users", "/profile")
      expect(result).toBe("users/profile")
    })

    it("should trim trailing slashes", () => {
      const result = joinPath("users/", "profile/")
      expect(result).toBe("users/profile")
    })

    it("should trim both leading and trailing slashes", () => {
      const result = joinPath("/users/", "/profile/")
      expect(result).toBe("users/profile")
    })

    it("should handle multiple leading slashes", () => {
      const result = joinPath("//users", "///profile")
      expect(result).toBe("users/profile")
    })

    it("should handle multiple trailing slashes", () => {
      const result = joinPath("users//", "profile///")
      expect(result).toBe("users/profile")
    })

    it("should handle multiple leading and trailing slashes", () => {
      const result = joinPath("///users///", "////profile////")
      expect(result).toBe("users/profile")
    })

    it("should skip paths with only slashes", () => {
      const result = joinPath("/", "//", "users", "///")
      expect(result).toBe("users")
    })
  })

  describe("empty and falsy values", () => {
    it("should skip empty strings", () => {
      const result = joinPath("users", "", "profile")
      expect(result).toBe("users/profile")
    })

    it("should skip multiple empty strings", () => {
      const result = joinPath("", "users", "", "", "profile", "")
      expect(result).toBe("users/profile")
    })

    it("should handle all empty strings", () => {
      const result = joinPath("", "", "")
      expect(result).toBe("")
    })

    it("should skip null values", () => {
      const result = joinPath("users", null as any, "profile")
      expect(result).toBe("users/profile")
    })

    it("should skip undefined values", () => {
      const result = joinPath("users", undefined as any, "profile")
      expect(result).toBe("users/profile")
    })

    it("should handle mixed falsy values", () => {
      const result = joinPath("", null as any, "users", undefined as any, "", "profile", null as any)
      expect(result).toBe("users/profile")
    })
  })

  describe("complex scenarios", () => {
    it("should handle paths with internal slashes", () => {
      const result = joinPath("api/v1", "users/123", "posts/456")
      expect(result).toBe("api/v1/users/123/posts/456")
    })

    it("should handle mixed slash patterns", () => {
      const result = joinPath("/api/v1/", "//users//", "/123/posts/")
      expect(result).toBe("api/v1/users/123/posts")
    })

    it("should handle very long paths", () => {
      const result = joinPath("a", "b", "c", "d", "e", "f", "g", "h", "i", "j")
      expect(result).toBe("a/b/c/d/e/f/g/h/i/j")
    })

    it("should handle paths with spaces", () => {
      const result = joinPath("user files", "documents", "my file.txt")
      expect(result).toBe("user files/documents/my file.txt")
    })

    it("should handle paths with special characters", () => {
      const result = joinPath("files", "user@domain.com", "docs-v1.2")
      expect(result).toBe("files/user@domain.com/docs-v1.2")
    })
  })

  describe("edge cases", () => {
    it("should handle single slash", () => {
      const result = joinPath("/")
      expect(result).toBe("")
    })

    it("should skip multiple single slashes", () => {
      const result = joinPath("/", "/", "/")
      expect(result).toBe("")
    })

    it("should skip paths that become empty after trimming", () => {
      const result = joinPath("users", "///", "profile")
      expect(result).toBe("users/profile")
    })

    it("should skip paths with only slashes in middle", () => {
      const result = joinPath("start", "////", "end")
      expect(result).toBe("start/end")
    })

    it("should preserve single character paths", () => {
      const result = joinPath("a", "b", "c")
      expect(result).toBe("a/b/c")
    })

    it("should handle numeric-like strings", () => {
      const result = joinPath("123", "456", "789")
      expect(result).toBe("123/456/789")
    })

    it("should handle boolean-like strings", () => {
      const result = joinPath("true", "false", "null")
      expect(result).toBe("true/false/null")
    })
  })

  describe("real-world examples", () => {
    it("should handle API endpoint construction", () => {
      const baseUrl = "/api/v1/"
      const resource = "users"
      const id = "123"
      const action = "/posts/"

      const result = joinPath(baseUrl, resource, id, action)
      expect(result).toBe("api/v1/users/123/posts")
    })

    it("should handle file path construction", () => {
      const root = "/home/user/"
      const folder = "documents/"
      const subfolder = "/projects"
      const file = "readme.txt"

      const result = joinPath(root, folder, subfolder, file)
      expect(result).toBe("home/user/documents/projects/readme.txt")
    })

    it("should handle URL path construction", () => {
      const result = joinPath("/blog/", "/2023/", "/12/", "/my-post")
      expect(result).toBe("blog/2023/12/my-post")
    })

    it("should handle nested resource paths", () => {
      const org = "company"
      const team = "engineering"
      const project = "web-app"
      const branch = "feature/auth"

      const result = joinPath(org, team, project, branch)
      expect(result).toBe("company/engineering/web-app/feature/auth")
    })
  })
})
