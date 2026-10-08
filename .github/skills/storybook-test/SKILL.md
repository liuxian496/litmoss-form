---
name: storybook-test
description: >
  Run Storybook component tests via vitest + @storybook/addon-vitest + Playwright.
  Use when: user wants to run storybook tests, test a story, run vitest for stories,
  mentions "test storybook", "run story test", "test this component", or is viewing
  a .stories.tsx or *Story.tsx file and wants to run tests.
argument-hint: '[story name] or leave empty to auto-detect from current file'
---

# Run Storybook Test

Runs Storybook component tests using vitest + `@storybook/addon-vitest` with Playwright
browser provider (Chromium).

## When to Use

- User wants to run tests for a Storybook story
- Current file is a `*.stories.tsx` file or a `*Story.tsx` test component
- User mentions: "run test", "test this", "test storybook", "run story test"
- User wants to test a specific component

## How It Works

1. **Identify current context** — check if the open file is:
   - A `.stories.tsx` file (e.g., `src/stories/nativeForm.stories.tsx`)
   - A `*Story.tsx` test component file (e.g., `src/stories/nativeForm/checkboxStory.tsx`)

2. **Locate test names** — map the file to its story exports and derive vitest test names.

3. **Run the test** using `npx vitest run --project=storybook -t "<test name>"`.

## Project Structure

This project uses a **colocated story+test** pattern (NOT `src/test/`):

```
src/stories/
  nativeForm.stories.tsx          # Story file: title='Test/Form'
  nativeForm/
    checkboxStory.tsx             # Test component + play() for Checkbox story
    textFieldStory.tsx            # Test component + play() for TextField story
    validationStory.tsx           # Test component + play() for ValidationBasic story
    ...                           # etc.
  litmossForm.stories.tsx          # Story file: title='Test/Litmoss Form'
  litmossForm/
    checkboxStory.tsx
    textFieldStory.tsx
    initialValueStory.tsx
  mounter.stories.tsx             # Story file: title='Test/Mounter'
  mounter/
    cascadingFormStory.tsx
```

## Project Story/Test Map

| Stories File                         | Title              | Export Name          | Test Name (for `-t`)   | Test File                                             |
| ------------------------------------ | ------------------ | -------------------- | ---------------------- | ----------------------------------------------------- |
| `src/stories/nativeForm.stories.tsx` | `Test/Form`        | `TextField`          | `Text Field`           | `src/stories/nativeForm/textFieldStory.tsx`           |
|                                      |                    | `Checkbox`           | `Checkbox`             | `src/stories/nativeForm/checkboxStory.tsx`            |
|                                      |                    | `DuplicateValuePath` | `Duplicate Value Path` | `src/stories/nativeForm/duplicateValuePathStory.tsx`  |
|                                      |                    | `ValidationBasic`    | `Validation Basic`     | `src/stories/nativeForm/validationStory.tsx`          |
|                                      |                    | `ValidationByStep`   | `Validation By Step`   | `src/stories/nativeForm/validationByStepStory.tsx`    |
|                                      |                    | `ValidationBranch`   | `Validation Branch`    | `src/stories/nativeForm/validationBranchStory.tsx`    |
|                                      |                    | `FormUtil`           | `Form Util`            | `src/stories/nativeForm/formUtilStory.tsx`            |
|                                      |                    | `FormUtilBranch`     | `Form Util Branch`     | `src/stories/nativeForm/formUtilBranchStory.tsx`      |
|                                      |                    | `UseHelperInfo` ⚠️   | `UseHelperInfo Branch` | `src/stories/nativeForm/useHelperInfoBranchStory.tsx` |
|                                      |                    | `MultiForm`          | `Multi Form`           | `src/stories/nativeForm/multiFormStory.tsx`           |
|                                      |                    | `Focus`              | `Focus`                | `src/stories/nativeForm/focusStory.tsx`               |
|                                      |                    | `InitialValue`       | `Initial Value`        | `src/stories/nativeForm/initialValueStory.tsx`        |
| `src/stories/litmossForm.stories.tsx` | `Test/Litmoss Form` | `TextField`          | `Text Field`           | `src/stories/litmossForm/textFieldStory.tsx`           |
|                                      |                    | `Checkbox`           | `Checkbox`             | `src/stories/litmossForm/checkboxStory.tsx`            |
|                                      |                    | `InitialValue`       | `Initial Value`        | `src/stories/litmossForm/initialValueStory.tsx`        |
| `src/stories/mounter.stories.tsx`    | `Test/Mounter`     | `CascadingForm`      | `Cascading Form`       | `src/stories/mounter/cascadingFormStory.tsx`          |

⚠️ `UseHelperInfo` has `name: 'UseHelperInfo Branch'` → its vitest test name is `UseHelperInfo Branch`, not `Use Helper Info`.

## Implementation Steps

### Step 1: Get Current File Path

Identify if the open file is:

