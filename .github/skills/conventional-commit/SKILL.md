---
name: conventional-commit
description: "Create conventional git commits from staged or unstaged changes. Use when: committing code, making a git commit, conventional commit, saving changes to git."
argument-hint: "Optional: scope or extra context (e.g. 'session feature' or 'fix drag bug')"
---

# Conventional Git Commit

Generate a conventional commit message from the latest changes, then stage and commit.

## Procedure

1. **Inspect changes** — Run `git status` and `git diff` (or `git diff --staged` if files are already staged). Read the diff carefully.

2. **Determine the commit type** from the change:

   | Type       | When                                          |
   |------------|-----------------------------------------------|
   | `feat`     | New feature or user-facing capability          |
   | `fix`      | Bug fix                                        |
   | `refactor` | Code restructure with no behavior change       |
   | `style`    | Formatting, whitespace, CSS-only changes       |
   | `docs`     | Documentation only                             |
   | `test`     | Adding or updating tests                       |
   | `chore`    | Tooling, config, dependencies, build scripts   |
   | `perf`     | Performance improvement                        |
   | `ci`       | CI/CD configuration                            |
   | `build`    | Build system or external dependency changes    |

3. **Determine the scope** (optional) — Infer from the directory or feature area touched (e.g. `session`, `opfs`, `ui`, `workout`). Use a scope when the change is clearly contained to one area. Omit when it spans multiple areas.

4. **Write the subject line** following these rules:
   - Format: `type(scope): description` or `type: description`
   - Use imperative mood ("add", not "added" or "adds")
   - Lowercase first letter after the colon
   - No period at the end
   - Max 72 characters
   - Summarize *what* changed and *why* if not obvious

5. **Add a body** only when the subject alone doesn't explain the change. Separate from the subject with a blank line. Wrap at 72 characters. Explain *why*, not *what* (the diff shows what).

6. **Stage and commit**:
   - If nothing is staged, run `git add -A` to stage everything.
   - If some files are already staged, commit only the staged files (don't add more).
   - Run `git commit -m "<message>"` (or `-m "<subject>" -m "<body>"` when a body is needed).

7. **Confirm** — Show the commit hash and message to the user.

## Rules

- One commit per logical change. If the diff contains unrelated changes, ask the user whether to split into multiple commits.
- Never use `--no-verify` or skip hooks.
- If the user provides extra context via the argument, use it to inform the scope or description.
- When unsure between `feat` and `refactor`, ask: does this change behavior from the user's perspective? Yes → `feat`. No → `refactor`.
