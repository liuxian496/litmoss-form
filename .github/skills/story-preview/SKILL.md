---
name: story-preview
description: >
  Preview Storybook 10 pages in the browser.
  Use when: user wants to view component rendering, verify docs, open a story after changes,
  check component display, preview storybook, or mentions "storybook", "preview", "open storybook".
  Do NOT start Storybook - assume it's already running on port 6006.
argument-hint: '[component name] [--docs|--canvas|--story]'
---

# Storybook Preview (Storybook 10)

Preview a Storybook component in the browser. Storybook is assumed to be running externally
at `http://localhost:6006` (unless the user specifies a different port).

## When to Use

- User wants to preview a component in Storybook
- User mentions a component name (e.g., "preview Form", "open Mounter in Storybook")
- User asks to view docs or canvas for a story
- User makes code changes and wants to verify them visually

## Project Story Map

This project's stories live in `src/stories/*.stories.tsx`. The known story files and their
titles and exports are:

| Stories File                         | Title              | Exports (story names)                                                                                                                                                                            |
| ------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/stories/nativeForm.stories.tsx` | `Test/Form`        | `TextField`, `Checkbox`, `DuplicateValuePath`, `ValidationBasic`, `ValidationByStep`, `ValidationBranch`, `FormUtil`, `FormUtilBranch`, `UseHelperInfo` ⚠️, `MultiForm`, `Focus`, `InitialValue` |
| `src/stories/litmossForm.stories.tsx` | `Test/litmoss Form` | `TextField`, `Checkbox`, `InitialValue`                                                                                                                                                          |
| `src/stories/mounter.stories.tsx`    | `Test/Mounter`     | `CascadingForm`                                                                                                                                                                                  |

⚠️ `UseHelperInfo` has `name: 'UseHelperInfo Branch'` → its URL slug uses `usehelperinfo-branch`.

## Procedure

### Step 1: Parse User Input

Determine what the user wants to open:

- **Component name only** (e.g., "Form"): search the story map above and find the matching story file.
  - If multiple matches exist, pick the most relevant one or ask the user.
- **Export/story name** (e.g., "Form TextField"): match the title first, then the export.
- **PascalCase/kebab-case/space-separated** are all acceptable.
- **Title--Name format** (e.g., `test-form--text-field`): use directly as slugs.

### Step 2: Determine Page Type

- **`--docs` / `文档` / `docs` / `MDX`** → use `/docs/` path
- **`--canvas` / `纯净模式` / `only canvas` / `viewMode`** → use `/story/` path with `&viewMode=story`
- **Default (no flag)** → use `/story/` path with addon panels visible

### Step 3: Construct the Slug

**Title slug** (from the `title` field in Meta):

- Remove the leading path segment before `/` if present (e.g., `Test/Form` → `test-form`)
- Convert to lowercase kebab-case: spaces → hyphens, PascalCase → kebab-case

**Name slug** (from the story export):

- Convert PascalCase to kebab-case: `TextField` → `text-field`
- ⚠️ If the story has a `name` override (e.g., `name: 'UseHelperInfo Branch'`), use the overridden name converted to kebab-case: `UseHelperInfo Branch` → `usehelperinfo-branch`
- Whitspace is preserved as hyphens

### Step 4: Build the Full URL

```
http://localhost:6006/?path=/<docs|story>/<title-slug>--<name-slug>[&viewMode=story]
```

### Step 5: Open the Browser

Use `run_terminal_command` with the macOS `open` command:

```bash
open "http://localhost:6006/?path=/story/test-form--text-field"
```

For Windows: `start "" "URL"`, for Linux: `xdg-open "URL"`.

### Step 6: Handle Errors

- **Connection refused / timeout**: Ask _"Storybook 似乎未运行或端口不是 6006。请确认 Storybook 已在终端启动（yarn storybook），并告知实际端口号。"_
- **404 page**: The slug may be wrong. Ask user to check the exact path from Storybook sidebar.

## Concrete Examples

Given the actual project stories:

| User Input                      | Resolves To                                   | Full URL                                                                        |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| `Form`                          | `Test/Form` → default story (first export)    | `http://localhost:6006/?path=/story/test-form--text-field`                      |
| `form text field`               | `Test/Form` + `TextField`                     | `http://localhost:6006/?path=/story/test-form--text-field`                      |
| `Form --docs`                   | `Test/Form` docs page                         | `http://localhost:6006/?path=/docs/test-form--text-field`                       |
| `ValidationBasic --canvas`      | `Test/Form` + `ValidationBasic` + viewMode    | `http://localhost:6006/?path=/story/test-form--validation-basic&viewMode=story` |
| `Litmoss Form Checkbox`          | `Test/Litmoss Form` + `Checkbox`               | `http://localhost:6006/?path=/story/test-litmoss-form--checkbox`                 |
| `mounter cascading form --docs` | `Test/Mounter` + `CascadingForm` docs         | `http://localhost:6006/?path=/docs/test-mounter--cascading-form`                |
| `UseHelperInfo Branch`          | `Test/Form` + `UseHelperInfo` (name override) | `http://localhost:6006/?path=/story/test-form--usehelperinfo-branch`            |

## Slug Conversion Rules Summary

| Input (PascalCase)   | Slug (kebab-case)                                                                    |
| -------------------- | ------------------------------------------------------------------------------------ |
| `TextField`          | `text-field`                                                                         |
| `ValidationBasic`    | `validation-basic`                                                                   |
| `UseHelperInfo`      | `usehelperinfo` → but if `name: 'UseHelperInfo Branch'`, then `usehelperinfo-branch` |
| `CascadingForm`      | `cascading-form`                                                                     |
| `DuplicateValuePath` | `duplicate-value-path`                                                               |
| `MultiForm`          | `multi-form`                                                                         |
| `FormUtil`           | `form-util`                                                                          |
| `FormUtilBranch`     | `form-util-branch`                                                                   |
| `InitialValue`       | `initial-value`                                                                      |

## Notes

- **Do NOT start or restart Storybook.** It's the user's responsibility.
- Port is **6006** by default, configurable in `package.json` → `"storybook": "storybook dev -p 6006"`.
- If the user input doesn't match any known story, search `src/stories/` for the closest match
  using `grep_search` or `file_glob_search`.
- When multiple stories match (e.g., "Checkbox" exists in both `Test/Form` and `Test/litmoss Form`),
  prefer `Test/Form` (the native form, more comprehensive) unless user specifies "Litmoss".
