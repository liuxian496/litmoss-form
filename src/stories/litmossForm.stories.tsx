import { type Meta } from '@storybook/react-vite';

import { Form } from '../components/form/form';

import { CheckboxTest } from './litmossForm/checkboxStory';
import { InitialValueTest } from './litmossForm/initialValueStory';
import { TextFieldTest } from './litmossForm/textFieldStory';

export default {
  title: 'Test/Litmoss Form',
  component: Form,
  argTypes: {
    prefixCls: {
      control: false,
    },
    //在示例文档中移除children属性的显示
    children: {
      table: {
        disable: true,
      },
    },
  },
} as Meta<typeof Form>;

export const TextField = TextFieldTest;
export const Checkbox = CheckboxTest;
export const InitialValue = InitialValueTest;
