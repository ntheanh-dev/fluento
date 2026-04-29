import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Modal } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  createDeckFormSchema,
  DECK_ICON_OPTIONS,
  type CreateDeckFormValues,
} from "@/features/deck/schema";

type CreateDeckFormProps = {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; icon: string }) => Promise<void> | void;
};

export function CreateDeckForm({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateDeckFormProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateDeckFormValues>({
    resolver: zodResolver(createDeckFormSchema),
    defaultValues: {
      name: "",
      icon: "book-open",
    },
  });

  const selectedIcon = watch("icon");

  useEffect(() => {
    if (!open) return;
    reset({
      name: "",
      icon: "book-open",
    });
  }, [open, reset]);

  return (
    <Modal
      open={open}
      closable={false}
      centered
      title={t("deck.createModalTitle")}
      onCancel={onClose}
      onOk={() => void handleSubmit((values) => onSubmit(values))()}
      okText={t("common.create")}
      cancelText={t("practice.result.retryCancel")}
      okButtonProps={{ loading: isSubmitting }}
      destroyOnClose
      transitionName=""
      maskTransitionName=""
    >
      <div className="space-y-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("deck.deckName")}
          </p>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder={t("deck.deckNamePlaceholder")}
                onPressEnter={() => void handleSubmit((values) => onSubmit(values))()}
                status={errors.name ? "error" : ""}
              />
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("deck.pickIcon")}
          </p>
          <Controller
            control={control}
            name="icon"
            render={() => (
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-7">
                {DECK_ICON_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const active = selectedIcon === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      title={item.label}
                      onClick={() => setValue("icon", item.key, { shouldValidate: true })}
                      className={`flex items-center justify-center rounded-lg border p-1.5 transition-colors ${
                        active
                          ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300"
                          : "border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}
