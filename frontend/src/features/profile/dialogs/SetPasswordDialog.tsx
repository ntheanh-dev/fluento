import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Form, Input, Button } from "antd";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getSetPasswordSchema } from "../schema";
import { useUpdateMe } from "../hook/useUpdateMe";

interface SetPasswordDialogProps {
    open: boolean;
    onClose: () => void;
    /** true = first-time set (Google, etc.) → không cần current password. false = đổi mật khẩu → bắt buộc current. */
    noPassword: boolean;
}

export default function SetPasswordDialog({ open, onClose, noPassword }: SetPasswordDialogProps) {
    const { t } = useTranslation();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutateAsync: updateMeMutation } = useUpdateMe();

    const schema = useMemo(() => getSetPasswordSchema(noPassword, t), [noPassword, t]);

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (open) reset();
    }, [open, noPassword, reset]);

    const onSubmit = async (data: {
        currentPassword?: string;
        newPassword: string;
        confirmPassword: string;
    }) => {
        try {
            await updateMeMutation({
                newPassword: data.newPassword,
                ...(noPassword ? {} : { currentPassword: data.currentPassword }),
            });
            reset();
            onClose();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                t("profile.dialogs.setPassword.genericError");
            if (!noPassword) setError("currentPassword", { type: "manual", message: msg });
            else setError("newPassword", { type: "manual", message: msg });
        }
    };

    const handleCancel = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            centered
            title={noPassword ? t("profile.dialogs.setPassword.titleCreate") : t("profile.dialogs.setPassword.titleChange")}
            open={open}
            closable={false}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            transitionName=""
            maskTransitionName=""
        >
            {noPassword && (
                <p className="text-slate-500 text-sm mb-4">
                    {t("profile.dialogs.setPassword.socialHint")}
                </p>
            )}
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                {!noPassword && (
                    <Form.Item
                        label={t("profile.dialogs.setPassword.currentLabel")}
                        validateStatus={errors.currentPassword ? "error" : undefined}
                        help={errors.currentPassword?.message}
                    >
                        <Controller
                            name="currentPassword"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type={showCurrent ? "text" : "password"}
                                    size="large"
                                    placeholder={t("profile.dialogs.setPassword.currentPlaceholder")}
                                    suffix={
                                        <button
                                            type="button"
                                            className="text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowCurrent((v) => !v)}
                                        >
                                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />
                            )}
                        />
                    </Form.Item>
                )}
                <Form.Item
                    label={t("profile.dialogs.setPassword.newLabel")}
                    validateStatus={errors.newPassword ? "error" : undefined}
                    help={errors.newPassword?.message}
                >
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type={showNew ? "text" : "password"}
                                size="large"
                                placeholder={t("profile.dialogs.setPassword.newPlaceholder")}
                                suffix={
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowNew((v) => !v)}
                                    >
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item
                    label={t("profile.dialogs.setPassword.confirmLabel")}
                    validateStatus={errors.confirmPassword ? "error" : undefined}
                    help={errors.confirmPassword?.message}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type={showConfirm ? "text" : "password"}
                                size="large"
                                placeholder={t("profile.dialogs.setPassword.confirmPlaceholder")}
                                suffix={
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowConfirm((v) => !v)}
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                        )}
                    />
                </Form.Item>
                <Form.Item className="mb-0 mt-6">
                    <div className="flex justify-end gap-2">
                        <Button onClick={handleCancel}>{t("profile.dialogs.setPassword.cancel")}</Button>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                            {noPassword ? t("profile.dialogs.setPassword.submitCreate") : t("profile.dialogs.setPassword.submitChange")}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}
