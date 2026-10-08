import type { TextFieldProps } from 'litmoss/dist/components/textField/textField.types';
import type { TextFieldValue } from 'litten-hooks/dist/control/event/littenEvent.types';

import type {
  FormHelperInfo,
  FormItemProps,
} from '../../../components/form/form.types';
import type { ValidationType } from '../../form/validation';

export interface LittenTextFieldProps
  extends
  FormItemProps<TextFieldValue, ValidationType>,
  Omit<TextFieldProps, 'onBlur'> {
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    validationResult?: FormHelperInfo
  ) => void;
}
