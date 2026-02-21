import { Modal } from "antd";

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
            title="Đặt khóa làm mặc định"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Đặt mặc định"
            cancelText="Hủy"
        >
            {label && (
                <p className="text-slate-600">
                    Đặt <span className="font-medium text-slate-800">{label}</span> làm khóa API mặc định cho dịch và phản hồi AI?
                </p>
            )}
        </Modal>
    );
}
