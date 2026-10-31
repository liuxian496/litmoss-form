import {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { FormContext } from './context';
import type { FocusableField, FormHelperInfo } from './form.types';

/**
 *  提供一个自定义hook, 用来实现表单项的受控逻辑
 *
 * @template T - 表单项值的类型
 * @template V - 传递给校验函数的值类型，默认string
 *
 * @param valuePath - 唯一标识表单项的路径
 * @param initialValue - 表单项的初始值
 * @param onGetErrorMessage - 可选，校验值并返回错误信息或 JSX 元素的函数
 * @param setHelperText - 可选，用于设置校验提示文本的 setter
 * @param fieldRef - 可选，控件引用，校验失败时用于自动聚焦
 *
 * @returns 包含当前值和 setter 的元组；setter 只接收新值，不支持函数式更新
 */
export function useFormItemValue<T, V = string>(
  valuePath: string,
  initialValue?: T,
  onGetErrorMessage?: (value: V, path: string) => FormHelperInfo,
  setHelperText?: Dispatch<SetStateAction<FormHelperInfo>>,
  fieldRef?: React.RefObject<FocusableField | null>
) {
  const formContext = useContext(FormContext);

  const [value, setValue] = useState<T | undefined>(initialValue);
  const currentValueRef = useRef<T | undefined>(value);

  const setItemValue = useCallback((nextValue: T | undefined) => {
    currentValueRef.current = nextValue;
    setValue(() => nextValue);
  }, []);

  useEffect(() => {
    formContext?.checkValuePath(valuePath);
    return () => {
      formContext?.uninstall(valuePath);
    };
  }, [formContext, valuePath]);

  useEffect(() => {
    formContext?.register({
      path: valuePath,
      get: () => {
        return currentValueRef.current;
      },
      set: (newValue: unknown) => {
        setItemValue(newValue as T | undefined);
      },
      validate: (newValue: unknown) =>
        onGetErrorMessage?.(newValue as V, valuePath),
      setHelperText: setHelperText,
      fieldRef,
    });
  }, [
    formContext,
    onGetErrorMessage,
    valuePath,
    setHelperText,
    fieldRef,
    setItemValue,
  ]);

  return [value, setItemValue] as [
    T | undefined,
    (value: T | undefined) => void,
  ];
}
