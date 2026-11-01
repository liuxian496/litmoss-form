# litmoss-form 版本升级指南

本文档汇总 `litmoss-form`（原 `litten-form`）各版本之间的**破坏性变更**和**行为变化**，并给出迁移步骤。

> 跨多个大版本升级时，请按顺序逐段阅读（例如 2.x → 5.x 需依次参考 3.0、4.0、5.0 章节）。
> 仅涉及构建、CI、Storybook 的改动不影响使用方，本文不列出。

## 总览

| 升级区间      | 类型     | 主要变化                                                                                                   |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| 1.x → 2.0.0   | 破坏性   | `Form` 改为 `ref` 方式；`useForm` 返回元组；`setValues` 参数改为数组；`clear` 改为置空；废弃 `FormControl` |
| 2.0.0 → 2.1.0 | 破坏性   | `FormControl` 实现被移除；`useFormItemValue` 泛型调整                                                      |
| 2.x → 3.0.0   | 破坏性   | `injectVerifyFormItem` 替换为 `initLittenForm`；`ValidationMode` 由 enum 改为常量对象                      |
| 3.x → 4.0.0   | 破坏性   | 删除 `FormItemValue`、`FormRef.clear`；`useHelperInfo` / `useFormItemValue` 签名调整                       |
| 4.0.0 → 4.1.0 | 行为变化 | `validate()` 失败时默认自动聚焦首个错误项                                                                  |
| 4.x → 5.0.0   | 破坏性   | 包名由 `litten-form` 改为 `litmoss-form`                                                                   |
| 5.0.0 → 5.0.1 | 依赖变化 | peer 依赖 `litten-hooks` 替换为 `litmoss-hooks@^3.0.0`                                                     |
| 5.0.1 → 5.1.0 | 依赖变化 | 新增 peer 依赖 `number-precision@^1.6.0`；新增 `validateField`                                             |
| 5.1.0 → 5.1.1 | 行为变化 | `validateField` 失败时默认自动聚焦                                                                         |

---

## 1.x → 2.0.0

### 1. `Form` 不再接收 `formRef`，`useForm` 返回元组

1.x 中 `useForm()` 直接返回表单对象，并通过 `formRef` 属性传给 `Form`；2.0 起 `Form` 使用 `forwardRef`，`useForm()` 返回 `[ref, myForm]`。

```tsx
// 1.x
const myForm = useForm();
<Form formRef={myForm}>...</Form>;
myForm.getValues();

// 2.0+
const [ref, myForm] = useForm();
<Form ref={ref}>...</Form>;
myForm?.getValues();
```

注意：`myForm` 在首次渲染时可能为 `undefined`，调用时需使用可选链或判空。

### 2. `setValues` 参数由对象改为数组

```ts
// 1.x
myForm.setValues({ name: 'Tom', age: 18 });

// 2.0+
myForm?.setValues([
  { path: 'name', value: 'Tom' },
  { path: 'age', value: 18 },
]);
```

1.x 中未出现在对象里的字段会被设置为 `undefined`；2.0 起只设置数组中列出的字段。

### 3. `FormControl` 被废弃

2.0 新增 `useFormItemValue`、`useHelperInfo`，用于自行封装受控表单项，`FormControl` 标记为废弃（2.1.0 移除实现，3.0.0 移除导出）。迁移方式见 [自定义表单组件封装指南](./custom-form-component-guide.md)。

```tsx
// 1.x
<FormControl valuePath="name">
  <TextField />
</FormControl>

// 2.0+：使用基于 useFormItemValue 封装的表单项组件
<MyTextField path="name" />
```

### 4. 新增能力（非破坏）

- `FormRef` 新增 `setHelpTextByPath`、`validate`。
- `Form` 新增 `validationMode` 属性，支持 `all`（全部校验）与 `step`（分步校验）。
- 新增 `injectVerifyFormItem`，用于注入扩展校验（3.0 中被替换）。

---

## 2.0.0 → 2.1.0

- `FormControl` 的实现文件已删除，**2.1.0 起无法再使用 `FormControl`**，请先完成上一节的迁移。
- `useFormItemValue` 的泛型签名由 `useFormItemValue<T = FormItemValue, V = string>` 改为 `useFormItemValue<T, V = string>`，`initialValue` 的类型由 `FormItemValue` 改为 `T`，返回值类型随之变为 `T`。如果之前依赖默认泛型，需要显式传入值类型：

