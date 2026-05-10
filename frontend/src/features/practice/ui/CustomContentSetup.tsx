import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileEdit, Sparkles } from "lucide-react";
import { LEVELS, TONES, TOPIC_GROUPS } from "../constants";
import { useCreateUserPracticeMutation } from "../mutation";
import type { PracticeSetupInput } from "../schema";
import {
  splitUserInputSentences,
  USER_INPUT_MAX_CHARS,
  USER_INPUT_MAX_SENTENCES,
} from "../splitUserInputContent";
import { Button, Form, Input, Modal, message } from "antd";
import { useTranslation } from "react-i18next";
import {
  TARGET_LANGUAGE_ITEMS,
  type TargetLanguage,
} from "@/shared/constants/target-language";
import { AppSpinner } from "@/shared/components/AppSpinner";
import { FlagIcon } from "@/shared/utilities/flag";

const { TextArea } = Input;

/** Fixed backend metadata for USER_INPUT practice */
const USER_INPUT_TOPIC = TOPIC_GROUPS[0]?.topics[0]?.value ?? "LIFE";
const USER_INPUT_LEVEL = LEVELS[0]?.value ?? "A2";
const USER_INPUT_TONE = TONES[0]?.value ?? "FORMAL";

type FormValues = {
  rawContent: string;
};

const CustomContentSetup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form] = Form.useForm<FormValues>();

  const rawContentValue = Form.useWatch("rawContent", form) ?? "";

  const { mutateAsync: createUserPractice, isPending } =
    useCreateUserPracticeMutation();

  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);

  const sentenceCount = splitUserInputSentences(rawContentValue).length;

  const openLanguageModal = async () => {
    try {
      await form.validateFields();
      setIsLanguageDialogOpen(true);
    } catch {
      // Antd will display validation errors automatically
    }
  };

  const handleStart = async (language: TargetLanguage) => {
    try {
      const values = await form.validateFields();

      const trimmed = (values.rawContent ?? "").trim();

      if (!trimmed) {
        message.warning(
          t("practice.setup.customContentRequired")
        );
        return;
      }

      const payload: PracticeSetupInput = {
        type: "USER_INPUT",
        tone: USER_INPUT_TONE,
        topic: USER_INPUT_TOPIC,
        level: USER_INPUT_LEVEL,
        rawContent: trimmed,
        targetLanguage: language,
      };

      const { id } = await createUserPractice(payload);

      setIsLanguageDialogOpen(false);

      navigate(`/practice/${id}`);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      message.error(
        err?.response?.data?.message ??
        err?.message ??
        t("practice.setup.createFailed")
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 md:px-8 md:pt-12">
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm shadow-blue-500/25 dark:bg-blue-600">
          <FileEdit className="h-5 w-5" strokeWidth={2.2} />
        </div>

        <div>
          <h1 className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-100 md:text-xl">
            {t("practice.setup.customContentPageTitle")}
          </h1>
        </div>
      </header>

      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        scrollToFirstError
        initialValues={{
          rawContent: "",
        }}
      >
        <Form.Item<FormValues>
          name="rawContent"
          label={null}
          className="!mb-2"
          validateTrigger={["onBlur", "onSubmit"]}
          rules={[
            {
              required: true,
              whitespace: true,
              message: t("practice.setup.customContentRequired"),
            },
            {
              max: USER_INPUT_MAX_CHARS,
              message: t(
                "practice.setup.customContentMaxLength",
                {
                  max: USER_INPUT_MAX_CHARS,
                }
              ),
            },
            {
              validator: async (_, value) => {
                const v =
                  typeof value === "string"
                    ? value.trim()
                    : "";

                if (v === "") {
                  return;
                }

                const sentences =
                  splitUserInputSentences(v);

                if (sentences.length === 0) {
                  throw new Error(
                    t(
                      "practice.setup.customContentNoSentences"
                    )
                  );
                }

                if (
                  sentences.length >
                  USER_INPUT_MAX_SENTENCES
                ) {
                  throw new Error(
                    t(
                      "practice.setup.customContentTooManySentences",
                      {
                        count: sentences.length,
                        max: USER_INPUT_MAX_SENTENCES,
                      }
                    )
                  );
                }
              },
            },
          ]}
        >
          <div className="rounded-2xl border border-slate-200/90 bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70">
            <TextArea
              placeholder={t(
                "practice.setup.customContentPlaceholder"
              )}
              className="!min-h-[400px] !resize-none !border-0 !bg-transparent !px-4 !pb-24 !pt-4 !text-base !leading-relaxed !shadow-none focus:!shadow-none"
              maxLength={USER_INPUT_MAX_CHARS}
              aria-label={t(
                "practice.setup.customContentLabel"
              )}
            />

            <div className="flex items-end justify-between gap-3 px-3 pb-3 pt-6 md:px-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                  {t("practice.setup.customContentHint")}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <p className="tabular-nums text-slate-400 dark:text-slate-500">
                    {rawContentValue.length} /{" "}
                    {USER_INPUT_MAX_CHARS} characters
                  </p>

                  <p className="tabular-nums text-slate-400 dark:text-slate-500">
                    {sentenceCount} /{" "}
                    {USER_INPUT_MAX_SENTENCES} sentences
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Button
                  type="primary"
                  size="large"
                  loading={isPending}
                  disabled={isPending}
                  className="h-11 rounded-xl px-5 font-semibold shadow-md shadow-blue-500/20"
                  icon={
                    <Sparkles className="h-4 w-4" />
                  }
                  iconPosition="end"
                  onClick={() =>
                    void openLanguageModal()
                  }
                >
                  {t(
                    "practice.setup.customContentStartPractice"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Form.Item>
      </Form>

      <Modal
        open={isLanguageDialogOpen}
        onCancel={() => {
          if (!isPending) {
            setIsLanguageDialogOpen(false);
          }
        }}
        centered
        width={520}
        footer={null}
        closable={!isPending}
        maskClosable={!isPending}
        destroyOnClose
        title={
          <div className="text-center">
            <h3 className="text-[28px] font-semibold leading-tight text-slate-900 dark:text-slate-100">
              {t("practice.setup.languageModalTitle")}
            </h3>
          </div>
        }
        styles={{
          header: {
            background: "transparent",
            paddingBottom: 8,
          },
          body: {
            paddingTop: 4,
          },
        }}
      >
        <p className="mb-5 text-center text-base text-slate-500 dark:text-slate-400">
          {t(
            "practice.setup.languageModalDescription"
          )}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TARGET_LANGUAGE_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              disabled={isPending}
              onClick={() =>
                void handleStart(
                  item.value as TargetLanguage
                )
              }
              className="relative flex min-h-[98px] flex-col items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-center text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
            >
              <FlagIcon
                countryCode={item.countryCode}
                className="h-5 w-7 rounded-[2px]"
              />

              <div className="flex flex-col">
                <span className="text-base font-semibold leading-none">
                  {item.name}
                </span>

                <span className="mt-1 text-xs tracking-wide text-slate-500 dark:text-slate-400">
                  {item.value}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {isPending && (
        <AppSpinner
          fullscreen
          text={t(
            "practice.setup.creatingCustom"
          )}
        />
      )}
    </div>
  );
};

export default CustomContentSetup;