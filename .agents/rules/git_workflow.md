# Git Commit and Push Workflow Rules

## 1. Push Constraints
* **DO NOT** push commits to GitHub automatically.
* All changes must be committed locally first.
* Only push to the remote repository (GitHub) when the user explicitly requests it (e.g., by saying "push", "send to GitHub", "push to origin", etc.).

## 2. Commit Message Guidelines
All commit messages must adhere to the following strict conventions:

### Subject Line (Title) Format
* Format: `<type>(<scope>): <description>`
  * Example: `feat(auth): add login validation`
* **Length:** Under 50 characters (max 72).
* **Capitalization:** Start the description with a capital letter.
* **Punctuation:** Do not end the subject line with a period.
* **Imperative Mood:** Use the imperative mood in English (e.g., `Add user auth` instead of `Added user auth` or `Adds user auth`). Think: *"If applied, this commit will..."*

### Available Types
| Type | Description |
|---|---|
| `feat` | A new feature for the user |
| `fix` | A bug fix |
| `docs` | Changes to documentation only |
| `style` | Formatting, missing semi-colons, etc.; no code change |
| `refactor` | Refactoring production code (no bug fixes, no new features) |
| `perf` | Performance improvements |
| `test` | Adding missing tests, refactoring tests |
| `chore` | Build tasks, package manager configs, .gitignore, etc. |
| `build` | Changes that affect the build system or external dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `revert` | Reverts a previous commit |

### Body and Footer Format
* For larger changes, separate the title from the body with a blank line.
* Wrap the body text at 72 characters.
* Focus the body on explaining **what** was changed and **why** (not how).
* Use the footer to reference issue numbers (e.g., `Closes #123`, `Fixes #456`).

### General Principles
* **Atomic Commits:** Keep commits atomic. Each commit should represent exactly one logical change.
* **Language:** Commit messages must always be in English.
