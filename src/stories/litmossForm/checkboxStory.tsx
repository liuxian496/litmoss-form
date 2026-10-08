import { useState } from 'react';

import { Button } from 'litmoss/dist/button';
import { FormLabel } from 'litmoss/dist/formLabel';
import { expect, userEvent, within } from 'storybook/test';

import { type BasicFormData, FormPaths } from '../../pockets/form/form.types';
import { NativeCheckbox } from '../../pockets/nativeForm/nativeCheckbox';

import { Form } from '../../components/form/form';
import { useForm } from '../../components/form/useForm';

import { type FormStory } from './littenFormStory.types';

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  const [formRef, myForm] = useForm();

  const [formData, setFormData] = useState<BasicFormData>();

  function handleShowFormDataBtuClick() {
    setFormData(myForm?.getValues() as BasicFormData);
  }

  function handleSetFruitBtuClick() {
    myForm?.setValueByPath(FormPaths.fruit, false);
  }

  return (
    <>
      <Form ref={formRef}>
        <FormLabel label="Fruit:">
          <NativeCheckbox
            data-testid="fruit"
            path={FormPaths.fruit}
            initialValue={false}
          />
        </FormLabel>
      </Form>

      <Button
        data-testid="showFormDataBtu"
        onClick={handleShowFormDataBtuClick}
      >
        Show Form Data
      </Button>
      <Button data-testid="setFormDataBtu" onClick={handleSetFruitBtuClick}>
        Set Fruit False
      </Button>
      <div>{`formData.fruit is ${formData?.fruit}`}</div>
    </>
  );
};

export const CheckboxTest: FormStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const fruitCheckbox = canvas.getByTestId('fruit');

    const showFormDataBtu = canvas.getByTestId('showFormDataBtu');
    const setFormDataBtu = canvas.getByTestId('setFormDataBtu');

    await step(
      'Set "Fruit" checkbox defaultChecked is false, Click "Show Form Data" button. Then fruit is false',
      async () => {
        await expect(
          await canvas.findByText('formData.fruit is undefined')
        ).toBeInTheDocument();

        await userEvent.click(showFormDataBtu);

        await expect(
          await canvas.findByText('formData.fruit is false')
        ).toBeInTheDocument();

        await expect(fruitCheckbox).not.toBeChecked();
      }
    );

    await step(
      'Click "Fruit" checkbox, Click "Show Form Data" button. Then fruit is true',
      async () => {
        await userEvent.click(fruitCheckbox);

        await userEvent.click(showFormDataBtu);

        await expect(
          await canvas.findByText('formData.fruit is true')
        ).toBeInTheDocument();

        await expect(fruitCheckbox).toBeChecked();
      }
    );

    await step(
      'Click "Set Fruit False" button, Click "Show Form Data" button. Then fruit is false',
      async () => {
        await userEvent.click(setFormDataBtu);

        await expect(fruitCheckbox).not.toBeChecked();

        await userEvent.click(showFormDataBtu);

        await expect(
          await canvas.findByText('formData.fruit is false')
        ).toBeInTheDocument();
      }
    );
  },
};
