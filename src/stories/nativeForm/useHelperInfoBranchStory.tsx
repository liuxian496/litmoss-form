import { expect, spyOn, userEvent } from 'storybook/test';

import { FormPaths } from '../../pockets/form';
import {
  commonValidationAssert,
  getDefaultHelperInfo,
  ValidationType,
} from '../../pockets/form/validation';
import { NativeTextField } from '../../pockets/nativeForm/nativeTextField';

import {
  commonValidationAssertNotFound,
  validationAssertNotFoundEntry,
} from '../../components/form/entries';
import { Form } from '../../components/form/form';
import { useForm } from '../../components/form/useForm';
import { initLittenForm } from '../../components/inject';
import { type FormStory } from '../nativeForm/nativeFormStory.types';

function validateSalary(value: unknown): boolean {
  const salary = Number(value);
  if (isNaN(salary)) return false;
  return salary > 1000000;
}

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  const [formRef, basicForm] = useForm();

  function handleSaveButtonClick() {
    const validationResult = basicForm?.validate() ?? [];
    if (validationResult?.length > 0) return;
    const values = basicForm?.getValues();

    console.log('Form values:', values);
  }

  return (
    <div>
      测试useHelperInfo的分支逻辑{' '}
      <Form ref={formRef}>
        <NativeTextField
          label="Role:"
          path={FormPaths.role}
          validations={[
            {
              type: ValidationType.StringRequired,
            },
          ]}
        />
        <NativeTextField
          label="Custom without assert:"
          path="customNoAssert"
          validations={[{ type: ValidationType.Customize }]}
        />
        <NativeTextField
          label="Salary:"
          path={FormPaths.salary}
          validations={[
            {
              type: ValidationType.Customize,
              validationAssert: validateSalary,
            },
          ]}
        />
      </Form>
      <button onClick={handleSaveButtonClick}>Save</button>
    </div>
  );
};

export const UseHelperInfoBranchTest: FormStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
  play: async ({ canvas, step }) => {
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => { });
    const saveButton = canvas.getByText('Save');

    try {
      initLittenForm({});

      await step(
        `Set [initLittenForm] with empty object, Click Save Button, Then warning is shown and helper info is not shown`,
        async () => {
          await userEvent.click(saveButton);

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${commonValidationAssertNotFound()}`
          );

          await expect(
            canvas.queryByText('This field is required.')
          ).toBeNull();
        }
      );

      await step(
        'When use customize validation, missing validationAssert, then warning to be in the document.',
        async () => {
          expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${validationAssertNotFoundEntry('customNoAssert')}`
          );
        }
      );

      // 测试自定义验证时，getDefaultHelperInfo没有设置，helpInfo没有设置时，返回的帮助信息是undefined的场景
      await step(
        'Role is empty, type invalid salary, then “This field is required.” to be in the document',
        async () => {
          const salaryInput = canvas.getByLabelText('Salary:');
          await userEvent.type(salaryInput, '500000');
          await userEvent.click(saveButton);

          await expect(
            canvas.queryByText('This field is required.')
          ).toBeNull();
        }
      );
    } finally {
      warnSpy.mockRestore();

      initLittenForm({
        commonValidationAssert: commonValidationAssert,
        getDefaultHelperInfo: getDefaultHelperInfo,
      });

      await step(
        `Reset [initLitmossForm] with commonValidationAssert and getDefaultHelperInfo, Click Save Button, Then helper info is shown`,
        async () => {
          await userEvent.click(saveButton);

          await expect(
            canvas.queryByText('This field is required.')
          ).toBeInTheDocument();
        }
      );
    }
  },
};
