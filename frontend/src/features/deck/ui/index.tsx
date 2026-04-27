import { useMemo, useState } from "react";
import { Button, Input, Modal, Select, message } from "antd";
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    ListChecks,
} from "lucide-react";
import { useMyDecksQuery } from "@/features/deck/query";
import { getMyDeckDetail } from "@/features/deck/api";
import { useCreateDeckMutation, useDeleteDeckMutation, useUpdateDeckMutation } from "@/features/deck/mutation";
import type { VocabularyTargetLanguage } from "@/features/vocabulary/schema";
import { showApiError } from "@/shared/api/showApiError";
import {
    DECK_PRACTICE_ROUTE_MODE,
    DECK_HEADER_STYLES,
    DECK_ICONS,
    LANGUAGE_FLAG,
    type DeckPracticeMode,
    type DeckPracticePageState,
    type DeckItem,
    type VocabularyItem,
} from "@/features/deck/schema";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreateDeckForm } from "@/features/deck/ui/CreateDeckForm";
import { EditDeckForm } from "@/features/deck/ui/EditDeckForm";
import { PracticeConfirmModal } from "@/features/deck/ui/[id]/PracticeConfirmModal";

export default function DeckManagementPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [modal, contextHolder] = Modal.useModal();
    const [targetLanguage, setTargetLanguage] = useState<VocabularyTargetLanguage>("EN");
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDeckId, setEditingDeckId] = useState<number | null>(null);
    const [editingDeckName, setEditingDeckName] = useState("");
    const [editingDeckIcon, setEditingDeckIcon] = useState("book-open");
    const [isPracticeConfirmOpen, setIsPracticeConfirmOpen] = useState(false);
    const [practiceDeckName, setPracticeDeckName] = useState<string | undefined>(undefined);
    const [practiceTargetLanguage, setPracticeTargetLanguage] = useState<VocabularyTargetLanguage | undefined>(undefined);
    const [practiceVocabularies, setPracticeVocabularies] = useState<VocabularyItem[]>([]);
    const [openingPracticeDeckId, setOpeningPracticeDeckId] = useState<number | null>(null);

    const { data: decks = [], isFetching } = useMyDecksQuery(targetLanguage, true);
    const createDeckMutation = useCreateDeckMutation(targetLanguage);
    const updateDeckMutation = useUpdateDeckMutation(targetLanguage);
    const deleteDeckMutation = useDeleteDeckMutation(targetLanguage);

    const filteredDecks = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return decks;
        return decks.filter((deck) => deck.name.toLowerCase().includes(keyword));
    }, [decks, search]);

    const handleCreateDeck = async (payload: { name: string; icon: string }) => {
        try {
            await createDeckMutation.mutateAsync({
                name: payload.name.trim(),
                icon: payload.icon,
                targetLanguage,
            });
            message.success(t("common.create"));
            setIsCreateModalOpen(false);
        } catch (error) {
            showApiError(error, t("errors.default"));
        }
    };

    const handleDeleteDeck = async (deck: DeckItem) => {
        try {
            await deleteDeckMutation.mutateAsync(deck.id);
            message.success(t("deck.deleteConfirmTitle"));
        } catch (error) {
            showApiError(error, t("errors.default"));
        }
    };

    const confirmDeleteDeck = (deck: DeckItem) => {
        modal.confirm({
            centered: true,
            title: t("deck.deleteConfirmTitle"),
            content: t("deck.deleteConfirmBody"),
            okText: t("admin.delete"),
            cancelText: t("practice.result.retryCancel"),
            okButtonProps: { danger: true, loading: deleteDeckMutation.isPending && deleteDeckMutation.variables === deck.id },
            transitionName: "",
            maskTransitionName: "",
            className:
                "[&_.ant-modal-content]:dark:bg-slate-900 [&_.ant-modal-content]:dark:border [&_.ant-modal-content]:dark:border-slate-700 [&_.ant-modal-header]:dark:bg-slate-900 [&_.ant-modal-title]:dark:text-slate-100 [&_.ant-modal-body]:dark:text-slate-300",
            onOk: () => handleDeleteDeck(deck),
        });
    };

    const handleOpenEditDeck = (deck: DeckItem) => {
        setEditingDeckId(deck.id);
        setEditingDeckName(deck.name);
        setEditingDeckIcon(deck.icon || "book-open");
        setIsEditModalOpen(true);
    };

    const handleUpdateDeck = async (payload: { name: string; icon: string }) => {
        const trimmed = payload.name.trim();
        if (!editingDeckId) return;
        const hasChanges = trimmed !== editingDeckName.trim() || payload.icon !== editingDeckIcon;
        if (!hasChanges) {
            setIsEditModalOpen(false);
            setEditingDeckId(null);
            setEditingDeckName("");
            setEditingDeckIcon("book-open");
            return;
        }
        try {
            await updateDeckMutation.mutateAsync({
                deckId: editingDeckId,
                payload: { name: trimmed, icon: payload.icon },
            });
            message.success(t("deck.saveChanges"));
            setIsEditModalOpen(false);
            setEditingDeckId(null);
            setEditingDeckName("");
            setEditingDeckIcon("book-open");
        } catch (error) {
            showApiError(error, t("errors.default"));
        }
    };

    const handleOpenPracticeConfirm = async (deck: DeckItem) => {
        setOpeningPracticeDeckId(deck.id);
        try {
            const detail = await getMyDeckDetail(deck.id);
            const topTenVocabularies = (detail.vocabularies ?? []).slice(0, 10);
            if (topTenVocabularies.length === 0) {
                message.warning(t("deck.noWordForPractice"));
                return;
            }
            setPracticeDeckName(detail.name);
            setPracticeTargetLanguage(detail.targetLanguage);
            setPracticeVocabularies(topTenVocabularies);
            setIsPracticeConfirmOpen(true);
        } catch (error) {
            showApiError(error, t("deck.detailLoadFailed"));
        } finally {
            setOpeningPracticeDeckId(null);
        }
    };

    const handleSelectPracticeMode = (mode: DeckPracticeMode, vocabularies: VocabularyItem[]) => {
        const practiceState: DeckPracticePageState = {
            deckName: practiceDeckName,
            targetLanguage: practiceTargetLanguage,
            mode,
            vocabularies,
        };
        setIsPracticeConfirmOpen(false);
        navigate(`/decks/practice/${DECK_PRACTICE_ROUTE_MODE[mode]}`, { state: practiceState });
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            {contextHolder}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t("deck.managementTitle")}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t("deck.managementSubtitle")}</p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    {t("common.create")}
                </Button>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/90">
                <Input
                    prefix={<Search className="h-4 w-4 text-slate-400" />}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("deck.searchDeckPlaceholder")}
                    className="min-w-[260px] flex-1"
                />
                <Select<VocabularyTargetLanguage>
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                    className="min-w-[150px]"
                    options={[
                        { value: "EN", label: `🇺🇸 ${t("history.targetLanguage.EN")}` },
                        { value: "ZH", label: `🇨🇳 ${t("history.targetLanguage.ZH")}` },
                        { value: "KO", label: `🇰🇷 ${t("history.targetLanguage.KO")}` },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {filteredDecks.map((deck) => (
                    <DeckCard
                        key={deck.id}
                        deck={deck}
                        onDelete={() => confirmDeleteDeck(deck)}
                        onEdit={() => handleOpenEditDeck(deck)}
                        onOpen={() => navigate(`/decks/${deck.id}`)}
                        onReview={() => void handleOpenPracticeConfirm(deck)}
                        isReviewing={openingPracticeDeckId === deck.id}
                    />
                ))}
            </div>

            {!isFetching && filteredDecks.length === 0 && (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
                    {t("deck.emptyDecks")}
                </div>
            )}

            <CreateDeckForm
                open={isCreateModalOpen}
                isSubmitting={createDeckMutation.isPending}
                onClose={() => {
                    setIsCreateModalOpen(false);
                }}
                onSubmit={async (payload) => {
                    await handleCreateDeck(payload);
                }}
            />
            <EditDeckForm
                open={isEditModalOpen}
                initialName={editingDeckName}
                initialIcon={editingDeckIcon}
                isSubmitting={updateDeckMutation.isPending}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingDeckId(null);
                    setEditingDeckName("");
                    setEditingDeckIcon("book-open");
                }}
                onSubmit={async (payload) => {
                    await handleUpdateDeck(payload);
                }}
            />
            <PracticeConfirmModal
                open={isPracticeConfirmOpen}
                totalWords={practiceVocabularies.length}
                vocabularies={practiceVocabularies}
                useFilteredFallback
                onCancel={() => setIsPracticeConfirmOpen(false)}
                onSelectMode={handleSelectPracticeMode}
            />
        </div>
    );
}

