import "./App.css";

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConfigProvider } from "antd";
import { Dashboard } from "./pages/dashboard";
import PracticeSetup from "./pages/practice/PracticeSetup";
import PracticeSession from "./pages/practice/PracticeSession";
import AnalysisResult from "./pages/statistic/AnalysisResult";
import History from "./pages/history";
import Rankings from "./pages/ranking";
import Profile from "./pages/profile";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/Layout";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#198de6',
          fontFamily: 'Lexend, sans-serif',
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="practice" element={<PracticeSetup />} />
              <Route path="practice/session" element={<PracticeSession />} />
              <Route path="practice/result" element={<AnalysisResult />} />
              <Route path="history" element={<History />} />
              <Route path="rankings" element={<Rankings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
};

export default App;