- A `.stories.tsx` file → extract all exported story constants
- A `*Story.tsx` file in `src/stories/<component>/` → find the importing stories file and the corresponding export
- Some other file → search `src/stories/` for the most relevant story

### Step 2: Determine the Test Name

**From a `.stories.tsx` file:**

1. Parse the file and extract all `export const Xxx = ...` names
2. Convert each PascalCase export name to a space-separated test name:
   - `TextField` → `Text Field`
   - `ValidationBasic` → `Validation Basic`
   - `FormUtilBranch` → `Form Util Branch`
   - `DuplicateValuePath` → `Duplicate Value Path`
3. **⚠️ Exception**: if the export references a story object with a `name` property override
   (e.g., `UseHelperInfo` → `name: 'UseHelperInfo Branch'`), use the **overridden name** as-is.

**From a `*Story.tsx` file:**

1. Extract the exported const name (e.g., `CheckboxTest` → strip `Test` → `Checkbox`)
2. Search for the importing `.stories.tsx` file using `grep_search`
3. Match the import to the story export (e.g., `export const Checkbox = CheckboxTest`)
4. Derive the test name from the export name

**From user-provided name:**

1. Accept PascalCase, kebab-case, or space-separated
2. Convert to space-separated format
3. Validate against the story map above

### Step 3: Validate User Input

Before running, verify the test name exists in the corresponding stories file:

1. Build the allowed list from story exports
2. Convert to runnable test names
3. If the requested name is not in the list, show available options and stop

### Step 4: Execute Test

```bash
npx vitest run --project=storybook -t "<Test Name>"
```

- Always use `run` mode (not watch) so the process exits after completion.
- Use `run_terminal_command` to execute.

To run ALL tests in a story file (title prefix match):

```bash
npx vitest run --project=storybook -t "Test/Form"
```

### Step 5: Display Results

Show the vitest output to the user. If tests fail, highlight the failing assertions.

## Concrete Examples

### Example 1: From Story Test File

```
Current file: src/stories/nativeForm/checkboxStory.tsx
↓
Export: export const CheckboxTest: FormStory = { ... }
↓
Search: import { CheckboxTest } in .stories.tsx files
↓
Match: nativeForm.stories.tsx → export const Checkbox = CheckboxTest
↓
Test name: "Checkbox"
↓
Run: npx vitest run --project=storybook -t "Checkbox"
```

### Example 2: From Stories File

```
Current file: src/stories/nativeForm.stories.tsx
Exports: TextField, Checkbox, DuplicateValuePath, ValidationBasic, ...
↓
User says: "test ValidationBasic"
↓
Test name: "Validation Basic"
↓
Run: npx vitest run --project=storybook -t "Validation Basic"
```

### Example 3: User Specifies Story Name Directly

```
User: "run test for Form TextField"
↓
Match: nativeForm.stories.tsx → TextField
↓
Test name: "Text Field"
↓
Run: npx vitest run --project=storybook -t "Text Field"
```

### Example 4: User Specifies Name with Override

```
User: "test UseHelperInfo"
↓
Match: nativeForm.stories.tsx → UseHelperInfoBranchTest with name: 'UseHelperInfo Branch'
↓
Test name: "UseHelperInfo Branch"  (NOT "Use Helper Info")
↓
Run: npx vitest run --project=storybook -t "UseHelperInfo Branch"
```

### Example 5: Run All Tests in a Story

```bash
# All tests under Test/Form
npx vitest run --project=storybook -t "Test/Form"

# All tests under Test/Litmoss Form
npx vitest run --project=storybook -t "Test/Litmoss Form"
```

## Vitest Test Name Format

`@storybook/addon-vitest` generates test names in the format:

```
<title>/<story name>
```

Examples:
| Meta title | Story export | Vitest test name |
| --------------- | ---------------- | ------------------------------ |
| `Test/Form` | `TextField` | `Test/Form/Text Field` |
| `Test/Form` | `ValidationBasic`| `Test/Form/Validation Basic` |
| `Test/Mounter` | `CascadingForm` | `Test/Mounter/Cascading Form` |

When using `-t`, you can match a substring like `"Text Field"` or the full path `"Test/Form/Text Field"`.
If multiple tests match the pattern (e.g., `"Checkbox"` matches both `Test/Form/Checkbox` and
`Test/Litmoss Form/Checkbox`), vitest runs ALL matching tests.

## Tech Stack

- **Test runner**: vitest 4.x
- **Browser provider**: `@vitest/browser-playwright` (Chromium, headless)
- **Storybook integration**: `@storybook/addon-vitest` (Storybook 10)
- **Test utilities**: `@storybook/test` (`expect`, `userEvent`, `within`)
- **Config location**: `vite.config.mts` → `test.projects[0]`

## Error Handling

- If current file is not a story or test file → search `src/stories/` for relevant files
- If multiple stories files match → ask user which one
- If test name not found → show available names from the mapped stories file
- If command fails with "no tests found" → verify Storybook is configured and try the full path format
- If no `play()` function exists in the story → warn user that the story has no interactive tests
