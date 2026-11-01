import { createContext } from 'react';

import type {
  FormContextProps,
  FormItemRegister,
  FormRegister,
} from './form.types';

/**
 * 用于管理表单状态和操作的 React Context
 * 通过 `FormContextProps` 提供表单相关的属性和方法
 * @see FormContextProps
 */
export const FormContext = createContext<FormContextProps | undefined>(
  undefined
);

/**
 * 初始化表单上下文
 *
 * @param formRegister - 用于存储表单项注册信息的对象，以 valuePath 作为键
 * @param setErrorMsg - 用于更新错误信息的 React 状态设置函数
 * @returns {FormContextProps} 返回包含注册、检查和卸载表单项方法的表单上下文
 */
export function initContext(
  formRegister: FormRegister,
  setErrorMsg: React.Dispatch<React.SetStateAction<string | undefined>>
): FormContextProps {
  return {
    register: (props: FormItemRegister) => {
      const { path } = props;
      formRegister[path] = {
        ...props,
      };
    },
    pendingValues: new Map(),
    uninstall: (path: string) => {
      delete formRegister[path];
    },
    checkValuePath: (path: string) => {
      if (Object.prototype.hasOwnProperty.call(formRegister, path) === false) {
        formRegister[path] = { path };
      } else {
        setErrorMsg(
          `The valuePath "${path}" is used by other FormControl, Please check your form.`
        );
      }
    },
  };
}
