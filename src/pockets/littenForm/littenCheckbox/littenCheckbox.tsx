import type { ChangeEvent } from 'react';

import { Checkbox } from 'litmoss';
import type { LittenEvent } from 'litten-hooks/dist/control/event/littenEvent.types';

import { useFormItemValue } from '../../../components/form/useFormItemValue';

import type { LittenCheckboxProps } from './littenCheckbox.type';

export const LittenCheckbox = ({
  path,
  initialValue,
  onChange,
  ...props
}: LittenCheckboxProps) => {
  const [value, setValue] = useFormItemValue<boolean>(path, initialValue);

  function handleChange(e: LittenEvent<ChangeEvent<HTMLInputElement>, string>) {
    setValue(e.checked === true);
    onChange?.(e);
  }

  function render() {
    return (
      <div>
        <Checkbox {...props} checked={value} onChange={handleChange} />
      </div>
    );
  }

  return render();
};
