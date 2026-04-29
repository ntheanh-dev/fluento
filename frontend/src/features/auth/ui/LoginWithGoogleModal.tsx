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
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      destroyOnClose
      transitionName=""
      maskTransitionName=""
      width={440}
      className="[&_.ant-modal]:!p-0 [&_.ant-modal-container]:!bg-transparent [&_.ant-modal-container]:!p-0 [&_.ant-modal-content]:!bg-transparent [&_.ant-modal-content]:!p-0 [&_.ant-modal-content]:!shadow-none [&_.ant-modal-body]:!p-0"
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="rounded-xl bg-white p-6 dark:bg-slate-900">
        <div className="flex flex-col items-center">
          <img src={logo} alt="logo" className="mb-3 h-14 w-14" />
          <h2 className="mb-1 text-center text-lg font-bold text-slate-900 dark:text-slate-100">{t("layout.login")}</h2>
          <p className="mb-5 text-center text-sm text-slate-500 dark:text-slate-400">{t("auth.orContinue")}</p>

          <button
            type="button"
            onClick={handleLoginWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="h-5 w-5"
              alt="Google"
            />
            <span>{t("auth.continueWithGoogle", { defaultValue: "Tiếp tục với Google" })}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
