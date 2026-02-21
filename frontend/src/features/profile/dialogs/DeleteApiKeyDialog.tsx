import { Modal } from "antd";

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
            title="Xóa khóa API"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
        >
            {maskedKey && (
                <p className="text-slate-600">
                    Bạn có chắc muốn xóa khóa{" "}
                    <span className="font-mono font-medium text-slate-800">
                        {maskedKey}
                    </span>{" "}
                    và toàn bộ mô hình liên quan? Thao tác không thể hoàn tác.
                </p>
            )}
        </Modal>
    );
}
