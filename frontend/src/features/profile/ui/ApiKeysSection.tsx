import { useState, useMemo } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Button, message } from "antd";
import { useProfileStore } from "../../../stores/profile";
import { useApiKeys } from "../query";
import { maskApiKey, getProviderFromModel } from "../../../entities/apiKey/schema";
import type { ApiKey } from "../../../entities/apiKey/schema";
import { useCreateApiKey } from "../hook/useCreateApiKey";
import { useDeleteApiKey } from "../hook/useDeleteApiKeys";
import { useUpdateMe } from "../hook/useUpdateMe";
import AddApiKeyDialog from "../dialogs/AddApiKeyDialog";
import DeleteApiKeyDialog from "../dialogs/DeleteApiKeyDialog";
import SetDefaultApiKeyDialog from "../dialogs/SetDefaultApiKeyDialog";
import { formatCreatedAt } from "../../../shared/utilities";
import { showApiError } from "../../../shared/api/showApiError";

export default function ApiKeysSection() {
    const { profile } = useProfileStore();
    const { data: apiKeys = [] } = useApiKeys();

    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
    const [addKeyOpen, setAddKeyOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: number;
        maskedKey: string;
    } | null>(null);
    const [setDefaultTarget, setSetDefaultTarget] = useState<{
        id: number;
        label: string;
    } | null>(null);

    const { mutateAsync: createApiKeyMutation, isPending: addKeyLoading } =
        useCreateApiKey();
    const { mutateAsync: deleteApiKeyMutation } = useDeleteApiKey();
    const { mutateAsync: updateMeMutation } = useUpdateMe();

    const apiKeyGroups = useMemo(() => {
        const list = apiKeys;
        const map = new Map<string, ApiKey[]>();
        for (const item of list) {
            const k = item.apiKey;
            if (!map.has(k)) map.set(k, []);
            map.get(k)!.push(item);
        }
        return Array.from(map.entries()).map(([apiKeyValue, keys]) => ({
            apiKeyValue,
            keys,
        }));
    }, [apiKeys, profile?.activeApiKeyId]);

    const toggleGroup = (groupKey: number) => {
        setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    const handleDeleteConfirm = (id: number): Promise<void> => {
        return deleteApiKeyMutation(id)
            .then(() => {
                message.success("Đã xóa khóa API.");
            })
            .catch(() => {
                message.error("Xóa khóa API thất bại.");
                throw new Error("Delete failed");
            });
    };

    const handleAddKeySubmit = async (apiKey: string) => {
        try {
            await createApiKeyMutation(apiKey);
            message.success("Đã thêm khóa API.");
        } catch (err) {
            showApiError(err, "Thêm khóa API thất bại.");
            throw new Error("Add failed");
        }
    };

    const handleSetDefaultConfirm = (): Promise<void> => {
        if (!setDefaultTarget || !profile) return Promise.resolve();
        const { id } = setDefaultTarget;
        const fullName = profile.fullName?.trim() || profile.username || "";
        return updateMeMutation({ fullName, activeApiKeyId: id })
            .then(() => {
                message.success("Đã đặt khóa làm mặc định.");
            })
            .catch(() => {
                message.error("Đặt mặc định thất bại.");
                throw new Error("Set default failed");
            });
    };

    return (
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Khóa API AI</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Cấu hình khóa Gemini để nhận phản hồi cá nhân hóa và bản dịch nâng cao.
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    className="font-bold bg-primary shadow-sm rounded-lg h-9 w-full sm:w-auto"
                    onClick={() => setAddKeyOpen(true)}
                >
                    Thêm khóa mới
                </Button>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                {apiKeyGroups.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900/90">
                        Chưa có khóa API. Bấm &quot;Thêm khóa mới&quot; để thêm.
                    </div>
                ) : (
                    apiKeyGroups.map(({ apiKeyValue, keys }) => {
                        const groupKey = keys[0].id;
                        const isExpanded = expandedGroups[groupKey] !== false;
                        const createdAt = keys[0].createdAt;
                        const isGroupActive = keys.some(
                            (k) => k.id === profile?.activeApiKeyId
                        );
                        const providerName =
                            getProviderFromModel(keys[0].model);
                        return (
                            <div
                                key={groupKey}
                                className="border-b border-slate-100 dark:border-slate-800 last:border-b-0 bg-white dark:bg-slate-900/90"
                            >
                                {/* Primary API key row */}
                                <div className="flex flex-wrap items-center gap-4 px-4 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(groupKey)}
                                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                    >
                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 shrink-0">
                                            <Zap size={18} strokeWidth={2} />
                                        </span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                                            {providerName}
                                        </span>
                                        <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
                                            {maskApiKey(apiKeyValue)}
                                        </span>
                                        <span className="text-slate-400 text-sm hidden sm:inline">
                                            {formatCreatedAt(createdAt)}
                                        </span>
                                    </button>
                                    {isGroupActive && (
                                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/80">
                                            Active
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(groupKey)}
                                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                            title={
                                                isExpanded
                                                    ? "Thu gọn"
                                                    : "Mở rộng"
                                            }
                                        >
                                            {isExpanded ? (
                                                <ChevronUp size={18} />
                                            ) : (
                                                <ChevronDown size={18} />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeleteTarget({
                                                    id: keys[0].id,
                                                    maskedKey: maskApiKey(
                                                        apiKeyValue
                                                    ),
                                                })
                                            }
                                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors"
                                            title="Xóa khóa API"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Supported models */}
                                {isExpanded && (
                                    <div className="bg-slate-50/60 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                                        <div className="px-4 pt-3 pb-1">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Models
                                            </p>
                                        </div>
                                        <div className="px-4 pb-3">
                                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden">
                                                {keys.map((key) => {
                                                    const hasCredit =
                                                        key.credit > 0;
                                                    const isDefault =
                                                        profile?.activeApiKeyId ===
                                                        key.id;
                                                    return (
                                                        <div
                                                            key={key.id}
                                                            className="flex flex-wrap items-center gap-4 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                                                        >
                                                            <span className="font-medium text-slate-800 dark:text-slate-100 min-w-[140px] text-sm">
                                                                {key.model}
                                                            </span>

                                                            {hasCredit ? (
                                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/80">
                                                                    {key.credit} credit
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 border border-red-200/80">
                                                                    Hết credit
                                                                </span>
                                                            )}
                                                            <div className="ml-auto">
                                                                {isDefault ? (
                                                                    <span className="text-primary font-medium text-sm text-blue-500">
                                                                        Đang dùng
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setSetDefaultTarget({
                                                                                id: key.id,
                                                                                label: `${key.model} (${maskApiKey(apiKeyValue)})`,
                                                                            })
                                                                        }
                                                                        disabled={!hasCredit}
                                                                        className="text-primary font-medium hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                                                    >
                                                                        Đặt làm mặc định
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <AddApiKeyDialog
                open={addKeyOpen}
                onClose={() => setAddKeyOpen(false)}
                onSubmit={handleAddKeySubmit}
                loading={addKeyLoading}
            />

            <DeleteApiKeyDialog
                open={!!deleteTarget}
                maskedKey={deleteTarget?.maskedKey ?? null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() =>
                    deleteTarget ? handleDeleteConfirm(deleteTarget.id) : undefined
                }
            />

            <SetDefaultApiKeyDialog
                open={!!setDefaultTarget}
                label={setDefaultTarget?.label ?? null}
                onClose={() => setSetDefaultTarget(null)}
                onConfirm={handleSetDefaultConfirm}
            />
        </div>
    );
}
