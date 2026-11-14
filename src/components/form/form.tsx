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
  type FormRef,
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
  validateField,
} from './formUtil';

/**
 * 基于 React Context 的表单容器，通过 `ref` 暴露 {@link FormRef} 命令式方法。
 *
 * @example
 * ```tsx
 * const [formRef, form] = useForm();
 * <Form ref={formRef}>...</Form>
 * form?.validate();
 * ```
 */
export const Form = forwardRef<FormRef | undefined, FormProps>(
  (
    { children, prefixCls, validationMode = ValidationMode.all, ...props },
    ref
  ) => {
    const [formRegister] = useState<FormRegister>({});

    const [errorMsg, setErrorMsg] = useState<undefined | string>();

    const [context] = useState(() => initContext(formRegister, setErrorMsg));
    const { pendingValues } = context;

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
          return setValues(args, formRegister, pendingValues);
        },
        setValueByPath: (
          path: string,
          value: unknown,
          applyOnMount?: boolean
        ) => {
          return setValueByPath(
            path,
            value,
            formRegister,
            pendingValues,
            applyOnMount
          );
        },
        validate: (options?: { focusOnError?: boolean }) => {
          const { focusOnError = true } = options || {};

          const helperInfoList = validate(formRegister, validationMode);

          // 验证失败时聚焦首个错误字段
          if (focusOnError !== false) {
            if (helperInfoList.length > 0) {
              const firstError = helperInfoList[0];
              focusFieldByPath(firstError.path, formRegister);
            }
          }
          return helperInfoList;
        },
        validateField: (path: string, options?: { focusOnError?: boolean }) => {
          const { focusOnError = true } = options || {};

          const helpers = validateField(path, formRegister);

          if (focusOnError && helpers.length > 0) {
            focusFieldByPath(helpers[0].path, formRegister);
          }

          return helpers;
        },
        focusFieldByPath: (path: string) => {
          focusFieldByPath(path, formRegister);
        },
      };
    }, [formRegister, pendingValues, validationMode]);

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
