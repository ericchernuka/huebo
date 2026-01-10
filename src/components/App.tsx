import { Navigate, Route, Routes } from 'react-router';
import GoogleAnalytics from './GoogleAnalytics';
import Huebo from './Huebo';

export default function App() {
  return (
    <>
      <GoogleAnalytics />
      <Routes>
        <Route element={<Huebo />} path="/:hue/:saturation?/:brightness?" />
        <Route element={<Navigate replace to="/60" />} path="/" />
      </Routes>
    </>
  );
}
