import { FormLabel, StackPanel } from 'litmoss';
import { Placement } from 'litten-hooks';

import { LittenCheckbox, LittenTextField } from '@/pockets';

import { FormPaths } from '../../pockets/form/form.types';

import { Form } from '../../components/form/form';
import { useForm } from '../../components/form/useForm';

import { type FormStory } from './littenFormStory.types';

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  const [formRef] = useForm();

  return (
    <div>
      <Form ref={formRef}>
        <StackPanel
          direction="column"
          justifyContent="space-evenly"
          alignItems="flex-start"
        >
          {/**如果受控组件的初始值时undefined，输入时，控制台会报错 */}
          <FormLabel label="Name:" labelPlacement={Placement.top}>
            <LittenTextField
              data-testid="roleTextField"
              path={FormPaths.role}
            />
          </FormLabel>
          <FormLabel label="Fruit:">
            <LittenCheckbox path={FormPaths.fruit} />
          </FormLabel>
        </StackPanel>
      </Form>
    </div>
  );
};

export const InitialValueTest: FormStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
};
