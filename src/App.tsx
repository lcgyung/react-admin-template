import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/providers/AppProviders';
import { router } from '@/routes';

export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);
