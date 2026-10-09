# litmoss-form

![GitHub](https://img.shields.io/github/license/liuxian496/litmoss-form)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/liuxian496/litmoss-form/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/liuxian496/litmoss/badge.svg)](https://coveralls.io/github/liuxian496/litmoss)
![GitHub Repo stars](https://img.shields.io/github/stars/liuxian496/litmoss-form)

litmoss-form 是一个基于 React 的轻量表单库，提供跨组件的表单数据管理能力。核心理念是将**表单数据的状态管理**与**表单UI控制**解耦。

- **跨组件收集表单数据**：表单项通过 `path` 自动注册到 `Form` 上下文，无需逐层传递 props
- **一次受控**：只要**表单组件**封装时实现一次受控逻辑，页面开发即可免去重复的受控代码编写，使开发者专注于业务逻辑的编排。
- **命令式 API**：通过 `useForm`暴露`getValues`、`setValues`、`validate` 等方法
- **可扩展的校验体系**：通过 `initLittenForm` 全局注入通用校验断言和默认提示文案，同时支持自定义校验
- **两种校验模式**：全部校验（`all`）与分步校验（`step`）
- **校验失败时**，自动聚焦到第一个出错的表单项
- **UI无关**：不依赖与任何UI库，任何UI库都能通过封装**表单组件**继承

## 在线文档

[github pages：https://liuxian496.github.io/litmoss-form/](https://liuxian496.github.io/litmoss-form/)

[chromatic：https://6ac70cb7870df8e554fb05ff-jcxiqbiehx.chromatic.com/](https://6ac70cb7870df8e554fb05ff-jcxiqbiehx.chromatic.com/)

## 安装

```bash
npm i litmoss-form
```

以下依赖为 `peerDependencies`，打包时不包含，需要在使用的项目中自行安装：

| 依赖                 | 版本       |
|----------------------|------------|
| `react`              | `^18.2.0`  |
| `react-dom`          | `^18.2.0`  |
| `classnames`         | `^2.5.1`   |
| `cyndi`              | `^1.0.0`   |
| `exception-boundary` | `^2.0.1`   |
| `litmoss-hooks`      | `^3.0.0`   |
| `lodash`             | `^4.17.21` |

## 快速开始

### 1. 在工程入口全局初始化

在应用启动时调用一次 `initLittenForm`，注入通用校验断言与默认提示文案：

```ts
import { BaseValidationType, initLittenForm } from 'litmoss-form';

export const ValidationType = {
  ...BaseValidationType,
  StringRequired: 'stringRequired',
} as const;

export type ValidationType =
  (typeof ValidationType)[keyof typeof ValidationType];

initLittenForm<ValidationType, string, unknown>({
  commonValidationAssert: (value, type) => {
    switch (type) {
      case ValidationType.StringRequired:
        return typeof value === 'string' && value.trim() !== '';
      default:
        return true;
    }
  },
  getDefaultHelperInfo: (type) => {
    switch (type) {
      case ValidationType.StringRequired:
        return '该项为必填项';
      default:
        return '';
    }
  },
});
```

### 2. 使用表单

```tsx
import { Form, useForm } from 'litmoss-form';

function Demo() {
  const [formRef, form] = useForm();

  function handleSubmit() {
    const errors = form?.validate({ focusOnError: true }) ?? [];
    if (errors.length > 0) return;

    console.log(form?.getValues());
  }

  return (
    <>
      <Form ref={formRef}>
        {/* 使用 useFormItemValue 封装的表单项组件 */}
        <MyTextField
          path="name"
          validations={[{ type: ValidationType.StringRequired }]}
        />
      </Form>
      <button onClick={handleSubmit}>提交</button>
    </>
  );
}
```

## API 概览

### 组件

| 组件      | 说明                                                               |
|-----------|--------------------------------------------------------------------|
| `Form`    | 表单容器，通过 `ref` 暴露 `FormRef`。`validationMode` 默认为 `all` |
| `Mounter` | 挂载完成后触发一次 `onDidMount` 回调，可用于级联表单等场景的初始化 |

### Hooks

| Hook               | 说明                                                            |
|--------------------|-----------------------------------------------------------------|
| `useForm`          | 返回 `[ref, form]`，`ref` 传给 `Form`，`form` 为 `FormRef` 实例 |
| `useFormItemValue` | 管理表单项的值，并向 `Form` 上下文注册 / 卸载该表单项           |
| `useHelperInfo`    | 根据 `validations` 执行校验，管理校验提示文本                   |

### FormRef

| 方法                            | 说明                                              |
|---------------------------------|---------------------------------------------------|
| `getValues()`                   | 获取表单当前全部数据                              |
| `setValues(args)`               | 批量设置表单数据，`args` 形如 `[{ path, value }]` |
| `getValueByPath(path)`          | 获取指定表单项的值                                |
| `setValueByPath(path, value)`   | 设置指定表单项的值                                |
| `setHelpTextByPath(path, text)` | 设置指定表单项的提示信息                          |
| `validate({ focusOnError? })`   | 校验表单，返回失败项的 `{ path, helpInfo }` 数组  |
| `focusFieldByPath(path)`        | 聚焦指定表单项                                    |

### 常量

| 常量                           | 说明                                             |
|--------------------------------|--------------------------------------------------|
| `ValidationMode.all`           | 全部校验，收集所有失败项                         |
| `ValidationMode.step`          | 分步校验，按注册顺序校验，遇到第一个失败项即停止 |
| `BaseValidationType.Customize` | 自定义校验类型，需配合 `validationAssert` 使用   |

### 初始化

| 方法                       | 说明                                                                                 |
|----------------------------|--------------------------------------------------------------------------------------|
| `initLittenForm(injector)` | 全局注入 `commonValidationAssert`、`getDefaultHelperInfo`、`getInitialValue`（可选） |

## 自定义表单组件

组合使用 `useHelperInfo` 与 `useFormItemValue` 即可封装一个受控、支持校验提示的表单组件：

```tsx
import { useRef } from 'react';
import { useFormItemValue, useHelperInfo } from 'litmoss-form';
import type { FormItemProps } from 'litmoss-form';

export const MyTextField = ({
  path,
  initialValue,
  validations = [],
}: FormItemProps<string, ValidationType>) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [helperText, verifyFormItem, setHelperText] = useHelperInfo<
    string,
    ValidationType
  >(validations);

  const [value, setValue] = useFormItemValue<string>(
    path,
    initialValue,
    verifyFormItem,
    setHelperText,
    inputRef
  );

  return (
    <div>
      <input
        ref={inputRef}
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => verifyFormItem(value)}
      />
      <div>{helperText}</div>
    </div>
  );
};
```

更多细节见 [自定义表单组件封装指南](./docs/custom-form-component-guide.md)。

## 文档

- [接入文档](./docs/integration.md)
- [自定义表单组件封装指南](./docs/custom-form-component-guide.md)

## 本地开发

```bash
npm i                                   # 安装依赖
npm run storybook                       # 启动 Storybook（端口 6006）
npm test                                # 运行测试
npm run test-storybook -- --coverage    # 运行 Storybook 测试并生成覆盖率
npm run lint                            # 代码检查
npm run build                           # 构建
```

## License

[Apache-2.0](./LICENSE)

## 如果你想请我喝一咖啡（Buy Me a Coffee）

<img src=".\\public\\wechat.jpg" height="360">
<img src=".\\public\\alipay.jpg" height="360">
