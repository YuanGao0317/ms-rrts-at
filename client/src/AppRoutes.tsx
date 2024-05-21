import { FC, lazy, LazyExoticComponent, Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import AppPage from 'src/features/AppPage';
import Home from 'src/features/home/home';

const ConfirmEmail: LazyExoticComponent<FC> = lazy(() => import('src/features/auth/components/ConfirmEmail'));
const ResetPassword: LazyExoticComponent<FC> = lazy(() => import('src/features/auth/components/ResetPassword'));

const AppRouter: FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <AppPage />
    },
    {
      path: '/',
      element: <Home />
    },
    {
      path: 'confirm_email',
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <ConfirmEmail />
        </Suspense>
      )
    },
    {
      path: 'reset_password',
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPassword />
        </Suspense>
      )
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
