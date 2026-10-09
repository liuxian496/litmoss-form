import { forwardRef, useImperativeHandle, useState } from 'react';

import { ExceptionBoundary } from 'exception-boundary';
import { ControlType } from 'litmoss-hooks/dist/enum';

import { validate } from '../validation';

import { FormContext, initContext } from './context';
import {
  ValidationMode,
  type FormArgs,
  type FormHelperInfo,
  type FormProps,
  type FormRegister,
} from './form.types';
import { getVisualStates } from './formBase';
import {
  focusFieldByPath,
  getValueByPath,
  getValues,
  setHelpTextByPath,
  setValueByPath,
  setValues,
} from './formUtil';

/**
 * Form 是一个 React 组件，提供基于React Context的表单管理系统
 * 通过 `ref` 暴露命令式方法，用于操作表单状态，如清空、获取、设置和校验表单值。
 *
 * @param {FormProps} props - 表单组件的属性
 * @param {React.Ref<FormRef>} ref - 用于访问命令式表单方法的 ref
 * @returns {JSX.Element} 渲染后的表单组件
 */
export const Form = forwardRef(
  (
    {
      children,
      prefixCls,
      validationMode = ValidationMode.all,
      ...props
    }: FormProps,
    ref
  ) => {
    const [formRegister] = useState<FormRegister>({});

    const [errorMsg, setErrorMsg] = useState<undefined | string>();

    const [context] = useState(() => initContext(formRegister, setErrorMsg));

    useImperativeHandle(ref, () => {
      return {
        getValues: () => {
          return getValues(formRegister);
        },
        getValueByPath: (path: string) => {
          return getValueByPath(path, formRegister);
        },
        setHelpTextByPath: (path: string, helpInfo: FormHelperInfo) => {
          setHelpTextByPath(path, helpInfo, formRegister);
        },
        setValues: (args: FormArgs) => {
          return setValues(args, formRegister);
        },
        setValueByPath: (path: string, value: unknown) => {
          return setValueByPath(path, value, formRegister);
        },
        validate: (options?: { focusOnError?: boolean }) => {
          const { focusOnError } = options || {};

          const errorList = validate(formRegister, validationMode);

          // 验证失败时，自动将焦点定位至首个错误字段。通常点击类似submit这种按钮时，调用本方法
          if (focusOnError !== false) {
            if (errorList.length > 0) {
              const firstError = errorList[0];
              focusFieldByPath(firstError.path, formRegister);
            }
          }
          return errorList;
        },
        focusFieldByPath: (path: string) => {
          focusFieldByPath(path, formRegister);
        },
      };
    }, [formRegister, validationMode]);

    return (
      <ExceptionBoundary errorMsg={errorMsg}>
        <FormContext.Provider value={context}>
          <div className={getVisualStates(prefixCls)} {...props}>
            {children}
          </div>
        </FormContext.Provider>
      </ExceptionBoundary>
    );
  }
);

Form.displayName = ControlType.Form;
