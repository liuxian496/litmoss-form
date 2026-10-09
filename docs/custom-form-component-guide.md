# 使用 useFormItemValue 与 useHelperInfo 封装表单组件指南

本文档以 [src/pockets/littenForm](../src/pockets/littenForm) 下的组件为例，介绍如何使用 `useFormItemValue` 与 `useHelperInfo` 这两个基础 Hook 封装一个受控的、支持校验提示的表单组件。

## 目录

- [使用 useFormItemValue 与 useHelperInfo 封装表单组件指南](#使用-useformitemvalue-与-usehelperinfo-封装表单组件指南)
  - [目录](#目录)
  - [1. 概述](#1-概述)
  - [2. `useFormItemValue` 详解](#2-useformitemvalue-详解)
  - [3. `useHelperInfo` 详解](#3-usehelperinfo-详解)
  - [4. 两种封装模式](#4-两种封装模式)
    - [模式 A：需要校验提示（组合使用两个 Hook）](#模式-a需要校验提示组合使用两个-hook)
    - [模式 B：无需校验提示（仅使用 `useFormItemValue`）](#模式-b无需校验提示仅使用-useformitemvalue)
    - [4.3 完整示例](#43-完整示例)
  - [5. 封装一个新表单组件的步骤](#5-封装一个新表单组件的步骤)
  - [6. 注意事项](#6-注意事项)

## 1. 概述

在litmoss-form的表单体系中，一个表单控件通常需要具备两种能力：

- **受控值管理**：将组件的值同步到表单上下文（`FormContext`）中，使外部表单容器可以统一获取值、设置值、触发校验、聚焦出错字段。
- **校验提示管理**：根据传入的校验规则（`validations`），在合适的时机（如 `onBlur`）执行校验，并维护当前的提示文本（`FormHelperInfo`）状态。

为了让职责单一、便于复用，这两部分能力被拆分成了两个独立的 Hook：

| Hook               | 职责                                                 | 源码位置                                                                              |
|--------------------|------------------------------------------------------|---------------------------------------------------------------------------------------|
| `useFormItemValue` | 管理表单项的值，并向 `FormContext` 注册/卸载该表单项 | [src/components/form/useFormItemValue.ts](../src/components/form/useFormItemValue.ts) |
| `useHelperInfo`    | 执行校验规则，管理校验提示文本状态                   | [src/components/form/useHelperInfo.ts](../src/components/form/useHelperInfo.ts)       |

两者可以独立使用，也可以组合使用：不需要校验提示的简单控件（如 `LittenCheckbox`）只使用 `useFormItemValue`；需要展示校验提示的控件（如 `LittenTextField`）则同时使用两者。

## 2. `useFormItemValue` 详解

```ts
function useFormItemValue<T, V = string>(
  valuePath: string,
  initialValue?: T,
  onValidate?: (value: V) => FormHelperInfo,
  setHelperText?: Dispatch<SetStateAction<FormHelperInfo>>,
  fieldRef?: React.RefObject<HTMLElement>
): [T, Dispatch<SetStateAction<T>>];
```

参数说明：

- `valuePath`：表单项的唯一路径，用于在表单上下文中标识该字段。
- `initialValue`：表单项的初始值（注意不是"默认值"，仅用于 `useState` 的初始化）。
- `onValidate`：可选，通常传入 `useHelperInfo` 返回的 `verifyFormItem` 函数，用于表单容器统一触发校验时调用。
- `setHelperText`：可选，通常传入 `useHelperInfo` 返回的 `setCurrentHelperText`，用于表单容器在整体校验后回填提示文本。
- `fieldRef`：可选，控件的 DOM/实例引用，用于校验失败时表单容器自动聚焦该字段。

返回值为 `[value, setValue]` 元组，用法与 `useState` 一致。

> **泛型说明**：`useFormItemValue<T, V = string>` 有两个泛型，`T` 是表单项值类型，`V` 是传给校验函数的值类型（默认 `string`）。多数控件只需传 `T`（如 `useFormItemValue<TextFieldValue>`）；仅当校验函数期望的值类型与 `string` 不同时，才需要显式传第二个泛型。

> **类型陷阱**：内部使用 `useState<T | undefined>(initialValue)`，返回时通过 `as T` 断言。因此若不传 `initialValue`，`value` 在运行时实际为 `undefined`，但静态类型是 `T`。请在使用 `value` 时对空值保持警惕（例如渲染前做兜底）。

## 3. `useHelperInfo` 详解

```ts
function useHelperInfo<T, V, VT>(
  validations: FormItemValidation<VT>[]
): [T, (value: V) => T | undefined, Dispatch<SetStateAction<T | undefined>>];
```

参数说明：

- `validations`：校验规则数组，每一项包含 `type`（校验类型）、`helpInfo`（提示信息，可选）、`validationAssert`（自定义校验断言，可选）。类型定义见 [FormItemValidation](../src/components/form/form.types.ts)。

返回值为三元组：

1. `currentHelperText`：当前校验提示文本状态。
2. `verifyFormItem(value)`：执行校验的函数，会遍历 `validations`，依次尝试匹配失败的规则并返回对应提示信息，同时更新 `currentHelperText` 状态。
3. `setCurrentHelperText`：直接设置提示文本状态的 setter（通常透传给 `useFormItemValue` 的 `setHelperText` 参数，供表单容器统一触发校验后回填）。

## 4. 两种封装模式

### 模式 A：需要校验提示（组合使用两个 Hook）

以 [LittenTextField](../src/pockets/littenForm/littenTextField/littenTextField.tsx) 为例：

```tsx
const [currentHelperText, verifyFormItem, setCurrentHelperText] = useHelperInfo<
  FormHelperInfo,
  string,
  ValidationType
>(validations);

const [value, setValue] = useFormItemValue<TextFieldValue>(
  path,
  initialValue,
  verifyFormItem, // 供表单容器统一触发校验
  setCurrentHelperText, // 供表单容器回填提示文本
  inputRef // 供表单容器在校验失败时聚焦
);
```

关键点：

- `useHelperInfo` 先于 `useFormItemValue` 调用，因为后者需要用到前者返回的 `verifyFormItem`、`setCurrentHelperText`。
- `onBlur` 时手动调用一次 `verifyFormItem(value)`，实现失焦即时校验，并把校验结果透传给外部 `onBlur` 回调。
- 渲染时，将 `currentHelperText` 展示在控件下方作为提示文案。
- 若希望**边输入边校验**（而非仅失焦时校验），可在 `handleChange` 中额外调用 `verifyFormItem(e.value)`。权衡：即时反馈更灵敏，但会更频繁地触发校验与提示刷新。

### 模式 B：无需校验提示（仅使用 `useFormItemValue`）

以 [LittenCheckbox](../src/pockets/littenForm/littenCheckbox/littenCheckbox.tsx) 为例：

```tsx
const [value, setValue] = useFormItemValue<boolean>(path, initialValue);
```

关键点：

- 不传入 `onValidate`、`setHelperText`、`fieldRef`，仅完成受控值同步与表单上下文注册。
- 适用于不需要展示行内校验提示的控件，或校验逻辑由外部统一处理的场景。

### 4.3 完整示例

下面是一个采用「模式 A」的最小可运行示例，展示从 `import`、Props 类型到组件实现的完整结构（以封装一个文本框为例）：

```tsx
import { useRef, type ChangeEvent, type FocusEvent } from 'react';

import { TextField } from 'litmoss/dist/textField';
import { ControlType, getDefaultValueByDisplayName } from 'litmoss-hooks';
import type {
  LittenEvent,
  TextFieldValue,
} from 'litmoss-hooks/dist/control/event/littenEvent.types';

import { type FormHelperInfo } from '../../../components/form/form.types';
import { useFormItemValue } from '../../../components/form/useFormItemValue';
import { useHelperInfo } from '../../../components/form/useHelperInfo';
import type { ValidationType } from '../../form/validation';

import type { MyTextFieldProps } from './myTextField.types';

export const MyTextField = ({
  path,
  initialValue,
  validations = [],
  onBlur,
  onChange,
  ...props
}: MyTextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. 先调用 useHelperInfo，拿到校验相关能力
  const [currentHelperText, verifyFormItem, setCurrentHelperText] =
    useHelperInfo<FormHelperInfo, string, ValidationType>(validations);

  // 2. 再调用 useFormItemValue，把校验能力与 ref 交给表单容器
  const [value, setValue] = useFormItemValue<TextFieldValue>(
    path,
    initialValue,
    verifyFormItem,
    setCurrentHelperText,
    inputRef
  );

  // 3. change 时同步值并透传
  function handleChange(
    e: LittenEvent<ChangeEvent<HTMLInputElement>, TextFieldValue>
  ) {
    setValue(e.value);
    onChange?.(e);
    // 如需边输入边校验，可在此额外调用：verifyFormItem(e.value);
  }

  // 4. blur 时即时校验并把结果透传给外部
  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const result = verifyFormItem(value as string);
    onBlur?.(e, result);
  }

  // 5. 渲染底层控件，并在下方展示提示文案
  return (
    <div>
      <TextField
        {...props}
        value={value}
        defaultValue={getDefaultValueByDisplayName(ControlType.TextField)}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={inputRef}
      />
      <div>{currentHelperText}</div>
    </div>
  );
};
```

对应的 Props 类型通常继承基础表单项属性（`path`、`initialValue`、`validations`）并结合底层控件的 props，可参考 [LittenTextFieldProps](../src/pockets/littenForm/littenTextField/littenTextField.types.ts)。

## 5. 封装一个新表单组件的步骤

1. **定义 Props 类型**：继承基础的表单项属性（`path`、`initialValue`、`validations`，参见 [FormItemProps](../src/components/form/form.types.ts)），并结合具体 UI 库控件的 props。
2. **（可选）调用 `useHelperInfo`**：如果组件需要展示校验提示，先调用该 Hook，得到 `currentHelperText`、`verifyFormItem`、`setCurrentHelperText`。
3. **调用 `useFormItemValue`**：传入 `path`、`initialValue`，以及上一步得到的 `verifyFormItem`、`setCurrentHelperText`（如有），和字段的 `ref`（如需要支持自动聚焦）。
4. **编写事件处理函数**：
   - `handleChange`：调用 `setValue` 同步新值，并透传外部 `onChange`。
   - `handleBlur`（如需要即时校验）：调用 `verifyFormItem(value)`，并将结果透传给外部 `onBlur`。
5. **渲染 UI**：渲染底层控件，并在需要时展示 `currentHelperText`。

## 6. 注意事项

- `path` 必须在整个表单中唯一，`useFormItemValue` 内部会进行校验，重复路径会导致注册冲突。
- `validations` 数组的顺序决定了校验优先级，第一个不通过的规则会被作为最终提示信息返回。
- 若需要在校验失败时自动聚焦该字段，务必将字段的 `ref`（需实现 `focus` 方法或为原生 DOM 元素）传给 `useFormItemValue` 的 `fieldRef` 参数。
- `useHelperInfo` 依赖全局的 `formInjector`（见 [src/components/inject.ts](../src/components/inject.ts)）提供通用校验断言和默认提示信息，使用前需确保已正确注入。
- 组件卸载时，`useFormItemValue` 会自动调用 `uninstall` 清理表单上下文中的注册信息，无需手动处理。
