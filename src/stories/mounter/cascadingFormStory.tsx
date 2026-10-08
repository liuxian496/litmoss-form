import { useState } from 'react';

import { Button } from 'litmoss/dist/button';
import { FormLabel } from 'litmoss/dist/formLabel';
import { expect, userEvent, within } from 'storybook/test';

import { type BasicFormData, FormPaths } from '../../pockets/form/form.types';
import { NativeTextField } from '../../pockets/nativeForm/nativeTextField';

import { Form } from '../../components/form/form';
import { useForm } from '../../components/form/useForm';
import { Mounter } from '../../components/mounter';
import { type MounterStory } from '../mounter/mounterStory.types';

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  const [formRef, myForm] = useForm();

  const [formData, setFormData] = useState<BasicFormData>();

  const [isSetEmailChecked, setIsSetEmailChecked] = useState(false);

  function handleShowFormDataBtuClick() {
    setFormData(myForm?.getValues() as BasicFormData);
  }

  function handleSetEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    setIsSetEmailChecked(checked);
  }

  function handleEmailDidMount() {
    myForm?.setValueByPath(FormPaths.email, 'jerry@example.com');
  }

  return (
    <>
      <Form ref={formRef}>
        <FormLabel label="Set Email:">
          <input
            type="checkbox"
            data-testid="setEmail"
            checked={isSetEmailChecked}
            onChange={handleSetEmailChange}
          />
        </FormLabel>
        <FormLabel label="Email:">
          {isSetEmailChecked && (
            <NativeTextField
              data-testid="email"
              path={FormPaths.email}
              initialValue=""
            />
          )}
        </FormLabel>
        {isSetEmailChecked && <Mounter onDidMount={handleEmailDidMount} />}
      </Form>

      <Button
        data-testid="showFormDataBtu"
        onClick={handleShowFormDataBtuClick}
      >
        Show Form Data
      </Button>
      <div>{`formData.email is ${formData?.email}`}</div>
    </>
  );
};

export const CascadingFormStory: MounterStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const setEmailCheckbox = await canvas.getByTestId('setEmail');
    const showFormDataBtu = await canvas.getByTestId('showFormDataBtu');

    await step(
      `"Set Email" checkbox default checked is false, then "Email:" TextField is not rendered`,
      async () => {
        await expect(setEmailCheckbox).not.toBeChecked();
        const emailTextField = canvas.queryByTestId('email');
        await expect(emailTextField).toBeNull();
      }
    );

    await step(
      `Click "Show Form Data" button, formData.email should be undefined`,
      async () => {
        await userEvent.click(showFormDataBtu);
        const formDataEmail = await canvas.getByText(/formData.email is/);
        await expect(formDataEmail).toHaveTextContent(
          'formData.email is undefined'
        );
      }
    );

    await step(
      `Check "Set Email" checkbox, then "Email:" TextField is rendered and formData.email should be "jerry@example.com"`,
      async () => {
        await userEvent.click(setEmailCheckbox);
        const emailTextField = await canvas.getByTestId('email');
        await expect(emailTextField).toBeInTheDocument();

        await userEvent.click(showFormDataBtu);
        const formDataEmail = await canvas.getByText(/formData.email is/);
        await expect(formDataEmail).toHaveTextContent(
          'formData.email is jerry@example.com'
        );
      }
    );
  },
};
