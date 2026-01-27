/** Language detection patterns */
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  javascript: [/\bconst\b/, /\blet\b/, /\bfunction\b/, /=>\s*{/, /console\.log/],
  typescript: [/:\s*(string|number|boolean|any)\b/, /interface\s+\w+/, /<\w+>/],
  python: [/\bdef\s+\w+/, /\bimport\s+\w+/, /\bprint\(/, /:\s*$/m],
  rust: [/\bfn\s+\w+/, /\blet\s+mut\b/, /\bimpl\b/, /->/, /::/, /&str/],
  go: [/\bfunc\s+\w+/, /\bpackage\s+\w+/, /\bimport\s+"/, /:=/, /\bgo\s+\w+/],
  java: [/\bpublic\s+class\b/, /\bprivate\b/, /\bvoid\b/, /System\.out/],
  html: [/<\/?[a-z]+[^>]*>/i, /<!DOCTYPE/i],
  css: [/\{[^}]*:[^}]*\}/, /@media/, /\.[\w-]+\s*\{/],
  sql: [/\bSELECT\b/i, /\bFROM\b/i, /\bWHERE\b/i, /\bINSERT\b/i],
  json: [/^\s*\{[\s\S]*\}\s*$/, /^\s*\[[\s\S]*\]\s*$/, /"[^"]+"\s*:/],
}

/** Detect programming language from code content */
export function detectCodeLanguage(content: string): string {
  // Check for explicit language in code fence
  const fenceMatch = content.match(/^```(\w+)/)
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1].toLowerCase()
  }

  // Extract code content (remove fences)
  const code = content.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')

  // Score each language
  const scores: Record<string, number> = {}

  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    scores[lang] = patterns.filter((pattern) => pattern.test(code)).length
  }

  // Find highest scoring language
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])

  if (sorted[0] && sorted[0][1] > 0) {
    return sorted[0][0]
  }

  return 'plaintext'
}
