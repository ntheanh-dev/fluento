import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
// removed unused ThemeProvider/createTheme
import { ConfigProvider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./index.css";
import { enableMocks } from "./mocks/index.ts";
import { ReactQueryProvider } from "@/app/providers/ReactQueryProvider.tsx";
import { lazy } from "react";
// Auth
const Login = lazy(() => import("@/features/auth/ui/Login"));
const Register = lazy(() => import("@/features/auth/ui/Register"));
const Authenticate = lazy(() => import("@/features/auth/ui/Authenticated"));
const RequiredAuth = lazy(() => import("@/features/auth/ui/RequiredAuth"));

// Dashboard
const Dashboard = lazy(() => import("@/features/dashboard"));

// Practice
import PracticeSetup from "@/features/practice/ui/PracticeSetup";
const PracticeSession = lazy(
  () => import("@/features/practice/ui/PracticeSession"),
);
const ResultScreen = lazy(() => import("@/features/practice/ui/[id]/ResultScreen.tsx"));
const ResultDetailScreen = lazy(() => import("@/features/practice/ui/[id]/ResultDetailScreen.tsx"));
const SentencePracticePage = lazy(() => import("@/features/practice/ui/[id]"));


// History / Ranking / Profile
const History = lazy(() => import("@/features/history"));
const Rankings = lazy(() => import("@/features/ranking"));
const Profile = lazy(() => import("@/features/profile/ui"));

// Layout
const Layout = lazy(() => import("@/layouts/Layout"));
import { Suspense } from "react";
import LandingPage from "@/features/landing/index.tsx";

// await enableMocks();

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#198de6",
          fontFamily: "Lexend, sans-serif",
        },
      }}
    >
      <ReactQueryProvider>
        <BrowserRouter>
          <Suspense fallback={<Spin fullscreen indicator={<LoadingOutlined spin />} />}>
            <Routes>
              <Route
                element={
                  <RequiredAuth>
                    <Layout />
                  </RequiredAuth>
                }
              >
                <Route index path="/dashboard" element={<Dashboard />} />
                <Route path="practice" element={<PracticeSetup />} />
                <Route path="practice/session" element={<PracticeSession />} />
                <Route path="practice/:id" element={<SentencePracticePage />} />
                <Route path="practice/:id/result" element={<ResultScreen />} />
                <Route path="practice/:id/result/detail" element={<ResultDetailScreen />} />
                <Route path="history" element={<History />} />
                <Route path="rankings" element={<Rankings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>

              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="/oauth/authenticate" element={<Authenticate />} />
              <Route path="/home" element={<Layout />}>
                <Route index element={<LandingPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ReactQueryProvider>
    </ConfigProvider>
  );
}

export default App;
