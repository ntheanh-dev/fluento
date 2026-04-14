import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, UserCircle } from "lucide-react";
import { message } from "antd";
import Cookies from "js-cookie";
import { z } from "zod";
import { useRegisterMutation } from "../mutation";
import type { RegisterInput } from "../../../entities/auth/schema";
import { useProfileData, PROFILE_EMBED_PRACTICESTATS } from "../../profile/query";
import logo from "../../../assets/image/logo3.png";
import { useProfileStore } from "../../../stores/profile";
import { PASSWORD_MIN } from "../../../shared/validation/constant";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending } = useRegisterMutation();
  const { refetch: refetchProfile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { setProfile } = useProfileStore();

  const registerSchema = useMemo(
    () =>
      z
        .object({
          fullName: z
            .string()
            .min(2, t("validation.fullNameMin"))
            .max(100, t("validation.fullNameMax")),
          username: z
            .string()
            .min(8, t("validation.usernameMin"))
            .max(20, t("validation.usernameMax")),
          password: z
            .string()
            .min(PASSWORD_MIN, t("validation.passwordMin", { min: PASSWORD_MIN }))
            .max(20, t("validation.passwordMax")),
        })
        .strict(),
    [t],
  );

  const method = useForm<RegisterInput>({
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = method.handleSubmit(async (data) => {
    try {
      const { accessToken } = await mutateAsync(data);
      Cookies.set("accessToken", accessToken, {
        expires: 7,
        secure: true,
        sameSite: "strict",
        path: "/",
      });

      const { data: profile } = await refetchProfile();

      if (!profile) {
        throw new Error(t("auth.noUserInfo"));
      }

      setProfile(profile);

      message.success(t("auth.registerSuccess"));
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        t("auth.registerFailed");
      message.error(errorMessage);
    }
  });

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
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {t("auth.fullName")}
              </label>
              <div className="relative">
                <UserCircle
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 outline-none transition-all ${errors.fullName
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 dark:border-slate-600"
                    }`}
                  placeholder={t("auth.registerFullNamePlaceholder")}
                  {...method.register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {t("auth.username")}
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 outline-none transition-all ${errors.username
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 dark:border-slate-600"
                    }`}
                  placeholder={t("auth.registerUsernamePlaceholder")}
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
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {t("auth.password")}
              </label>
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
                  placeholder={t("auth.createStrongPassword")}
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/40 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isPending ? t("auth.registering") : t("auth.registerSubmit")}{" "}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("auth.hasAccount")}{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                {t("auth.loginSubmit")}
              </Link>
            </p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t("auth.termsFooter")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
