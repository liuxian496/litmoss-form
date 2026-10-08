import type { Preview } from '@storybook/react-vite';
import 'litmoss/dist/assets/button.css';
import 'litmoss/dist/assets/checkbox.css';
import 'litmoss/dist/assets/formLabel.css';
import 'litmoss/dist/assets/ripple.css';
import 'litmoss/dist/assets/stackPanel.css';
import 'litmoss/dist/assets/textField.css';

import { initLittenForm } from '../src/components/inject';
import {
  commonValidationAssert,
  getDefaultHelperInfo,
} from '../src/pockets/form/validation';

initLittenForm({
  commonValidationAssert: commonValidationAssert,
  getDefaultHelperInfo: getDefaultHelperInfo,
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
