import { Outlet } from '@tanstack/react-router';
import GoogleAnalytics from './GoogleAnalytics';

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <Outlet />
    </>
  );
}
