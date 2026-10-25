import { expect, spyOn } from 'storybook/test';

import {
  focusNotFound,
  setMethodNotFound,
  setValuesFirstParamNotArray,
  valuePathNotFoundEntry,
} from '../../components/form/entries';
import {
  focusFieldByPath,
  getValueByPath,
  getValues,
  setHelpTextByPath,
  setValueByPath,
  setValues,
  validateField,
} from '../../components/form/formUtil';
import { type FormStory } from '../nativeForm/nativeFormStory.types';

// eslint-disable-next-line react-refresh/only-export-components
const Test = () => {
  return <div>测试FormUtil的分支逻辑</div>;
};

export const FormUtilBranchTest: FormStory = {
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => <Test />,
  play: async ({ step }) => {
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => { });

    try {
      await step(
        'In "getValues", When the field do not has "get" method, should return empty object',
        async () => {
          const values = getValues({
            name: {
              path: 'name',
            },
          });

          await expect(values).toEqual({});
        }
      );

      await step(
        'In "getValueByPath", When formRegister is undefined, should return undefined',
        async () => {
          const value = getValueByPath('name', {});

          await expect(value).toBeUndefined();
        }
      );

      await step(
        'In "getValueByPath", When form item do not has "get" method, should return undefined',
        async () => {
          const value = getValueByPath('name', {
            name: {
              path: 'name',
            },
          });
          await expect(value).toBeUndefined();
        }
      );

      await step(
        `In "setHelpTextByPath", When formRegister is undefined, should warn ${valuePathNotFoundEntry('name')}`,
        async () => {
          setHelpTextByPath('name', 'This is help text', {});

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${valuePathNotFoundEntry('name')}`
          );
        }
      );

      await step(
        `In "setValues", When first parameter is not array, should warn ${setValuesFirstParamNotArray()}`,
        async () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          setValues({}, {});

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${setValuesFirstParamNotArray()}`
          );
        }
      );

      await step(
        `In "setValues", When formRegister do not have set method, should warn ${setMethodNotFound()}`,
        async () => {
          setValues(
            [
              {
                path: 'name',
                value: 'Tom',
              },
            ],
            {}
          );

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${setMethodNotFound()}`
          );
        }
      );

      await step(
        `In setValues,When validation failed, should return helper info for that path.`,
        async () => {
          const helpInfos = setValues(
            [
              { path: 'name', value: 'Tom' },
              { path: 'salary', value: '800000' },
            ],
            {
              name: {
                path: 'name',
                set: () => { },
                validate: () => 'This is help text.',
              },
              salary: {
                path: 'salary',
                set: () => { },
                validate: () => 'This is help text.',
              },
            }
          );

          expect(helpInfos).toEqual([
            { helpInfo: 'This is help text.', path: 'name' },
            { helpInfo: 'This is help text.', path: 'salary' },
          ]);
        }
      );

      await step(
        `In "setValueByPath", When formRegister is undefined, should warn ${valuePathNotFoundEntry('name')}`,
        async () => {
          setValueByPath('name', 'Tom', {});

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${valuePathNotFoundEntry('name')}`
          );
        }
      );

      await step(
        `In "setValueByPath", When formRegister do not have set method, should warn ${setMethodNotFound()}`,
        async () => {
          setValueByPath('name', 'Tom', {
            name: {
              path: 'name',
            },
          });

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${setMethodNotFound()}`
          );
        }
      );

      await step(
        `In setValueByPath,When validation failed, should return helper info.`,
        async () => {
          const helpInfo = setValueByPath('name', 'Tom', {
            name: {
              path: 'name',
              set: () => { },
              validate: () => 'This is help text.',
            },
          });

          expect(helpInfo).toEqual('This is help text.');
        }
      );

      await step(
        `In "validateField", When formRegister do not have the path, should warn ${valuePathNotFoundEntry('validatePath')}`,
        async () => {
          const result = validateField('validatePath', {});

          await expect(result).toBeUndefined();
          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${valuePathNotFoundEntry('validatePath')}`
          );
        }
      );

      await step(
        `In "focusFieldByPath", When form item do not have a focusable fieldRef, should warn ${focusNotFound('name')}`,
        async () => {
          focusFieldByPath('name', {
            name: {
              path: 'name',
            },
          });

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${focusNotFound('name')}`
          );
        }
      );

      await step(
        `In "focusFieldByPath", When formRegister do not have the path, should warn ${valuePathNotFoundEntry('name')}`,
        async () => {
          focusFieldByPath('name', {});

          await expect(warnSpy).toHaveBeenCalledWith(
            `[litten warning]: ${valuePathNotFoundEntry('name')}`
          );
        }
      );
    } finally {
      warnSpy.mockRestore();
    }
  },
};
