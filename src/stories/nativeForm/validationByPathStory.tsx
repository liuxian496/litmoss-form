import { expect, userEvent, within } from 'storybook/test';

import { FormPaths, ValidationType } from '../../pockets/form';
import { NativeTextField } from '../../pockets/nativeForm/nativeTextField';

import { Form } from '../../components/form/form';
import { ValidationMode } from '../../components/form/form.types';
import { useForm } from '../../components/form/useForm';

import { type FormStory } from './nativeFormStory.types';

const salaryMustBeNumberGreaterThanOneMillion =
  'Salary must be a number greater than 1,000,000.';

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  const [formRef, basicForm] = useForm();

  function handleValidateNameButtonClick() {
    const validationResult = basicForm?.validateField(FormPaths.name);
    if (validationResult?.helpInfo) return;
    const values = basicForm?.getValues();

    console.log('Form values:', values);
  }
  function handleValidateSalaryButtonClick() {
    const validationResult = basicForm?.validateField(FormPaths.salary);
    if (validationResult?.helpInfo) return;
    const values = basicForm?.getValues();

    console.log('Form values:', values);
  }

  function validateSalary(value: unknown): boolean {
    const salary = Number(value);
    if (isNaN(salary)) return false;
    return salary > 1000000;
  }

  return (
    <>
      <Form ref={formRef} validationMode={ValidationMode.step}>
        <NativeTextField
          label="Name:"
          path={FormPaths.name}
          validations={[
            {
              type: ValidationType.StringRequired,
            },
          ]}
        />
        <NativeTextField
          label="Salary:"
          path={FormPaths.salary}
          validations={[
            {
              type: ValidationType.Customize,
              validationAssert: validateSalary,
              helpInfo: salaryMustBeNumberGreaterThanOneMillion,
            },
          ]}
        />
      </Form>
      <button onClick={handleValidateNameButtonClick}>Validate Name</button>
      <button onClick={handleValidateSalaryButtonClick}>Validate Salary</button>
    </>
  );
};

export const ValidationByPathTest: FormStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const nameInput = canvas.getByLabelText('Name:');
    const salaryInput = canvas.getByLabelText('Salary:');
    const validateNameButton = canvas.getByText('Validate Name');
    const validateSalaryButton = canvas.getByText('Validate Salary');

    await step(
      'Click Validate Name button with empty fields, Then "Name" validation errors to be displayed and "Salary" errors not to be displayed',
      async () => {
        await userEvent.click(validateNameButton);

        const nameError = await canvas.findByText('This field is required.');
        const salaryError = await canvas.queryByText(
          salaryMustBeNumberGreaterThanOneMillion
        );

        await expect(nameError).toBeInTheDocument();
        await expect(salaryError).not.toBeInTheDocument();
      }
    );

    await step(
      'Type "Tom" in Name Field, Click Validate Salary button, Then "Salary" field validation error to be displayed',
      async () => {
        await userEvent.type(nameInput, 'Tom');
        await userEvent.click(validateSalaryButton);

        const nameError = await canvas.queryByText('This field is required.');
        const salaryError = await canvas.findByText(
          salaryMustBeNumberGreaterThanOneMillion
        );

        await expect(nameError).not.toBeInTheDocument();
        await expect(salaryError).toBeInTheDocument();
      }
    );

    await step(
      'Type valid salary, Click Validate Salary button, Then no validation error to be displayed',
      async () => {
        await userEvent.type(salaryInput, '1500000');
        await userEvent.click(validateSalaryButton);

        const nameError = canvas.queryByText('This field is required.');
        const salaryError = canvas.queryByText(
          salaryMustBeNumberGreaterThanOneMillion
        );

        await expect(nameError).not.toBeInTheDocument();
        await expect(salaryError).not.toBeInTheDocument();
      }
    );
  },
};
