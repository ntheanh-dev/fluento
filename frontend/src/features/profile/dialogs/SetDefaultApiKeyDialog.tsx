import { Modal } from "antd";
import { Trans, useTranslation } from "react-i18next";

export interface SetDefaultApiKeyDialogProps {
    open: boolean;
    label: string | null;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export default function SetDefaultApiKeyDialog({
    open,
    label,
    onClose,
    onConfirm,
}: SetDefaultApiKeyDialogProps) {
    const { t } = useTranslation();

    const handleOk = async () => {
        try {
            const result = onConfirm();
            if (result instanceof Promise) {
                await result;
            }
            onClose();
        } catch {
            // onConfirm failed – keep dialog open
        }
    };

    return (
        <Modal
            centered
            title={t("profile.dialogs.setDefault.title")}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText={t("profile.dialogs.setDefault.ok")}
            cancelText={t("profile.dialogs.setDefault.cancel")}
        >
            {label && (
                <p className="text-slate-600">
                    <Trans
                        i18nKey="profile.dialogs.setDefault.body"
                        values={{ label }}
                        components={{ 1: <span className="font-medium text-slate-800" /> }}
                    />
                </p>
            )}
        </Modal>
    );
}
