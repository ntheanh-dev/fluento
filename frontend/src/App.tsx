import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
// removed unused ThemeProvider/createTheme
import { ConfigProvider } from "antd";
import PracticeSetup from "./features/practice/PracticeSetup.tsx";
import PracticeSession from "./features/practice/PracticeSession.tsx";
import AnalysisResult from "./features/statistic/AnalysisResult.tsx";
import History from "./features/history/index.tsx";
import Rankings from "./features/ranking/index.tsx";
import Profile from "./features/profile/ui/index.tsx";
import Layout from "./layouts/Layout";

import "./index.css";
import { useEffect, useState } from "react";
import { setNotifyHandler, type NotifySeverity } from "./utils/notify";
import { setOverlayHandler } from "./utils/overlay";
import Login from "./features/auth/ui/Login.tsx";
import { enableMocks } from "./mocks/index.ts";
import { ReactQueryProvider } from "./app/providers/ReactQueryProvider.tsx";
import Dashboard from "./features/dashboard/index.tsx";
import Register from "./features/auth/ui/Register.tsx";
import Authenticate from "./features/auth/ui/Authenticated.tsx";
import RequiredAuth from "./features/auth/ui/RequiredAuth.tsx";

// await enableMocks();


function App() {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: NotifySeverity }>(
    { open: false, message: "", severity: "info" }
  );
  const [overlay, setOverlay] = useState<{ open: boolean; message?: string }>({ open: false });


  useEffect(() => {
    setNotifyHandler((message, severity = "info") => {
      setSnackbar({ open: true, message, severity });
    });
    setOverlayHandler((open, options) => {
      setOverlay({ open, message: options?.message });
    });
  }, []);


  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#198de6',
          fontFamily: 'Lexend, sans-serif',
        },
      }}
    >
      <ReactQueryProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RequiredAuth><Layout /></RequiredAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="practice" element={<PracticeSetup />} />
              <Route path="practice/session" element={<PracticeSession />} />
              <Route path="practice/result" element={<AnalysisResult />} />
              <Route path="history" element={<History />} />
              <Route path="rankings" element={<Rankings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="/oauth/authenticate" element={<Authenticate />} />
          </Routes>
        </BrowserRouter>
      </ReactQueryProvider>

    </ConfigProvider>
  );
}

export default App;
