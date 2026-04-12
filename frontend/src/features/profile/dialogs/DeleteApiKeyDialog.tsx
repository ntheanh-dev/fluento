import { Modal } from "antd";
import { Trans, useTranslation } from "react-i18next";

export interface DeleteApiKeyDialogProps {
    open: boolean;
    maskedKey: string | null;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export default function DeleteApiKeyDialog({
    open,
    maskedKey,
    onClose,
    onConfirm,
}: DeleteApiKeyDialogProps) {
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
            title={t("profile.dialogs.deleteKey.title")}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText={t("profile.dialogs.deleteKey.ok")}
            cancelText={t("profile.dialogs.deleteKey.cancel")}
            okButtonProps={{ danger: true }}
        >
            {maskedKey && (
                <p className="text-slate-600">
                    <Trans
                        i18nKey="profile.dialogs.deleteKey.body"
                        values={{ masked: maskedKey }}
                        components={{ 1: <span className="font-mono font-medium text-slate-800" /> }}
                    />
                </p>
            )}
        </Modal>
    );
}
