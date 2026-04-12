import { Modal, Form, Input } from "antd";
import { Trans, useTranslation } from "react-i18next";

export interface AddApiKeyDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (apiKey: string) => Promise<void>;
    loading?: boolean;
}

export default function AddApiKeyDialog({
    open,
    onClose,
    onSubmit,
    loading = false,
}: AddApiKeyDialogProps) {
    const { t } = useTranslation();
    const [form] = Form.useForm<{ apiKey: string }>();

    const handleOk = async () => {
        try {
            const { apiKey } = await form.validateFields();
            await onSubmit(apiKey.trim());
            form.resetFields();
            onClose();
        } catch {
            // Validation or submit error – keep dialog open
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            centered
            title={t("profile.dialogs.addApiKey.title")}
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            okText={t("profile.dialogs.addApiKey.add")}
            cancelText={t("profile.dialogs.addApiKey.cancel")}
            confirmLoading={loading}
            destroyOnClose
        >
            <p className="text-slate-500 text-sm mb-2">
                {t("profile.dialogs.addApiKey.description")}
            </p>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 p-3 mb-4">
                <p className="text-slate-600 dark:text-slate-200 text-xs font-medium mb-1">
                    {t("profile.dialogs.addApiKey.whereTitle")}
                </p>
                <p className="text-slate-500 dark:text-slate-300 text-xs">
                    <Trans
                        i18nKey="profile.dialogs.addApiKey.whereBody"
                        components={{
                            1: (
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary dark:text-sky-400 hover:underline"
                                />
                            ),
                        }}
                    />
                </p>
            </div>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="apiKey"
                    label={t("profile.dialogs.addApiKey.apiKeyLabel")}
                    rules={[
                        {
                            required: true,
                            message: t("profile.dialogs.addApiKey.required"),
                        },
                        {
                            min: 10,
                            message: t("profile.dialogs.addApiKey.tooShort"),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t("profile.dialogs.addApiKey.placeholder")}
                        className="rounded-lg text-base"
                        autoComplete="off"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
