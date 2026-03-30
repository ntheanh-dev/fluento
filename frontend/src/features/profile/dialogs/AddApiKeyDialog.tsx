import { Modal, Form, Input } from "antd";

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
            title="Thêm khóa API"
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            okText="Thêm"
            cancelText="Hủy"
            confirmLoading={loading}
            destroyOnClose
        >
            <p className="text-slate-500 text-sm mb-2">
                Nhập khóa API Gemini. Khóa sẽ được mã hóa và dùng cho các mô hình AI của bạn.
            </p>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 p-3 mb-4">
                <p className="text-slate-600 dark:text-slate-200 text-xs font-medium mb-1">
                    Lấy API key ở đâu?
                </p>
                <p className="text-slate-500 dark:text-slate-300 text-xs">
                    Truy cập{" "}
                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary dark:text-sky-400 hover:underline"
                    >
                        Google AI Studio
                    </a>
                    {" "}(aistudio.google.com/apikey), đăng nhập Google và tạo API key miễn phí để sử dụng với Gemini.
                </p>
            </div>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="apiKey"
                    label="API Key"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập API key",
                        },
                        {
                            min: 10,
                            message: "API key quá ngắn",
                        },
                    ]}
                >
                    <Input.Password
                        placeholder="Nhập khóa API"
                        className="rounded-lg text-base"
                        autoComplete="off"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
