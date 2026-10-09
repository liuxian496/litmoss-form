import { useState } from 'react';

import { Button } from 'litmoss/dist/button';
import { Mode } from 'litmoss/dist/enum';
import { FormLabel } from 'litmoss/dist/formLabel';
import { StackPanel } from 'litmoss/dist/stackPanel';
import { Placement } from 'litmoss-hooks';
import { expect, userEvent, within } from 'storybook/test';

import { FormPaths, type BasicFormData } from '../../pockets/form';
import { LittenTextField } from '../../pockets/littenForm/littenTextField';

import { Form } from '../../components/form/form';
import { useForm } from '../../components/form/useForm';

import { type FormStory } from './littenFormStory.types';

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  const [formRef, myForm] = useForm();

  const [msg, setMsg] = useState('');

  function handleShowValueClick() {
    const { name, animation } = myForm?.getValues() as BasicFormData;

    setMsg(`Name: ${name}, Animation: ${animation}`);
  }

  function handleClearClick() {
    myForm?.setValues([
      { path: FormPaths.name, value: '' },
      { path: FormPaths.animation, value: '' },
    ]);
  }

  return (
    <div>
      <Form ref={formRef}>
        <StackPanel
          direction="column"
          justifyContent="space-evenly"
          alignItems="flex-start"
        >
          <FormLabel label="Name:" labelPlacement={Placement.top}>
            <LittenTextField
              data-testid="nameTextField"
              path={FormPaths.name}
            />
          </FormLabel>
          <FormLabel label="Animation:" labelPlacement={Placement.top}>
            <LittenTextField
              data-testid="animationTextField"
              path={FormPaths.animation}
              initialValue="Tom & Jerry"
            />
          </FormLabel>
        </StackPanel>
      </Form>
      <Button mode={Mode.primary} onClick={handleShowValueClick}>
        Show Value
      </Button>
      <Button onClick={handleClearClick}>Clear</Button>
      <div style={{ marginTop: '10px' }}>{msg}</div>
    </div>
  );
};

export const TextFieldTest: FormStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const nameTextField = canvas.getByTestId('nameTextField');
    const animationTextField = canvas.getByTestId('animationTextField');

    const showValueBtu = canvas.getByText('Show Value');
    const clearBtu = canvas.getByText('Clear');

    await step(
      'Default "Name" is "", Default "Animation" is Tom & Jerry',
      async () => {
        await expect(nameTextField).toHaveValue('');

        await expect(animationTextField).toHaveValue('Tom & Jerry');
      }
    );

    await step('Type "Name" Tom, "Age" 6, "Animation" 2', async () => {
      await userEvent.type(nameTextField, 'Tom');
      await userEvent.type(animationTextField, '2');

      await expect(nameTextField).toHaveValue('Tom');

      await expect(animationTextField).toHaveValue('Tom & Jerry2');

      await userEvent.click(showValueBtu);

      await expect(
        canvas.getByText('Name: Tom, Animation: Tom & Jerry2')
      ).toBeInTheDocument();
    });

    await step('Clear Form, then "Name" is "", "Animation" is ""', async () => {
      await userEvent.click(clearBtu);

      await expect(nameTextField).toHaveValue('');

      await expect(animationTextField).toHaveValue('');

      await userEvent.click(showValueBtu);

      await expect(canvas.getByText('Name: , Animation:')).toBeInTheDocument();
    });
  },
};
