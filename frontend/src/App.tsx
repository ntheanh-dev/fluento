import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// removed unused ThemeProvider/createTheme
import { Snackbar, Alert, Backdrop, CircularProgress, Box } from "@mui/material";
import { MainLayout } from "./layouts/MainLayout";
import Home from "./pages/Home";
import Analytic from "./pages/Analysic";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Writing from "./pages/Writing";
import VocabularyPractice from "./pages/VocabularyPractice";
import BilingualPassage from "./pages/BilingualPassage";
import ListeningPractice from "./pages/ListeningPractice";
import SpeakingPractice from "./pages/SpeakingPractice";
import Profile from "./pages/Profile";
import DeckManagement from "./components/vocabulary/DeckManagement";
import NoteManagement from "./components/vocabulary/NoteManagement";
import { StudySession as StudySessionPage, StudyModeSelection } from "./components/vocabulary/study";
import { RequiredAuth } from "./components/auth";
import "./index.css";
import Authenticate from "./pages/Authenticated";
import { useEffect, useState } from "react";
import { setNotifyHandler, type NotifySeverity } from "./utils/notify";
import { setOverlayHandler } from "./utils/overlay";
import { AuthProvider } from "./contexts/AuthContext";

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

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          <Route
            path="/writing"
            element={
              <RequiredAuth>
                <MainLayout>
                  <Writing />
                </MainLayout>
              </RequiredAuth>
            }
          />

          <Route
            path="/vocabulary"
            element={
              <RequiredAuth>
                <MainLayout>
                  <VocabularyPractice />
                </MainLayout>
              </RequiredAuth>
            }
          />
          <Route
            path="/sentence-writing/:conversationId"
            element={
              <RequiredAuth>
                <MainLayout>
                  <BilingualPassage />
                </MainLayout>
              </RequiredAuth>
            }
          />

          <Route
            path="/listening-practice"
            element={
              <RequiredAuth>
                <MainLayout>
                  <ListeningPractice />
                </MainLayout>
              </RequiredAuth>
            }
          />

          <Route
            path="/speaking-practice"
            element={
              <RequiredAuth>
                <MainLayout>
                  <SpeakingPractice />
                </MainLayout>
              </RequiredAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequiredAuth>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </RequiredAuth>
            }
          />

          {/* Vocabulary Management Routes */}
          <Route
            path="/vocabulary/decks"
            element={
              <RequiredAuth>
                <MainLayout>
                  <DeckManagement />
                </MainLayout>
              </RequiredAuth>
            }
          />
          <Route
            path="/vocabulary/decks/:deckId"
            element={
              <RequiredAuth>
                <MainLayout>
                  <NoteManagement />
                </MainLayout>
              </RequiredAuth>
            }
          />
          <Route
            path="/vocabulary/notes"
            element={
              <RequiredAuth>
                <MainLayout>
                  <NoteManagement />
                </MainLayout>
              </RequiredAuth>
            }
          />
          <Route
            path="/vocabulary/study-mode/decks/:deckId"
            element={
              <RequiredAuth>
                <MainLayout>
                  <StudyModeSelection />
                </MainLayout>
              </RequiredAuth>
            }
          />
          <Route
            path="/vocabulary/study"
            element={
              <RequiredAuth>
                <MainLayout>
                  <StudySessionPage />
                </MainLayout>
              </RequiredAuth>
            }
          />

          <Route path="/oauth/authenticate" element={<Authenticate />} />

          {publicRoutes.map((route, index) => {
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <RequiredAuth>
                    <MainLayout>
                      <Page />
                    </MainLayout>
                  </RequiredAuth>
                }
              />
            );
          })}

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />

          <Route path="/login" element={<Login />} />
        </Routes>
        <Backdrop open={overlay.open} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2000 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress color="inherit" size={24} />
            <span>{overlay.message || 'Đang xử lý...'}</span>
          </Box>
        </Backdrop>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Router>
    </AuthProvider>
  );
}

const publicRoutes = [
  // { path: '/login', component: Login, isNotDefault: true },
  { path: "/analytic", component: Analytic },
  { path: "/contact", component: Contact },
];

export default App;
