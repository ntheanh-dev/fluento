import { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  History,
  CreditCard,
  LogOut,
  Flame,
  FileText,
  Star,
  Save,
  Camera,
  Clock,
} from "lucide-react";
import { Button, Input, Select, message } from "antd";
import { useProfileStore } from "../../../stores/profile";
import SetPasswordDialog from "../dialogs/SetPasswordDialog";
import { useUpdateMe } from "../hook/useUpdateMe";
import {
  ACCEPT_IMAGE,
  AVATAR_MAX_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "../../../shared/validation/constant";
import ApiKeysSection from "./ApiKeysSection";
import { formatTotalHours } from "@/utils/utils";
import { useLogoutMutation } from "@/features/auth/mutation";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { PROFILE_EMBED_API_KEY, useProfileData } from "../query";
const Profile = () => {
  const { data: profile } = useProfileData({
    queryParams: PROFILE_EMBED_API_KEY,
  });
  const { mutateAsync: updateMeMutation, isPending: savingFullName } =
    useUpdateMe();
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutMutation();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const totalTranslated = useMemo(
    () => profile?.embedded?.totalUserSentenceAnswers ?? 0,
    [profile?.embedded?.totalUserSentenceAnswers],
  );

  useEffect(() => {
    setFullName(profile?.fullName ?? "");
  }, [profile?.fullName]);

  const handleSaveFullName = () => {
    updateMeMutation({ fullName: fullName.trim() }).catch(() =>
      message.error("Lưu thất bại."),
    );
  };

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
      message.warning("Vui lòng chọn file ảnh (JPEG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      message.warning(
        `Ảnh không được vượt quá ${AVATAR_MAX_BYTES / 1024 / 1024}MB.`,
      );
      return;
    }

    setUploadingAvatar(true);
    updateMeMutation({}, file)
      .then(() => message.success("Đã cập nhật ảnh đại diện."))
      .catch(() => message.error("Cập nhật ảnh thất bại."))
      .finally(() => setUploadingAvatar(false));
  };

  const handleLogout = async () => {
    await logout(Cookies.get("accessToken") || "");
    navigate("/home");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Main Layout Container */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Profile Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
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
                <img
                  src={profile?.urlAvatar}
                  alt={profile?.fullName}
                  className="w-full h-full object-cover"
                />
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
            <h2 className="text-xl font-bold text-slate-800">
              {profile?.fullName}
            </h2>
            <p className="text-xs text-slate-500">Trung cấp</p>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary rounded-xl font-medium text-sm transition-colors">
                <User size={18} /> Chi tiết hồ sơ
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                <History size={18} /> Lịch sử dịch
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                <CreditCard size={18} /> Gói đăng ký
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <Flame size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Chuỗi hiện tại
                </p>
                <p className="text-xl font-bold text-slate-800">{profile?.currentStreak} ngày</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Đã dịch
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {totalTranslated.toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                <Star size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Điểm trung bình
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {(profile?.embedded?.avgUserSentenceAnswerScore ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tổng thời gian luyện tập
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {formatTotalHours(profile?.embedded?.totalLearningTime ?? 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Thông tin cá nhân
              </h3>
              <p className="text-sm text-slate-500">
                Quản lý thông tin cơ bản và cài đặt ngôn ngữ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên tài khoản
                </label>
                <Input
                  size="large"
                  defaultValue={profile?.username}
                  disabled
                  value={profile?.username}
                  className="font-medium rounded-lg"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và tên
                  </label>
                  <Input
                    size="large"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="font-medium rounded-lg"
                  />
                </div>
                <Button
                  type="primary"
                  loading={savingFullName}
                  onClick={handleSaveFullName}
                  disabled={
                    savingFullName || fullName.trim() === profile?.fullName
                  }
                  icon={<Save size={16} />}
                  iconPosition="end"
                  className="font-medium rounded-lg h-10 w-full sm:w-auto"
                >
                  Lưu
                </Button>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngôn ngữ mẹ đẻ
                </label>
                <Select
                  size="large"
                  defaultValue="vietnamese"
                  className="w-full font-medium"
                  options={[{ value: "vietnamese", label: "Tiếng Việt" }]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngôn ngữ giao diện
                </label>
                <Select
                  size="large"
                  defaultValue="vietnamese"
                  className="w-full font-medium"
                  options={[
                    { value: "vietnamese", label: "Tiếng Việt" },
                    { value: "english", label: "Tiếng Anh", disabled: true },
                  ]}
                />
              </div>
            </div>
          </div>

          <ApiKeysSection />

          {/* Security */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                Bảo mật tài khoản
              </h3>
              <p className="text-sm text-slate-500">
                Cập nhật mật khẩu và bảo vệ tài khoản của bạn.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Mật khẩu</p>
                  <p className="text-xs text-slate-500">
                    {profile?.noPassword
                      ? "Bạn chưa có mật khẩu. Tạo mật khẩu để đăng nhập bằng email/username."
                      : "Đổi mật khẩu để bảo vệ tài khoản."}
                  </p>
                </div>
                <Button
                  type={profile?.noPassword ? "primary" : "default"}
                  className="font-medium rounded-lg w-full sm:w-auto"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  {profile?.noPassword ? "Tạo mật khẩu" : "Đổi mật khẩu"}
                </Button>
              </div>
              <div className="h-px bg-slate-100"></div>
            </div>
          </div>

          <SetPasswordDialog
            open={passwordDialogOpen}
            onClose={() => setPasswordDialogOpen(false)}
            noPassword={profile?.noPassword ?? true}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
