import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy } from "react";
import RootLayout from "./layouts/RootLayout";

const IndexPage = lazy(() => import("./pages/IndexPage"));
const Login = lazy(() => import("./pages/auth/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const App = () => (
  <BrowserRouter basename="/network-discovery-v2">
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route path="" element={<IndexPage />}>
          <Route path="auth" element={<Login />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
