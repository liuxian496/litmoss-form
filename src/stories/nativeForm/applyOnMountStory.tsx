import { useState } from 'react';

import { expect, spyOn, userEvent, within } from 'storybook/test';

import { FormPaths, ValidationType } from '../../pockets/form';
import { NativeTextField } from '../../pockets/nativeForm/nativeTextField';

import { valuePathNotFoundEntry } from '../../components/form/entries';
import { Form } from '../../components/form/form';
import { useForm } from '../../components/form/useForm';
import { type FormStory } from '../nativeForm/nativeFormStory.types';

const emailMustContainAt = 'Email must contain @.';

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  const [formRef, myForm] = useForm();

  const [isShow, setIsShow] = useState(false);

  function handlePresetByPathClick() {
    myForm?.setValueByPath(FormPaths.email, 'jerry@example.com', true);
  }

  function handlePresetByValuesClick() {
    myForm?.setValues([
      { path: FormPaths.role, value: 'Tom', applyOnMount: true },
    ]);
  }

  function handleSetWithoutApplyOnMountClick() {
    myForm?.setValueByPath(FormPaths.email, 'tom@example.com');
  }

  function handlePresetInvalidEmailClick() {
    myForm?.setValueByPath(FormPaths.email, 'invalid-email', true);
  }

  return (
    <div>
      <label>
        Show Fields:
        <input
          type="checkbox"
          data-testid="showFields"
          checked={isShow}
          onChange={(e) => setIsShow(e.target.checked)}
        />
      </label>
      <Form ref={formRef}>
        {isShow && (
          <>
            <NativeTextField
              data-testid="emailTextField"
              label="Email:"
              path={FormPaths.email}
              initialValue=""
              validations={[
                {
                  type: ValidationType.Customize,
                  validationAssert: (value) => String(value).includes('@'),
                  helpInfo: emailMustContainAt,
                },
              ]}
            />
            <NativeTextField
              data-testid="roleTextField"
              label="Role:"
              path={FormPaths.role}
              initialValue="Guest"
            />
          </>
        )}
      </Form>
      <button onClick={handlePresetByPathClick}>Preset By Path</button>
      <button onClick={handlePresetByValuesClick}>Preset By Values</button>
      <button onClick={handleSetWithoutApplyOnMountClick}>
        Set Without ApplyOnMount
      </button>
      <button onClick={handlePresetInvalidEmailClick}>
        Preset Invalid Email
      </button>
    </div>
  );
};

export const ApplyOnMountTest: FormStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const showFieldsCheckbox = await canvas.findByTestId('showFields');
      const presetByPathButton = await canvas.findByRole('button', {
        name: 'Preset By Path',
      });
      const presetByValuesButton = await canvas.findByRole('button', {
        name: 'Preset By Values',
      });
      const setWithoutApplyOnMountButton = await canvas.findByRole('button', {
        name: 'Set Without ApplyOnMount',
      });
      const presetInvalidEmailButton = await canvas.findByRole('button', {
        name: 'Preset Invalid Email',
      });

      await step('Fields are not rendered initially', async () => {
        await expect(canvas.queryByTestId('emailTextField')).toBeNull();
        await expect(canvas.queryByTestId('roleTextField')).toBeNull();
      });

      await step(
        'Preset values with applyOnMount while fields are unmounted, should not warn',
        async () => {
          await userEvent.click(presetByPathButton);
          await userEvent.click(presetByValuesButton);

          await expect(warnSpy).not.toHaveBeenCalled();
        }
      );

      await step(
        'Show fields, Then preset values take precedence over initialValue',
        async () => {
          await userEvent.click(showFieldsCheckbox);

          await expect(await canvas.findByTestId('emailTextField')).toHaveValue(
            'jerry@example.com'
          );
          await expect(await canvas.findByTestId('roleTextField')).toHaveValue(
            'Tom'
          );
          await expect(canvas.queryByText(emailMustContainAt)).toBeNull();
        }
      );

      await step(
        'Hide and show fields again, Then preset values are consumed and initialValue is used',
        async () => {
          await userEvent.click(showFieldsCheckbox);
          await userEvent.click(showFieldsCheckbox);

          await expect(await canvas.findByTestId('emailTextField')).toHaveValue(
            ''
          );
          await expect(await canvas.findByTestId('roleTextField')).toHaveValue(
            'Guest'
          );
        }
      );

      await step(
        `Hide fields, Set value without applyOnMount, should warn ${valuePathNotFoundEntry(FormPaths.email)} and keep initialValue after mount`,
        async () => {
          await userEvent.click(showFieldsCheckbox);
          await userEvent.click(setWithoutApplyOnMountButton);

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${valuePathNotFoundEntry(FormPaths.email)}`
          );

          await userEvent.click(showFieldsCheckbox);

          await expect(await canvas.findByTestId('emailTextField')).toHaveValue(
            ''
          );
        }
      );

      await step(
        'Hide fields, Preset invalid email with applyOnMount, Then show fields, Should validate on mount without focusing',
        async () => {
          await userEvent.click(showFieldsCheckbox);
          await userEvent.click(presetInvalidEmailButton);
          await userEvent.click(showFieldsCheckbox);

          const emailTextField = await canvas.findByTestId('emailTextField');
          await expect(emailTextField).toHaveValue('invalid-email');
          await expect(
            await canvas.findByText(emailMustContainAt)
          ).toBeInTheDocument();
          await expect(emailTextField).not.toHaveFocus();
        }
      );
    } finally {
      warnSpy.mockRestore();
    }
  },
};
