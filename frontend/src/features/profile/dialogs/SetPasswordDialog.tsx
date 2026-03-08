import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Form, Input, Button } from "antd";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { getSetPasswordSchema } from "../schema";
import type { z } from "zod";
import { useUpdateMe } from "../hook/useUpdateMe";

interface SetPasswordDialogProps {
    open: boolean;
    onClose: () => void;
    /** true = first-time set (Google, etc.) → không cần current password. false = đổi mật khẩu → bắt buộc current. */
    noPassword: boolean;
}

export default function SetPasswordDialog({ open, onClose, noPassword }: SetPasswordDialogProps) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutateAsync: updateMeMutation } = useUpdateMe();

    const schema = getSetPasswordSchema(noPassword);
    type SetPasswordForm = z.infer<typeof schema>;

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SetPasswordForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        } as SetPasswordForm,
    });

    useEffect(() => {
        if (open) reset();
    }, [open, noPassword, reset]);

    const onSubmit = async (data: SetPasswordForm) => {
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
                "Thao tác thất bại. Vui lòng thử lại.";
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
            title={noPassword ? "Tạo mật khẩu" : "Đổi mật khẩu"}
            open={open}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
        >
            {noPassword && (
                <p className="text-slate-500 text-sm mb-4">
                    Bạn đăng nhập bằng tài khoản mạng xã hội. Tạo mật khẩu để có thể đăng nhập bằng email/username.
                </p>
            )}
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                {!noPassword && (
                    <Form.Item
                        label="Mật khẩu hiện tại"
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
                                    placeholder="Nhập mật khẩu hiện tại"
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
                    label="Mật khẩu mới"
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
                                placeholder="Nhập mật khẩu mới"
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
                    label="Xác nhận mật khẩu"
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
                                placeholder="Nhập lại mật khẩu"
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
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                            {noPassword ? "Tạo mật khẩu" : "Đổi mật khẩu"}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}
