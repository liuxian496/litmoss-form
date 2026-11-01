import { useState } from 'react';

import { expect, spyOn, userEvent, within } from 'storybook/test';

import { FormPaths } from '../../pockets/form/form.types';
import { NativeTextField } from '../../pockets/nativeForm/nativeTextField';

import { valuePathNotFoundEntry } from '../../components/form/entries';
import { Form } from '../../components/form/form';
import { useForm } from '../../components/form/useForm';
import { type FormStory } from '../nativeForm/nativeFormStory.types';

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
    } finally {
      warnSpy.mockRestore();
    }
  },
};
