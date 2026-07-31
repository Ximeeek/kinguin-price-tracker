# Developer Language Standards & Guidelines

## 1. Primary Language Rule
* **ALL** developer-facing content inside the codebase must be written strictly in **English**.
* This rule applies to:
  * Source code inline comments (`//`, `/* ... */`)
  * JSDoc / TSDoc documentation comments
  * Log messages (`Logger.info`, `Logger.warn`, `Logger.error`, `console.log`, etc.)
  * Error messages thrown internally by services or backend modules
  * Git commit titles, bodies, and tag descriptions
  * File header descriptions, technical README files, and rule files

## 2. Rationale
* Standardizing developer artifacts in English ensures accessibility, readability, clean collaboration, and seamless integration with automated CI/CD tools, LLM assistants, and international code reviews.

## 3. Scope vs End-User Internationalization (i18n)
* **Developer Artifacts**: Comments, debug logs, internal error types, architecture documents — **Always English**.
* **End-User Artifacts**: UI text, button labels, user-facing error notices — Handled dynamically via the **i18n translation system**.
