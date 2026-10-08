# litmoss-form 接入文档

本文档用于在业务工程中接入 litmoss-form，重点说明全局初始化、验证能力注入和常见接入方式。

## 1. 必做项：在工程入口全局初始化

在应用启动时，必须调用一次 initLittenForm 完成能力注入。

原因：

- 表单校验逻辑在运行时通过全局注入对象读取 commonValidationAssert 和 getDefaultHelperInfo。
- 如果未初始化，当使用非 Customize 校验类型时，会出现警告，并且无法得到默认提示信息。

建议放置位置：

- React 单页应用：main.tsx 或 index.tsx
- 微前端子应用：子应用 bootstrap 阶段
- SSR 应用：客户端启动入口（确保只初始化一次）

示例：

```ts
import { initLittenForm } from 'litmoss-form';
import {
  commonValidationAssert,
  getDefaultHelperInfo,
  ValidationType,
} from './form/validation';

initLittenForm<ValidationType, string, unknown>({
  commonValidationAssert,
  getDefaultHelperInfo,
  getInitialValue: () => undefined,
});
```

## 2. 你需要注入什么

initLittenForm 接收 FormInjector：

- commonValidationAssert(value, validationType): boolean
- getDefaultHelperInfo(validationType): string | JSX.Element
- getInitialValue(controlType): any（可选扩展位）

推荐实现策略：

- 把 ValidationType 设计为统一枚举，包含基础类型和业务扩展类型。
- commonValidationAssert 只做纯函数判断，不依赖组件状态。
- getDefaultHelperInfo 集中管理错误文案，便于统一国际化。

参考实现：

```ts
import { BaseValidationType } from 'litmoss-form/dist/components/form/formBase';

export const ValidationType = {
  ...BaseValidationType,
  StringRequired: 'stringRequired',
} as const;

export type ValidationType =
  (typeof ValidationType)[keyof typeof ValidationType];

export function commonValidationAssert(
  value: unknown,
  validationType: ValidationType
) {
  switch (validationType) {
    case ValidationType.StringRequired:
      return typeof value === 'string' && value.trim() !== '';
    default:
      return true;
  }
}

export function getDefaultHelperInfo(validationType: ValidationType) {
  switch (validationType) {
    case ValidationType.StringRequired:
      return 'This field is required.';
    default:
      return '';
  }
}
```

## 3. 基础使用流程

1. 入口初始化（initLittenForm）
2. 页面内通过 useForm 创建表单实例
3. 使用 Form 组件包裹表单项
4. 表单项声明 path 与 validations
5. 提交前调用 form.validate()，通过后再读取 form.getValues()

示例：

```tsx
import { Form, useForm } from 'litmoss-form';

function Demo() {
  const [formRef, form] = useForm();

  function handleSubmit() {
    const errors = form?.validate() ?? [];
    if (errors.length > 0) return;

    const values = form?.getValues();
    console.log(values);
  }

  return (
    <>
      <Form ref={formRef}>{/* 表单项组件 */}</Form>
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

## 4. 校验模式

Form 支持两种 validationMode：

- all：校验所有字段，收集全部错误
- step：按注册顺序校验，遇到第一个错误即停止

默认值为 all。

## 5. 常见问题

### 5.1 出现警告：Can not find commonValidationAssert in formInjector

原因：未执行 initLittenForm，或注入对象未提供 commonValidationAssert。

处理：

- 确认入口文件已执行初始化。
- 确认初始化顺序早于任何表单页面渲染。

### 5.2 使用了自定义校验但没有提示文案

原因：validations 未配置 helpInfo，且 getDefaultHelperInfo 未返回对应默认文案。

处理：

- 在 validations 内显式传入 helpInfo，或
- 在 getDefaultHelperInfo 中补全该类型的默认提示。

### 5.3 getInitialValue 是否必须实现

当前版本建议实现，但不是强制。

- 如果你的组件体系需要按控件类型返回初始值，建议提供。
- 若暂时没有此需求，可先返回 undefined。

## 6. 接入检查清单

- 是否在入口调用且仅调用一次 initLittenForm
- 是否注入 commonValidationAssert
- 是否注入 getDefaultHelperInfo
- 是否在提交前调用 validate
- 是否为每个字段提供唯一 path
