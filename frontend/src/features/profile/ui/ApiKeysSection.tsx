import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button, Tag, message } from "antd";
import { useProfileStore } from "../../../stores/profile";
import { useProfileData, PROFILE_EMBED_API_KEY } from "../query";
import { maskApiKey } from "../../../entities/apiKey/schema";
import type { ApiKey } from "../../../entities/apiKey/schema";
import { useCreateApiKey } from "../hook/useCreateApiKey";
import { useDeleteApiKey } from "../hook/useDeleteApiKeys";
import { useUpdateMe } from "../hook/useUpdateMe";
import AddApiKeyDialog from "../dialogs/AddApiKeyDialog";
import DeleteApiKeyDialog from "../dialogs/DeleteApiKeyDialog";
import SetDefaultApiKeyDialog from "../dialogs/SetDefaultApiKeyDialog";

export default function ApiKeysSection() {
    const { profile, setProfile } = useProfileStore();
    const { refetch: fetchUserProfile } = useProfileData({
        queryParams: PROFILE_EMBED_API_KEY,
    });

    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
    const [addKeyOpen, setAddKeyOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        apiKey: string;
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

    useEffect(() => {
        if (!profile?.embedded?.apiKey) {
            fetchUserProfile().then((result) => {
                if (result?.data) setProfile(result.data);
            });
        }
    }, [profile?.embedded?.apiKey, fetchUserProfile, setProfile]);

    const apiKeyGroups = useMemo(() => {
        const list = profile?.embedded?.apiKey ?? [];
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
    }, [profile?.embedded?.apiKey]);

    const toggleGroup = (groupKey: number) => {
        setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    const handleDeleteConfirm = (apiKey: string): Promise<void> => {
        return deleteApiKeyMutation(apiKey)
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
        } catch {
            message.error("Thêm khóa API thất bại.");
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Khóa API AI</h3>
                    <p className="text-sm text-slate-500">
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

            <div className="space-y-4">
                {apiKeyGroups.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-slate-500 text-sm">
                        Chưa có khóa API. Bấm &quot;Thêm khóa mới&quot; để thêm.
                    </div>
                ) : (
                    apiKeyGroups.map(({ apiKeyValue, keys }) => {
                        const groupKey = keys[0].id;
                        const isExpanded = expandedGroups[groupKey] !== false;
                        const hasActive = keys.some(
                            (k) => k.id === profile?.activeApiKeyId
                        );
                        return (
                            <div
                                key={groupKey}
                                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                            >
                                <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="inline-flex items-center rounded-lg bg-slate-200/80 px-2.5 py-1 font-mono text-xs text-slate-600">
                                            {maskApiKey(apiKeyValue)}
                                        </span>
                                        <span className="text-slate-500 text-sm">
                                            {keys.length} mô hình
                                        </span>
                                        {hasActive ? (
                                            <Tag
                                                color="success"
                                                className="font-medium border-0 px-2 py-0.5 rounded-full text-xs"
                                            >
                                                Đang dùng
                                            </Tag>
                                        ) : (
                                            <Tag
                                                className="font-medium text-slate-500 bg-slate-100 border-0 px-2 py-0.5 rounded-full text-xs"
                                            >
                                                Không dùng
                                            </Tag>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto">
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(groupKey)}
                                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200/80 hover:text-slate-700 transition-colors"
                                            title={
                                                isExpanded ? "Thu gọn" : "Mở rộng"
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
                                                    apiKey: apiKeyValue,
                                                    maskedKey: maskApiKey(
                                                        apiKeyValue
                                                    ),
                                                })
                                            }
                                            className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            title="Xóa toàn bộ khóa này"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="divide-y divide-slate-50">
                                        {keys.map((key) => {
                                            const isActive =
                                                key.requestCountToday <
                                                key.limitPerDay;
                                            const isDefault =
                                                profile?.activeApiKeyId ===
                                                key.id;
                                            return (
                                                <div
                                                    key={key.id}
                                                    className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <span className="font-medium text-slate-800 min-w-[140px]">
                                                        {key.model}
                                                    </span>
                                                    <span className="text-slate-600 text-sm tabular-nums">
                                                        {key.requestCountToday}{" "}
                                                        / {key.limitPerDay} RPD
                                                    </span>
                                                    {!isActive && (
                                                        <Tag
                                                            color="error"
                                                            className="font-medium border-0 px-2 py-0.5 rounded-full text-xs"
                                                        >
                                                            Vượt quá giới hạn
                                                        </Tag>
                                                    )}
                                                    <div className="ml-auto">
                                                        {isDefault ? (
                                                            <span className="text-primary font-medium text-sm">
                                                                Đang dùng
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSetDefaultTarget(
                                                                        {
                                                                            id: key.id,
                                                                            label: `${key.model} (${maskApiKey(apiKeyValue)})`,
                                                                        }
                                                                    )
                                                                }
                                                                disabled={!isActive}
                                                                className="text-primary font-medium hover:underline text-sm"
                                                            >
                                                                Đặt làm mặc định
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                    deleteTarget ? handleDeleteConfirm(deleteTarget.apiKey) : undefined
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
