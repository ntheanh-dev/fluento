import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { message } from "antd";
import Cookies from "js-cookie";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useLoginMutation } from "../mutation";
import type { LoginInput } from "../../../entities/auth/schema";
import { useProfileData, PROFILE_EMBED_PRACTICESTATS } from "../../profile/query";
import { useProfileStore } from "../../../stores/profile";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { ACCESS_TOKEN_EXPIRE_TIME } from "../constant";
import { getRuntimeEnv } from "../../../shared/config/runtime-env";
import logo from "../../../assets/image/logo3.png";
import { PASSWORD_MIN } from "../../../shared/validation/constant";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending } = useLoginMutation();
  const { refetch: refetchProfile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { setProfile } = useProfileStore();

  const loginSchema = useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .min(8, t("validation.usernameMin"))
            .max(40, t("validation.usernameMax")),
          password: z
            .string()
            .min(PASSWORD_MIN, t("validation.passwordMin", { min: PASSWORD_MIN }))
            .max(40, t("validation.passwordMax")),
        })
        .strict(),
    [t],
  );

  const method = useForm<LoginInput>({
    mode: "onBlur",
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const from = location.state?.from?.pathname;
  const redirectPath = from && from !== "/" ? from : "/home";

  const onSubmit = method.handleSubmit(async (data) => {
    try {
      const { accessToken } = await mutateAsync(data);
      Cookies.set("accessToken", accessToken, {
        expires: ACCESS_TOKEN_EXPIRE_TIME,
        secure: true,
        sameSite: "strict",
        path: "/",
      });

      const { data: profile } = await refetchProfile();

      if (!profile) {
        throw new Error(t("auth.noUserInfo"));
      }

      setProfile(profile);

      message.success(t("auth.loginSuccess"));
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        t("auth.loginFailed");
      message.error(errorMessage);
    }
  });

  const handleLoginWithGoogle = () => {
    const env = getRuntimeEnv();
    const googleClientId =
      env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri =
      env.VITE_GOOGLE_REDIRECT_URI || import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const authUri = env.VITE_GOOGLE_AUTH_URI || import.meta.env.VITE_GOOGLE_AUTH_URI;
    if (!authUri || !redirectUri || !googleClientId) {
      message.error(t("auth.googleConfigError"));
      return;
    }

    const targetUrl = `${authUri}?redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;
    window.location.href = targetUrl;
  };

  const {
    formState: { errors },
  } = method;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-2 bg-blue-600 text-center flex justify-center flex-col items-center">
          <div className="rounded-md w-56 h-36 flex items-center justify-center">
            <img src={logo} alt="logo" />
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {t("auth.username")}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 outline-none transition-all ${errors.username
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 dark:border-slate-600"
                    }`}
                  placeholder={t("auth.usernamePlaceholder")}
                  {...method.register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {t("auth.password")}
                </label>
                <Link
                  to="#"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 outline-none transition-all ${errors.password
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 dark:border-slate-600"
                    }`}
                  placeholder={t("auth.passwordPlaceholder")}
                  {...method.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-500 dark:text-slate-400 font-medium"
              >
                {t("auth.rememberMe")}
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? t("auth.loggingIn") : t("auth.loginSubmit")}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-400 font-medium">
                  {t("auth.orContinue")}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={handleLoginWithGoogle}
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-600 dark:text-slate-300 transition-colors"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                  alt="Google"
                />
                Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              {t("auth.createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