```ts
// 2.0
const [value, setValue] = useFormItemValue(path, initialValue);

// 2.1+
const [value, setValue] = useFormItemValue<string>(path, initialValue);
```

---

## 2.x → 3.0.0

### 1. `injectVerifyFormItem` 替换为 `initLittenForm`

```ts
// 2.x
import { injectVerifyFormItem } from 'litten-form';

injectVerifyFormItem((value, type) => {
  // 返回 true 表示校验通过
});

// 3.0+
import { initLittenForm } from 'litten-form';

initLittenForm<ValidationType, string, unknown>({
  commonValidationAssert: (value, type) => {
    // 返回 true 表示校验通过
  },
  getDefaultHelperInfo: (type) => {
    // 返回该校验类型的默认提示文案
  },
  getInitialValue: (controlType) => {
    // 可选：按控件类型返回初始值
  },
});
```

| 2.x                           | 3.0+                                              |
| ----------------------------- | ------------------------------------------------- |
| `injectVerifyFormItem(fn)`    | `initLittenForm({ commonValidationAssert: fn })`  |
| 类型 `VerifyFormItemFunction` | 已删除，使用 `FormInjector<VT, CT, T>`            |
| 无                            | `getDefaultHelperInfo`、`getInitialValue`（可选） |

`initLittenForm` 应在应用入口调用一次，详见 [接入文档](./integration.md)。

### 2. `FormControl` 不再导出

入口文件已移除 `FormControl` 的导出。

### 3. `ValidationMode` 由 enum 改为常量对象

`ValidationMode` 现在是 `as const` 对象加同名联合类型。`ValidationMode.all`、`ValidationMode.step` 的用法不变；若代码中依赖 enum 特性（如反向映射、`enum` 类型声明合并），需要调整。

### 4. 类型调整

- `FormHelperInfo` 由 `string | JSX.Element | undefined` 改为 `string | JSX.Element`（4.0 又恢复包含 `undefined`）。
- `FormItemValidation.helpInfo` 变为可选；未提供时使用 `getDefaultHelperInfo` 返回的默认文案。
- `FormItemValidation.validationAssert` 的参数类型改为 `unknown`。

---

## 3.x → 4.0.0

### 1. 删除 `FormItemValue` 类型

所有使用 `FormItemValue` 的位置改为 `unknown`，涉及：`FormValues` 的值类型、`FormItemArgs.value`、`getValueByPath` 返回值、`setValueByPath` 的 `value` 参数。若业务代码引用了 `FormItemValue`，请替换为 `unknown` 或具体业务类型，并在读取值时自行断言：

```ts
const name = myForm?.getValueByPath('name') as string | undefined;
```

### 2. 删除 `FormRef.clear()`

如需清空表单，请改用 `setValues` 显式设置各字段：

```ts
// 3.x
myForm?.clear();

// 4.0+
myForm?.setValues([
  { path: 'name', value: '' },
  { path: 'age', value: undefined },
]);
```

### 3. `setValues` / `setValueByPath` 返回校验信息

| 方法                          | 3.x 返回值 | 4.0+ 返回值        |
| ----------------------------- | ---------- | ------------------ |
| `setValues(args)`             | `void`     | `FormItemHelper[]` |
| `setValueByPath(path, value)` | `void`     | `FormHelperInfo`   |

一般无需修改调用代码；若自行实现了 `FormRef` 接口或对其做了类型包装，需要同步调整。

### 4. `useHelperInfo` 泛型与签名调整

```ts
// 3.x
const [helperText, verifyFormItem, setHelperText] = useHelperInfo<
  string | JSX.Element,
  string,
  ValidationType
>(validations);
verifyFormItem(value);

// 4.0+
const [helperText, verifyFormItem, setHelperText] = useHelperInfo<
  string,
  ValidationType
>(validations);
verifyFormItem(value, path);
```

- 去掉了第一个“帮助信息类型”泛型，帮助信息统一为 `FormHelperInfo`。
- `verifyFormItem` 新增 `path` 参数，用于警告信息定位。
- 使用 `BaseValidationType.Customize` 但未提供 `validationAssert` 时，会输出警告并停止该表单项的后续校验。

