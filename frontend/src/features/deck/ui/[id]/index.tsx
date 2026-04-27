import { Button, Input, Modal, Pagination, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMyDeckDetailQuery } from "@/features/deck/query";
import {
  DECK_PRACTICE_ROUTE_MODE,
  type DeckPracticeMode,
  type DeckPracticePageState,
  type VocabularyItem,
} from "@/features/deck/schema";
import {
  useDeleteVocabularyMutation,
  useUpdateVocabularyMutation,
} from "@/features/vocabulary/mutation";
import { showApiError } from "@/shared/api/showApiError";
import { EditVocabularyFormModal } from "@/features/vocabulary/ui/EditVocabularyFormModal";
import { PracticeConfirmModal } from "./PracticeConfirmModal";
import { AppSpinner } from "@/shared/components/AppSpinner";

const PAGE_SIZE = 10;

export default function DeckDetailPage() {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const { id } = useParams();
  const navigate = useNavigate();
  const deckId = Number(id ?? 0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [isPracticeConfirmOpen, setIsPracticeConfirmOpen] = useState(false);
  const [practiceVocabularies, setPracticeVocabularies] = useState<VocabularyItem[]>([]);
  const [editingVocabulary, setEditingVocabulary] = useState<VocabularyItem | null>(null);

  const { data, isPending, isError } = useMyDeckDetailQuery(deckId, Number.isFinite(deckId) && deckId > 0);
  const updateVocabularyMutation = useUpdateVocabularyMutation();
  const deleteVocabularyMutation = useDeleteVocabularyMutation();

  const filteredWords = useMemo(() => {
    const items = data?.vocabularies ?? [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) =>
      [item.text, item.meaning, item.partOfSpeech].some((value) => (value ?? "").toLowerCase().includes(keyword)),
    );
  }, [data?.vocabularies, search]);

  const pagedWords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, page]);

  const openEditModal = (record: VocabularyItem) => {
    setEditingVocabulary(record);
  };

  const handleDeleteVocabulary = (record: VocabularyItem) => {
    modal.confirm({
      centered: true,
      title: t("deck.deleteWordTitle"),
      content: t("deck.deleteWordBody", { word: record.text }),
      okText: t("admin.delete"),
      cancelText: t("practice.result.retryCancel"),
      okButtonProps: { danger: true },
      transitionName: "",
      maskTransitionName: "",
      className:
        "[&_.ant-modal-content]:dark:bg-slate-900 [&_.ant-modal-content]:dark:border [&_.ant-modal-content]:dark:border-slate-700 [&_.ant-modal-header]:dark:bg-slate-900 [&_.ant-modal-title]:dark:text-slate-100 [&_.ant-modal-body]:dark:text-slate-300",
      onOk: async () => {
        try {
          await deleteVocabularyMutation.mutateAsync({
            deckId,
            vocabularyId: record.id,
          });
          message.success(t("deck.wordDeleted"));
        } catch (error) {
          showApiError(error, t("deck.deleteWordFailed"));
        }
      },
    });
  };

  const openPracticeConfirm = () => {
    const selectedIds = new Set(
      selectedRowKeys
        .map((key) => Number(key))
        .filter((value) => Number.isFinite(value)),
    );

    const selectedWords =
      selectedIds.size > 0
        ? (data?.vocabularies ?? []).filter((item) => selectedIds.has(item.id))
        : pagedWords;

    if (selectedWords.length === 0) {
      message.warning(t("deck.noWordForReview"));
      return;
    }

    setPracticeVocabularies(selectedWords);
    setIsPracticeConfirmOpen(true);
  };

  const handleSelectPracticeMode = (mode: DeckPracticeMode, vocabularies: VocabularyItem[]) => {
    const practiceState: DeckPracticePageState = {
      deckName: data?.name,
      targetLanguage: data?.targetLanguage,
      mode,
      vocabularies,
    };
    setIsPracticeConfirmOpen(false);
    navigate(`/decks/practice/${DECK_PRACTICE_ROUTE_MODE[mode]}`, { state: practiceState });
  };

  const columns: ColumnsType<VocabularyItem> = [
    {
      title: t("deck.vocabularyModal.word"),
      dataIndex: "text",
      key: "text",
      render: (value: string) => <span className="font-semibold text-slate-800 dark:text-slate-100">{value}</span>,
    },
    {
      title: t("deck.vocabularyModal.meaning"),
      dataIndex: "meaning",
      key: "meaning",
      render: (value?: string) => <span className="italic text-slate-600 dark:text-slate-300">{value || "-"}</span>,
    },
    {
      title: t("deck.vocabularyModal.partOfSpeech"),
      dataIndex: "partOfSpeech",
      key: "partOfSpeech",
      render: (value?: string) => <Tag color="blue">{value || t("common.all")}</Tag>,
    },
    {
      title: t("deck.vocabularyModal.pronunciation"),
      dataIndex: "pronunciation",
      key: "pronunciation",
      render: (value?: string) => <span className="text-slate-500">{value || "-"}</span>,
    },
    {
      title: t("admin.columns.actions"),
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-2 text-slate-400">
          <button
            type="button"
            className="rounded p-1 hover:bg-slate-100 hover:text-slate-600"
            onClick={() => openEditModal(record)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded p-1"
            onClick={() => handleDeleteVocabulary(record)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center py-20">
        <AppSpinner className="py-0" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-red-500">
        {t("deck.detailLoadFailed")}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {contextHolder}
      <div className="mb-4 text-sm text-slate-500">
        <Link to="/decks" className="font-medium text-[#198de6] hover:underline">
          {t("deck.managementTitle")}
        </Link>{" "}
        <span className="mx-1">›</span>
        <span>{data.name}</span>
      </div>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{data.name}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{t("deck.detailSubtitle", { count: data.vocabularyCount })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="primary" onClick={openPracticeConfirm}>
            {t("deck.review")}
          </Button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/90">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          prefix={<Search className="h-4 w-4 text-slate-400" />}
          placeholder={t("deck.searchWordPlaceholder")}
          className="w-full"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/90">
        <Table
          rowKey="id"
          dataSource={pagedWords}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: (nextSelectedRowKeys) => setSelectedRowKeys(nextSelectedRowKeys),
            preserveSelectedRowKeys: true,
          }}
          pagination={false}
          locale={{ emptyText: t("deck.noWordsFound") }}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {t("deck.showingWords", {
              from: filteredWords.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, filteredWords.length),
              total: filteredWords.length,
            })}
          </span>
          <Pagination
            size="small"
            current={page}
            total={filteredWords.length}
            pageSize={PAGE_SIZE}
            showSizeChanger={false}
            onChange={setPage}
          />
        </div>
      </div>

      <PracticeConfirmModal
        open={isPracticeConfirmOpen}
        totalWords={practiceVocabularies.length}
        vocabularies={practiceVocabularies}
        useFilteredFallback={selectedRowKeys.length === 0}
        onCancel={() => setIsPracticeConfirmOpen(false)}
        onSelectMode={handleSelectPracticeMode}
      />

      <EditVocabularyFormModal
        open={!!editingVocabulary}
        isSubmitting={updateVocabularyMutation.isPending}
        initialValues={{
          text: editingVocabulary?.text ?? "",
          meaning: editingVocabulary?.meaning ?? "",
          partOfSpeech: editingVocabulary?.partOfSpeech ?? "",
          pronunciation: editingVocabulary?.pronunciation ?? "",
        }}
        onClose={() => setEditingVocabulary(null)}
        onSubmit={async (values) => {
          if (!editingVocabulary) return;
          const nextMeaning = values.meaning?.trim() || "";
          const nextPartOfSpeech = values.partOfSpeech?.trim() || "";
          const nextPronunciation = values.pronunciation?.trim() || "";
          const hasChanges =
            nextMeaning !== (editingVocabulary.meaning?.trim() || "") ||
            nextPartOfSpeech !== (editingVocabulary.partOfSpeech?.trim() || "") ||
            nextPronunciation !== (editingVocabulary.pronunciation?.trim() || "");
          if (!hasChanges) {
            setEditingVocabulary(null);
            return;
          }
          try {
            await updateVocabularyMutation.mutateAsync({
              deckId,
              vocabularyId: editingVocabulary.id,
              payload: {
                text: editingVocabulary.text,
                meaning: nextMeaning || undefined,
                partOfSpeech: nextPartOfSpeech || undefined,
                pronunciation: nextPronunciation || undefined,
              },
            });
            message.success(t("deck.wordUpdated"));
            setEditingVocabulary(null);
          } catch (error) {
            showApiError(error, t("deck.updateWordFailed"));
          }
        }}
      />
    </div>
  );
}
