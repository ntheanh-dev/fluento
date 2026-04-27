import { Input, Modal, Select } from "antd";
import {
  BookOpen,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DECK_ICON_OPTIONS, type DeckOption } from "@/features/deck/schema";
export type { DeckOption } from "@/features/deck/schema";

type DeckPickerModalProps = {
  open: boolean;
  createOnly?: boolean;
  formMode?: "create" | "edit";
  initialIcon?: string;
  pendingVocabularyText?: string | null;
  decks: DeckOption[];
  selectedDeckId: number | null;
  newDeckName: string;
  isLoadingDecks: boolean;
  isSavingVocabulary: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSelectDeck: (deckId: number) => void;
  onNewDeckNameChange: (value: string) => void;
  onCreateDeck: (icon: string) => Promise<void> | void;
};

export function DeckPickerModal({
  open,
  createOnly = false,
  formMode = "create",
  initialIcon = "book-open",
  pendingVocabularyText,
  decks,
  selectedDeckId,
  newDeckName,
  isLoadingDecks,
  isSavingVocabulary,
  onClose,
  onConfirm,
  onSelectDeck,
  onNewDeckNameChange,
  onCreateDeck,
}: DeckPickerModalProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"link" | "create">(createOnly ? "create" : "link");
  const [selectedIcon, setSelectedIcon] = useState<string>("book-open");

  useEffect(() => {
    if (!open) return;
    setMode(createOnly ? "create" : "link");
    setSelectedIcon(initialIcon || "book-open");
  }, [createOnly, initialIcon, open]);

  const iconComponentByKey = useMemo(
    () =>
      Object.fromEntries(
        DECK_ICON_OPTIONS.map((item) => [item.key, item.icon]),
      ) as Record<string, typeof BookOpen>,
    [],
  );

  const handleCreateDeck = async () => {
    await onCreateDeck(selectedIcon);
    if (createOnly) {
      handleClose();
      return;
    }
    setMode("link");
  };

  const handleClose = () => {
    setMode(createOnly ? "create" : "link");
    setSelectedIcon(initialIcon || "book-open");
    onClose();
  };

  const handleConfirm = () => {
    if (mode === "create") {
      void handleCreateDeck();
      return;
    }
    onConfirm();
  };

  const modalTitle = mode === "create"
    ? (formMode === "edit" ? t("deck.editModalTitle") : t("deck.createModalTitle"))
    : (pendingVocabularyText ? t("deck.saveWordToDeck", { word: pendingVocabularyText }) : t("deck.saveWord"));

  const okText = mode === "create" ? (formMode === "edit" ? t("common.save") : t("deck.createDeck")) : t("deck.saveWord");
  const cancelText = mode === "create" ? (createOnly ? t("practice.result.retryCancel") : t("practice.detail.backToSummary")) : t("practice.result.retryCancel");

  return (
    <Modal
      open={open}
      centered
      title={modalTitle}
      onCancel={mode === "create" && !createOnly
        ? () => {
          setMode("link");
          setSelectedIcon("book-open");
        }
        : handleClose}
      onOk={handleConfirm}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ loading: isSavingVocabulary }}
      destroyOnClose
      transitionName=""
      maskTransitionName=""
    >
      <div className="space-y-3">
        {mode === "link" && !createOnly && (
          <>
            {isLoadingDecks && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="size-4 animate-spin text-slate-400" />
              </div>
            )}
            {!isLoadingDecks && decks.length > 0 ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("deck.chooseDeck")}</p>
                <Select
                  value={selectedDeckId ?? undefined}
                  onChange={(value) => onSelectDeck(value)}
                  className="w-full"
                  placeholder={t("deck.pickDeckPlaceholder")}
                  options={decks.map((deck) => ({
                    value: deck.id,
                    label: (
                      <span className="flex items-center gap-2">
                        {(() => {
                          const Icon = iconComponentByKey[deck.icon ?? "book-open"] ?? BookOpen;
                          return <Icon className="size-3.5 shrink-0" />;
                        })()}
                        <span className="truncate">{deck.name}</span>
                      </span>
                    ),
                  }))}
                />
              </div>
            ) : !isLoadingDecks ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("deck.emptyDeckHint")}
              </p>
            ) : null}

            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <button
                type="button"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => {
                  setSelectedIcon("book-open");
                  setMode("create");
                }}
              >
                + {t("deck.createFirstDeck")}
              </button>
            </div>
          </>
        )}

        {mode === "create" && (
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t("deck.deckName")}</p>
              <Input
                value={newDeckName}
                onChange={(event) => onNewDeckNameChange(event.target.value)}
                placeholder={t("deck.deckNamePlaceholder")}
                onPressEnter={() => {
                  void handleCreateDeck();
                }}
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t("deck.pickIcon")}</p>
              <div className=" p-2 dark:border-slate-700">
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-7">
                  {DECK_ICON_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const active = selectedIcon === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        title={item.label}
                        onClick={() => setSelectedIcon(item.key)}
                        className={`flex items-center justify-center rounded-lg border p-1.5 transition-colors ${active
                          ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                      >
                        <Icon className="size-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
