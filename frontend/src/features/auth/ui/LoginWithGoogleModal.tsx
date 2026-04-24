import { Modal, message } from "antd";
import { useTranslation } from "react-i18next";
import { getRuntimeEnv } from "@/shared/config/runtime-env";
import logo from "@/assets/image/logo3.png";

type LoginWithGoogleModalProps = {
  open: boolean;
  onCancel: () => void;
};

export default function LoginWithGoogleModal({ open, onCancel }: LoginWithGoogleModalProps) {
  const { t } = useTranslation();

  const handleLoginWithGoogle = () => {
    const env = getRuntimeEnv();
    const googleClientId = env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = env.VITE_GOOGLE_REDIRECT_URI || import.meta.env.VITE_GOOGLE_REDIRECT_URI;
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

  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered>
      <div className="flex flex-col items-center justify-center">
        <img src={logo} alt="logo" className="w-32 h-32 mb-4" />
        <p className="text-sm text-slate-500 mb-4">{t("auth.orContinue")}</p>
        <button
          type="button"
          onClick={handleLoginWithGoogle}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-slate-600 transition-colors"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Google
        </button>
      </div>
    </Modal>
  );
}
