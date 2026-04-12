import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { ConfigProvider, Spin, theme as antdTheme } from "antd";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./index.css";
import { ReactQueryProvider } from "@/app/providers/ReactQueryProvider.tsx";
import { ThemeProvider, useTheme } from "@/app/providers/ThemeProvider";
import { lazy, type PropsWithChildren } from "react";
// Auth
const Login = lazy(() => import("@/features/auth/ui/Login"));
const Register = lazy(() => import("@/features/auth/ui/Register"));
const Authenticate = lazy(() => import("@/features/auth/ui/Authenticated"));
const RequiredAuth = lazy(() => import("@/features/auth/ui/RequiredAuth"));
const RequiredAdmin = lazy(() => import("@/features/auth/ui/RequiredAdmin"));

// Dashboard
const Dashboard = lazy(() => import("@/features/dashboard"));

// Practice
import PracticeSetup from "@/features/practice/ui/PracticeSetup";
const ResultScreen = lazy(() => import("@/features/practice/ui/[id]/ResultScreen.tsx"));
const ResultDetailScreen = lazy(() => import("@/features/practice/ui/[id]/ResultDetailScreen.tsx"));
const SentencePracticePage = lazy(() => import("@/features/practice/ui/[id]"));


// History / Ranking / Profile
const History = lazy(() => import("@/features/history"));
const Rankings = lazy(() => import("@/features/ranking"));
const Profile = lazy(() => import("@/features/profile/ui"));

// Admin
const Admin = lazy(() => import("@/features/admin"));

// Layout
const Layout = lazy(() => import("@/layouts/Layout"));
import { Suspense } from "react";
import LandingPage from "@/features/landing/index.tsx";

function AntdThemeConfig({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const antdLocale = i18n.language.startsWith("en") ? enUS : viVN;
  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#198de6",
          fontFamily: "Lexend, sans-serif",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AntdThemeConfig>
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
                  <Route path="practice/:id" element={<SentencePracticePage />} />
                  <Route path="practice/:id/result" element={<ResultScreen />} />
                  <Route path="practice/:id/result/detail" element={<ResultDetailScreen />} />
                  <Route path="history" element={<History />} />
                  <Route path="rankings" element={<Rankings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route
                    path="admin"
                    element={
                      <RequiredAdmin>
                        <Admin />
                      </RequiredAdmin>
                    }
                  />
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
      </AntdThemeConfig>
    </ThemeProvider>
  );
}

export default App;
