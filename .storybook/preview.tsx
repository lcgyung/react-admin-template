import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Preview } from '@storybook/react-vite';

import { createAppTheme } from '@/features/theme';

const theme = createAppTheme('light');

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