function DeckCard({
    deck,
    onDelete,
    onEdit,
    onOpen,
    onReview,
    isReviewing,
}: {
    deck: DeckItem;
    onDelete: () => void;
    onEdit: () => void;
    onOpen: () => void;
    onReview: () => void;
    isReviewing: boolean;
}) {
    const { t } = useTranslation();
    const Icon = DECK_ICONS[deck.icon] ?? DECK_ICONS["book-open"];
    const vocabularyCount = deck.vocabularyCount ?? 0;
    const headerStyle = DECK_HEADER_STYLES[deck.id % DECK_HEADER_STYLES.length];

    return (
        <article
            className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/90"
            onClick={onOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen();
                }
            }}
        >
            <div className="flex h-28 items-center justify-center" style={{ backgroundColor: headerStyle.bg }}>
                <Icon className={`h-9 w-9 ${headerStyle.iconClass}`} />
            </div>

            <div className="p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="line-clamp-1 text-left text-lg font-semibold leading-tight text-slate-800 dark:text-slate-100">
                        {deck.name}
                    </h3>
                </div>

                <div className="mt-3 grid grid-cols-2 border-t border-slate-100 pt-2 dark:border-slate-800 flex flex-row items-center justify-between">
                    <div>
                        <p className="inline-flex items-center gap-1 text-base font-bold text-slate-800 dark:text-slate-100">
                            <ListChecks className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                            <span>{t("deck.cards", { count: vocabularyCount })}</span>
                        </p>
                    </div>
                    <div className="text-right flex flex-row justify-end items-center gap-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("deck.deckLanguage")}</p>
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100">
                            {LANGUAGE_FLAG[deck.targetLanguage]}
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <Button
                        type="primary"
                        className="h-9 flex-1 rounded-lg text-[13px] font-semibold"
                        loading={isReviewing}
                        onClick={(event) => {
                            event.stopPropagation();
                            onReview();
                        }}
                    >
                        {t("deck.reviewNow")}
                    </Button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit();
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        aria-label={t("deck.editDeckAria")}
                    >
                        <Pencil className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete();
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:border-red-900/40 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                        aria-label={t("deck.deleteDeckAria")}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </article>
    );
}