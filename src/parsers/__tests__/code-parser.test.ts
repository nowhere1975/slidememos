import { describe, it, expect } from 'vitest'
import { detectCodeLanguage as detectLanguage } from '../code-parser'

describe('code-parser', () => {
  describe('detectLanguage', () => {
    describe('JavaScript/TypeScript detection', () => {
      it('should detect JavaScript', () => {
        const code = `
          const x = 1;
          let y = "string";
          function test() {
            return x + y;
          }
          console.log(test());
        `
        expect(detectLanguage(code)).toBe('javascript')
      })

      it('should detect TypeScript', () => {
        const code = `
          interface User {
            name: string;
            age: number;
          }
          const user: User = { name: "John", age: 30 };
          type ID = string | number;
        `
        expect(detectLanguage(code)).toBe('typescript')
      })

      it('should prefer TypeScript over JavaScript when both patterns present', () => {
        const code = `
          const x: number = 1;
          interface Props {}
          function test() { return 1; }
        `
        expect(detectLanguage(code)).toBe('typescript')
      })
    })

    describe('Python detection', () => {
      it('should detect Python', () => {
        const code = `
          def hello():
              print("Hello, World!")
              return 42

          if __name__ == "__main__":
              hello()
        `
        expect(detectLanguage(code)).toBe('python')
      })

      it('should detect Python with class syntax', () => {
        const code = `
          class User:
              def __init__(self, name):
                  self.name = name

              def greet(self):
                  return f"Hello, {self.name}!"
        `
        expect(detectLanguage(code)).toBe('python')
      })
    })

    describe('Rust detection', () => {
      it('should detect Rust', () => {
        const code = `
          fn main() {
              let x = 5;
              println!("Hello, world!");
          }

          fn add(a: i32, b: i32) -> i32 {
              a + b
          }
        `
        expect(detectLanguage(code)).toBe('rust')
      })
    })

    describe('Go detection', () => {
      it('should detect Go', () => {
        const code = `
          package main

          import "fmt"

          func main() {
              fmt.Println("Hello, World!")
          }

          func add(a, b int) int {
              return a + b
          }
        `
        expect(detectLanguage(code)).toBe('go')
      })

      it('should detect Go with goroutines', () => {
        const code = `
          go func() {
              ch <- "message"
          }()
          select {
          case msg := <- ch:
              fmt.Println(msg)
          }
        `
        expect(detectLanguage(code)).toBe('go')
      })
    })

    describe('Java detection', () => {
      it('should detect Java', () => {
        const code = `
          public class HelloWorld {
              public static void main(String[] args) {
                  System.out.println("Hello, World!");
              }
          }

          public int add(int a, int b) {
              return a + b;
          }
        `
        expect(detectLanguage(code)).toBe('java')
      })
    })

    describe('HTML/CSS detection', () => {
      it('should detect HTML', () => {
        const code = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Test</title>
            </head>
            <body>
              <div class="container">
                <p>Hello</p>
              </div>
            </body>
          </html>
        `
        expect(detectLanguage(code)).toBe('html')
      })

      it('should detect CSS', () => {
        const code = `
          .container {
            display: flex;
            justify-content: center;
            background-color: #fff;
            margin: 0 auto;
            padding: 20px;
          }

          @media (max-width: 768px) {
            .container {
              padding: 10px;
            }
          }
        `
        expect(detectLanguage(code)).toBe('css')
      })
    })

    describe('SQL detection', () => {
      it('should detect SQL', () => {
        const code = `
          SELECT id, name, email
          FROM users
          WHERE active = true
            AND created_at > '2024-01-01'
          ORDER BY created_at DESC
          LIMIT 10;
        `
        expect(detectLanguage(code)).toBe('sql')
      })

      it('should detect SQL INSERT/UPDATE', () => {
        const code = `
          INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
          UPDATE users SET name = 'Jane' WHERE id = 1;
          DELETE FROM users WHERE id = 1;
        `
        expect(detectLanguage(code)).toBe('sql')
      })
    })

    describe('JSON detection', () => {
      it('should detect JSON', () => {
        const code = `{
          "name": "John",
          "age": 30,
          "email": "john@example.com",
          "active": true,
          "tags": ["developer", "admin"]
        }`
        expect(detectLanguage(code)).toBe('json')
      })

      it('should detect JSON array', () => {
        const code = `[
          { "id": 1, "name": "Item 1" },
          { "id": 2, "name": "Item 2" }
        ]`
        expect(detectLanguage(code)).toBe('json')
      })
    })

    describe('Explicit language hint', () => {
      it('should prioritize explicit language in code fence', () => {
        const code = '```python\nconst x = 1;\n```'
        // Even though it looks like JavaScript, the hint says Python
        expect(detectLanguage(code)).toBe('python')
      })

      it('should handle language hint with varying case', () => {
        const code = '```JAVASCRIPT\nconst x = 1;\n```'
        expect(detectLanguage(code)).toBe('javascript')
      })
    })

    describe('Edge cases', () => {
      it('should return plaintext for empty code', () => {
        expect(detectLanguage('')).toBe('plaintext')
      })

      it('should return plaintext for whitespace only', () => {
        expect(detectLanguage('   \n\t  ')).toBe('plaintext')
      })

      it('should return plaintext for unrecognizable code', () => {
        expect(detectLanguage('some random text without specific patterns')).toBe('plaintext')
      })

      it('should handle mixed language patterns', () => {
        // When multiple languages match, the first one with highest score wins
        const codeWithJsAndPython = `
          const x = 1;
          def hello():
              return 42
        `
        const result = detectLanguage(codeWithJsAndPython)
        // It should detect one of them
        expect(['javascript', 'python', 'typescript']).toContain(result)
      })
    })
  })
})
