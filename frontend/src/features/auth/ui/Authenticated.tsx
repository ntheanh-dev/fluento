import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Box, Typography, Alert, Button } from "@mui/material";
import { message } from "antd";
import Cookies from "js-cookie";
import { useOAuthAuthenticateMutation } from "../mutation";
import { useProfileStore } from "../../../stores/profile";
import { ACCESS_TOKEN_EXPIRE_TIME } from "../constant";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "../../profile/query";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { AppSpinner } from "@/shared/components/AppSpinner";

export default function Authenticate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfile } = useProfileStore();
  const { mutateAsync: oauthAuthenticate } = useOAuthAuthenticateMutation();
  const { refetch: fetchUserProfile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname;
  const redirectPath = from && from !== "/" ? from : "/home";

  const authInProgress = useRef(false);

  useEffect(() => {
    if (authInProgress.current) {
      return;
    }

    authInProgress.current = true;

    const authenticateUser = async () => {
      const tr = (key: string, options?: Record<string, unknown>) =>
        i18n.t(key, options ?? {});

      try {
        const authCodeRegex = /code=([^&]+)/;
        const isMatch = window.location.href.match(authCodeRegex);

        if (!isMatch) {
          setError(tr("oauth.noCode"));
          return;
        }

        const authCode = isMatch[1];

        const { accessToken } = await oauthAuthenticate(authCode);

        if (!accessToken) {
          throw new Error(tr("oauth.noToken"));
        }

        Cookies.set("accessToken", accessToken, {
          expires: ACCESS_TOKEN_EXPIRE_TIME,
          secure: import.meta.env.PROD,
          sameSite: "strict",
          path: "/",
        });

        const { data: profile } = await fetchUserProfile();
        if (profile) {
          setProfile(profile);
          message.success(tr("oauth.success"));
          navigate(redirectPath, { replace: true });
        } else {
          throw new Error(tr("auth.noUserInfo"));
        }
      } catch (error: unknown) {
        const err = error as {
          response?: { status?: number; data?: { message?: string } };
          request?: unknown;
          message?: string;
        };
        let errorMessage = tr("oauth.unknownError");

        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;

          switch (status) {
            case 400:
              errorMessage = data?.message || tr("oauth.badRequest");
              break;
            case 401:
              errorMessage = tr("oauth.invalidCode");
              break;
            case 403:
              errorMessage = tr("oauth.forbidden");
              break;
            case 404:
              errorMessage = tr("oauth.notFound");
              break;
            case 500:
              errorMessage = tr("oauth.serverError");
              break;
            default:
              errorMessage =
                data?.message || tr("oauth.serverStatus", { status });
          }
        } else if (err.request) {
          errorMessage = tr("oauth.network");
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        authInProgress.current = false;
      }
    };

    void authenticateUser();
  }, []);

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
        }}
      >
        <Alert severity="error" sx={{ maxWidth: "400px" }}>
          {error}
        </Alert>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Button variant="contained" onClick={handleRetry}>
            {t("oauth.retry")}
          </Button>
          <Button variant="outlined" onClick={handleGoToLogin}>
            {t("oauth.backToLogin")}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <AppSpinner className="py-0" size="default" />
      <Typography>{t("oauth.authenticating")}</Typography>
    </Box>
  );
}