### 5. `useFormItemValue` 签名调整

```ts
// 4.0+
useFormItemValue<T, V = string>(
  valuePath: string,
  initialValue?: T,
  onGetErrorMessage?: (value: V, path: string) => FormHelperInfo,
  setHelperText?: Dispatch<SetStateAction<FormHelperInfo>>,
  fieldRef?: React.RefObject<FocusableField | null>,
);
```

- `onGetErrorMessage` 新增第二个参数 `path`，直接传入 `useHelperInfo` 返回的 `verifyFormItem` 即可。
- 新增可选参数 `fieldRef`，传入后 `focusFieldByPath` 以及 4.1 的自动聚焦才能生效。

### 6. `BaseValidation` 重命名为 `BaseValidationType`

内部常量 `BaseValidation` 改为 `BaseValidationType`（4.2.0 起从入口导出）。若曾通过深层路径引用 `BaseValidation`，请改为：

```ts
import { BaseValidationType } from 'litten-form';
```

### 7. 新增能力（非破坏）

- `FormRef.focusFieldByPath(path)`：聚焦指定表单项。
- 新增 `Mounter` 组件。

---

## 4.0.0 → 4.1.0（行为变化）

`validate()` 新增 `options` 参数，**校验失败时默认自动聚焦第一个错误表单项**（`focusOnError` 默认为 `true`）。如需保持旧行为：

```ts
myForm?.validate({ focusOnError: false });
```

自动聚焦依赖表单项向 `useFormItemValue` 传入 `fieldRef`，未传入的表单项不会被聚焦。

4.2.0 新增导出 `BaseValidationType`、`ValidationMode` 以及类型 `FormProps`、`FormRef`、`FormHelperInfo`、`FormItemProps`、`MounterProps`，不涉及破坏性变更。

---

## 4.x → 5.0.0

### 包名变更

包名由 `litten-form` 改为 `litmoss-form`，API 无变化。

```bash
npm uninstall litten-form
npm i litmoss-form
```

替换所有导入路径：

```ts
// 4.x
import { Form, useForm } from 'litten-form';

// 5.0+
import { Form, useForm } from 'litmoss-form';
```

> `initLittenForm` 函数名保持不变。

---

## 5.0.0 → 5.0.1（依赖变化）

peer 依赖 `litten-hooks` 替换为 `litmoss-hooks@^3.0.0`，类型 `UserControlProps` 也改为从 `litmoss-hooks` 引用。

```bash
npm uninstall litten-hooks
npm i litmoss-hooks@^3.0.0
```

若业务代码直接从 `litten-hooks` 引用类型或枚举，请同步改为 `litmoss-hooks`。

---

## 5.0.1 → 5.1.0（依赖变化）

新增 peer 依赖 `number-precision`：

```bash
npm i number-precision@^1.6.0
```

新增 `FormRef.validateField(path, options?)`，用于校验单个表单项（非破坏）。

---

## 5.1.0 → 5.1.1（行为变化）

`validateField` 校验失败时**默认自动聚焦该表单项**。如需保持 5.1.0 的行为：

```ts
myForm?.validateField('name', { focusOnError: false });
```

---

## 升级检查清单

- [ ] `package.json` 中依赖名为 `litmoss-form`，代码中没有残留的 `litten-form` 导入。
- [ ] 已安装 peer 依赖：`react`、`react-dom`、`classnames`、`cyndi`、`exception-boundary`、`litmoss-hooks@^3.0.0`、`number-precision@^1.6.0`。
- [ ] 代码中没有残留的 `litten-hooks` 引用。
- [ ] 已用 `initLittenForm` 替换 `injectVerifyFormItem`，并在应用入口调用一次。
- [ ] `Form` 使用 `ref={ref}`，`useForm()` 按 `[ref, myForm]` 解构。
- [ ] `setValues` 参数为 `[{ path, value }]` 数组。
- [ ] 不再使用 `FormControl`、`FormRef.clear()`、`FormItemValue`。
- [ ] `useHelperInfo` 只传两个泛型，`verifyFormItem` 调用时传入 `path`。
- [ ] 需要自动聚焦的表单项已向 `useFormItemValue` 传入 `fieldRef`；不需要自动聚焦的调用已显式传入 `{ focusOnError: false }`。
- [ ] 运行类型检查与测试，确认无报错。
