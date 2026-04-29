import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Modal } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  type UpdateVocabularyFormValues,
  updateVocabularySchema,
} from "@/features/vocabulary/schema";

type EditVocabularyFormModalProps = {
  open: boolean;
  isSubmitting: boolean;
  initialValues: UpdateVocabularyFormValues;
  onClose: () => void;
  onSubmit: (values: UpdateVocabularyFormValues) => Promise<void> | void;
};

export function EditVocabularyFormModal({
  open,
  isSubmitting,
  initialValues,
  onClose,
  onSubmit,
}: EditVocabularyFormModalProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateVocabularyFormValues>({
    resolver: zodResolver(updateVocabularySchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(initialValues);
  }, [initialValues, open, reset]);

  return (
    <Modal
      open={open}
      closable={false}
      centered
      title={t("deck.vocabularyModal.title")}
      onCancel={onClose}
      onOk={() => void handleSubmit((values) => onSubmit(values))()}
      okText={t("common.save")}
      cancelText={t("practice.result.retryCancel")}
      okButtonProps={{ loading: isSubmitting }}
      destroyOnClose
      transitionName=""
      maskTransitionName=""
    >
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{t("deck.vocabularyModal.word")}</p>
          <Controller
            control={control}
            name="text"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                disabled
                status={errors.text ? "error" : ""}
              />
            )}
          />
          {errors.text && (
            <p className="mt-1 text-xs text-red-500">{errors.text.message}</p>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{t("deck.vocabularyModal.meaning")}</p>
          <Controller
            control={control}
            name="meaning"
            render={({ field }) => <Input {...field} value={field.value ?? ""} />}
          />
        </div>

        <div>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{t("deck.vocabularyModal.partOfSpeech")}</p>
          <Controller
            control={control}
            name="partOfSpeech"
            render={({ field }) => <Input {...field} value={field.value ?? ""} />}
          />
        </div>

        <div>
          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{t("deck.vocabularyModal.pronunciation")}</p>
          <Controller
            control={control}
            name="pronunciation"
            render={({ field }) => <Input {...field} value={field.value ?? ""} />}
          />
        </div>
      </div>
    </Modal>
  );
}
