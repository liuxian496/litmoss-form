import { useRef, type ChangeEvent, type FocusEvent } from 'react';

import { TextField } from 'litmoss';
import { ControlType, getDefaultValueByDisplayName } from 'litten-hooks';
import type {
  LittenEvent,
  TextFieldValue,
} from 'litten-hooks/dist/control/event/littenEvent.types';

import { useFormItemValue } from '../../../components/form/useFormItemValue';
import { useHelperInfo } from '../../../components/form/useHelperInfo';
import type { ValidationType } from '../../form/validation';

import type { LittenTextFieldProps } from './littenTextField.types';

export const LittenTextField = ({
  path,
  initialValue,
  validations = [],
  onBlur,
  onChange,
  ...props
}: LittenTextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentHelperText, verifyFormItem, setCurrentHelperText] =
    useHelperInfo<string, ValidationType>(validations);

  const [value, setValue] = useFormItemValue<TextFieldValue>(
    path,
    initialValue,
    verifyFormItem,
    setCurrentHelperText,
    inputRef
  );

  function handleChange(
    e: LittenEvent<ChangeEvent<HTMLInputElement>, TextFieldValue>
  ) {
    setValue(e.value);
    onChange?.(e);
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    const result = verifyFormItem(value as string);
    onBlur?.(e, result);
  }

  function render() {
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
        <div
          style={{ color: '#d32f2f', fontStyle: 'italic', fontSize: '0.88rem' }}
        >
          {currentHelperText}
        </div>
      </div>
    );
  }

  return render();
};
