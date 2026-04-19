import { useState, useRef } from "react";
import { User, LogOut, Camera, History, CreditCard } from "lucide-react";
import { Avatar, message } from "antd";
import {
  ACCEPT_IMAGE,
  AVATAR_MAX_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "../../../shared/validation/constant";
import { useTranslation } from "react-i18next";
import { useLogoutMutation } from "@/features/auth/mutation";
import Cookies from "js-cookie";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "../query";
import { useUpdateMe } from "../hook/useUpdateMe";
import { getLevelLabel } from "@/i18n/labels";
const Profile = () => {
  const { t } = useTranslation();

  const { data: profile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { mutateAsync: updateMeMutation } = useUpdateMe();
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutMutation();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      message.warning(t("profile.avatarInvalidType"));
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      message.warning(
        t("profile.avatarTooLarge", {
          maxMb: AVATAR_MAX_BYTES / 1024 / 1024,
        }),
      );
      return;
    }

    setUploadingAvatar(true);
    updateMeMutation({}, file)
      .then(() => message.success(t("profile.avatarUpdated")))
      .catch(() => message.error(t("profile.avatarUpdateFailed")))
      .finally(() => setUploadingAvatar(false));
  };

  const handleLogout = async () => {
    await logout(Cookies.get("accessToken") || "");
    navigate("/home");
  };

  const navItemClass = (active: boolean) =>
    active
      ? "w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/50 text-primary rounded-xl font-medium text-sm transition-colors"
      : "w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-colors";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pb-8 dark:text-slate-100">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <input
                ref={avatarInputRef}
                type="file"
                accept={ACCEPT_IMAGE}
                className="hidden"
                aria-hidden
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="relative w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold border-4 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {profile?.urlAvatar ? (
                  <>
                    <img
                      src={profile?.urlAvatar}
                      alt={profile?.fullName}
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <Avatar size={96} icon={<User size={48} />} />
                )}
                <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={28} className="text-white" />
                </span>
                {uploadingAvatar && (
                  <span className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </span>
                )}
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {profile?.fullName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getLevelLabel(profile?.embedded?.totalUserSentenceAnswers ?? 0, t)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-2 space-y-1">
              <NavLink
                to="/profile/details"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <User size={18} /> {t("profile.profileDetails")}
              </NavLink>
              <NavLink
                to="/profile/history"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <History size={18} /> {t("profile.history")}
              </NavLink>
              <NavLink
                to="/profile/subscription"
                className={({ isActive }) => navItemClass(isActive)}
              >
                <CreditCard size={18} /> {t("profile.subscription")}
              </NavLink>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
              >
                <LogOut size={18} /> {t("profile.logout")}
              </button>
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default Profile;
