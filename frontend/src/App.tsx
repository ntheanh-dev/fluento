import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { ConfigProvider, Spin, theme as antdTheme } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import { useTranslation } from "react-i18next";
import "./index.css";
import { ReactQueryProvider } from "@/app/providers/ReactQueryProvider.tsx";
import { ThemeProvider, useTheme } from "@/app/providers/ThemeProvider";
import { lazy, type PropsWithChildren } from "react";
// Auth
const Authenticate = lazy(() => import("@/features/auth/ui/Authenticated"));
const RequiredAuth = lazy(() => import("@/features/auth/ui/RequiredAuth"));
const RequiredAdmin = lazy(() => import("@/features/auth/ui/RequiredAdmin"));

// Practice
import SingleSentenceSetup from "@/features/practice/ui/SingleSentenceSetup";
const ParagraphLibraryPage = lazy(() => import("@/features/paragraph/ui"));
const ResultScreen = lazy(() => import("@/features/practice/ui/[id]/ResultScreen.tsx"));
const ResultDetailScreen = lazy(() => import("@/features/practice/ui/[id]/ResultDetailScreen.tsx"));
const SentencePracticePage = lazy(() => import("@/features/practice/ui/[id]"));


// History / Ranking / Profile
const History = lazy(() => import("@/features/history"));
const Rankings = lazy(() => import("@/features/ranking"));
const DeckManagement = lazy(() => import("@/features/deck/ui"));
const DeckDetail = lazy(() => import("@/features/deck/ui/[id]"));
const DeckPracticeModePage = lazy(() => import("@/features/deck/ui/practice/PracticeModeRouter"));
const Profile = lazy(() => import("@/features/profile/ui"));
const ProfileDetailsSection = lazy(() =>
  import("@/features/profile/ui/ProfileDetails").then((m) => ({
    default: m.ProfileDetailsSection,
  })),
);
const Subscription = lazy(() =>
  import("@/features/profile/ui/Subscription").then((m) => ({
    default: m.Subscription,
  })),
);

// Admin
const Admin = lazy(() => import("@/features/admin"));

// Layout
const Layout = lazy(() => import("@/layouts/Layout"));
import { Suspense } from "react";
import LandingPage from "@/features/landing/index.tsx";
import NotFoundPage from "@/features/NotFoundPage";
import Home from "@/features/home/ui/index.tsx";
import { SupportFacebookBubble } from "@/components/SupportFacebookBubble";
import { AppSpinner } from "@/shared/components/AppSpinner";

Spin.setDefaultIndicator(<LoadingOutlined spin className="text-[#198de6]" />);

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
            <SupportFacebookBubble />
            <Suspense fallback={<AppSpinner fullscreen />}>
              <Routes>
                <Route
                  element={
                    <RequiredAuth>
                      <Layout />
                    </RequiredAuth>
                  }
                >
                  <Route path="/home" index element={<Home />} />
                  <Route path="practice" element={<Navigate to="/practice/single-sentence" replace />} />
                  <Route path="practice/single-sentence" element={<SingleSentenceSetup />} />
                  <Route path="practice/:id" element={<SentencePracticePage />} />
                  <Route path="practice/:id/result" element={<ResultScreen />} />
                  <Route path="practice/:id/result/detail" element={<ResultDetailScreen />} />
                  <Route path="history" element={<History />} />
                  <Route path="decks" element={<DeckManagement />} />
                  <Route path="decks/:id" element={<DeckDetail />} />
                  <Route path="decks/practice/:mode" element={<DeckPracticeModePage />} />
                  <Route path="rankings" element={<Rankings />} />
                  <Route path="profile" element={<Profile />}>
                    <Route
                      index
                      element={<Navigate to="/profile/details" replace />}
                    />
                    <Route
                      path="details"
                      element={<ProfileDetailsSection />}
                    />
                    <Route
                      path="history"
                      element={<Navigate to="/profile/details" replace />}
                    />
                    <Route
                      path="subscription"
                      element={<Subscription />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to="/profile/details" replace />}
                    />
                  </Route>
                  <Route path="404" element={<NotFoundPage />} />
                  <Route
                    path="admin"
                    element={
                      <RequiredAdmin>
                        <Admin />
                      </RequiredAdmin>
                    }
                  />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Route>

                <Route path="/oauth/authenticate" element={<Authenticate />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="paragraphs" element={<ParagraphLibraryPage />} />
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
