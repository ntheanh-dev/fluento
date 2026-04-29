import React, { useMemo, useState } from "react";
import { Button, Collapse, Input, InputNumber, List, Modal, Space, Spin, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { ParagraphSentence } from "@/entities/paragraphSentence/schema";
import {
  adminDeleteParagraphSentence,
  adminGenerateParagraphSentenceHints,
  adminListParagraphSentencesByParagraphId,
  adminUpdateParagraphSentenceContent,
} from "../api";

const ParagraphSentencesTab = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { confirm } = Modal;

  const [searchParams, setSearchParams] = useSearchParams();
  const paragraphIdRaw = searchParams.get("paragraphSentencesParagraphId");
  const paragraphId =
    paragraphIdRaw == null ? undefined : Math.max(1, parseInt(paragraphIdRaw, 10) || 0) || undefined;
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<ParagraphSentence | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const sentencesQuery = useQuery({
    queryKey: ["adminParagraphSentences", paragraphId],
    enabled: paragraphId != null,
    queryFn: () => adminListParagraphSentencesByParagraphId(paragraphId!),
  });

  const generateHintsMutation = useMutation({
    mutationFn: (sentenceId: number) => adminGenerateParagraphSentenceHints(sentenceId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["adminParagraphSentences", paragraphId],
      }),
  });

  const deleteSentenceMutation = useMutation({
    mutationFn: (sentenceId: number) => adminDeleteParagraphSentence(sentenceId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["adminParagraphSentences", paragraphId],
      }),
  });

  const updateSentenceMutation = useMutation({
    mutationFn: (payload: { id: number; content: string }) =>
      adminUpdateParagraphSentenceContent(payload.id, { content: payload.content }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ["adminParagraphSentences", paragraphId],
      });
      if (updated && editTargetId != null && updated.id === editTargetId) {
        setSelectedSentence(updated);
      }
      setEditOpen(false);
    },
  });

  const columns: ColumnsType<ParagraphSentence> = useMemo(
    () => [
      { title: t("admin.columns.id"), dataIndex: "id", key: "id", width: 80 },
      { title: t("admin.columns.order"), dataIndex: "orderIndex", key: "orderIndex", width: 90 },
      {
        title: t("admin.columns.content"),
        dataIndex: "content",
        key: "content",
        render: (v) => (v ? String(v).slice(0, 60) + (String(v).length > 60 ? "..." : "") : "-"),
      },
      {
        title: t("admin.columns.hints"),
        key: "hints",
        render: (_, r) => {
          const count = r.vocabularyHints?.length ?? 0;
          return (
            <Tag color={count ? "blue" : undefined}>
              {count ? t("admin.paragraphSentences.hintItems", { count }) : t("admin.paragraphSentences.hintNone")}
            </Tag>
          );
        },
      },
      {
        title: t("admin.columns.actions"),
        key: "actions",
        width: 240,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setEditTargetId(record.id);
                setEditValue(record.content);
                setEditOpen(true);
              }}
              disabled={record.content == null}
            >
              {t("admin.edit")}
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                confirm({
                  title: t("admin.paragraphSentences.confirmGenerateHints"),
                  icon: <ExclamationCircleFilled />,
                  okType: "primary",
                  onOk: () => generateHintsMutation.mutate(record.id),
                });
              }}
              loading={generateHintsMutation.isPending}
            >
              {t("admin.paragraphSentences.generate")}
            </Button>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                confirm({
                  title: t("admin.paragraphSentences.confirmDeleteSentence"),
                  icon: <ExclamationCircleFilled />,
                  onOk: () => deleteSentenceMutation.mutate(record.id),
                });
              }}
              loading={deleteSentenceMutation.isPending}
            >
              {t("admin.delete")}
            </Button>
          </Space>
        ),
      },
    ],
    [t, confirm, deleteSentenceMutation.isPending, generateHintsMutation.isPending],
  );

  return (
    <Spin spinning={sentencesQuery.isLoading}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
        <Space>
          <span className="text-sm text-slate-600 dark:text-slate-300">{t("admin.labels.paragraphId")}</span>
          <InputNumber
            value={paragraphId}
            onChange={(v) => {
              const nextParagraphId = v ?? undefined;
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (nextParagraphId == null) next.delete("paragraphSentencesParagraphId");
                  else next.set("paragraphSentencesParagraphId", String(nextParagraphId));
                  return next;
                },
                { replace: true },
              );
            }}
            min={1}
          />
        </Space>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["adminParagraphSentences", paragraphId],
            })
          }
          disabled={paragraphId == null}
        >
          {t("admin.refresh")}
        </Button>
      </div>

      <Table<ParagraphSentence>
        rowKey="id"
        columns={columns}
        dataSource={sentencesQuery.data ?? []}
        onRow={(record) => ({
          onClick: () => {
            setSelectedSentence(record);
            setDetailOpen(true);
          },
        })}
        pagination={false}
      />

      <Modal
        open={detailOpen}
        title={t("admin.paragraphSentences.detailModalTitle")}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={860}
        destroyOnClose
        transitionName=""
        maskTransitionName=""
      >
        {selectedSentence ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-slate-500">{t("admin.columns.id")}</div>
              <div className="font-mono">{selectedSentence.id}</div>
              <div className="text-slate-500">{t("admin.columns.order")}</div>
              <div className="font-mono">{selectedSentence.orderIndex}</div>
            </div>

            <div>
              <div className="text-slate-500 text-sm mb-1">{t("admin.columns.content")}</div>
              <Typography.Paragraph
                style={{ margin: 0 }}
                className="bg-slate-50/50 dark:bg-slate-950/30 rounded-lg bg-white dark:bg-slate-900/90 sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 dark:text-slate-100 font-medium leading-6 sm:leading-7 space-y-3"
              >
                <Typography.Text className="relative inline whitespace-pre-line text-sm py-2 text-blue-600 font-bold">
                  {" " + selectedSentence.content.replace(/\n/g, "\n\n")}
                </Typography.Text>
              </Typography.Paragraph>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-slate-500 text-sm">{t("admin.columns.hints")}</div>
                <Tag color={(selectedSentence.vocabularyHints?.length ?? 0) ? "blue" : undefined}>
                  {t("admin.paragraphSentences.hintItems", {
                    count: selectedSentence.vocabularyHints?.length ?? 0,
                  })}
                </Tag>
              </div>

              {selectedSentence.vocabularyHints?.length ? (
                <Collapse
                  size="small"
                  items={selectedSentence.vocabularyHints.map((h, idx) => ({
                    key: String(idx),
                    label: (
                      <Space>
                        <Typography.Text strong>{h.sourceText}</Typography.Text>
                        <Typography.Text type="secondary">
                          {t("admin.paragraphSentences.vocabCount", { count: h.translations?.length ?? 0 })}
                        </Typography.Text>
                      </Space>
                    ),
                    children: (
                      <List
                        size="small"
                        dataSource={h.translations ?? []}
                        renderItem={(v) => (
                          <List.Item>
                            <Space wrap>
                              <Tag color="geekblue">{v.text}</Tag>
                              {v.partsOfSpeech ? <Tag>{v.partsOfSpeech}</Tag> : null}
                              {v.pronunciation ? (
                                <Typography.Text type="secondary">{v.pronunciation}</Typography.Text>
                              ) : null}
                            </Space>
                          </List.Item>
                        )}
                      />
                    ),
                  }))}
                />
              ) : (
                <Typography.Text type="secondary">{t("admin.paragraphSentences.noHints")}</Typography.Text>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editOpen}
        closable={false}
        title={t("admin.paragraphSentences.editContentModalTitle")}
        onCancel={() => setEditOpen(false)}
        destroyOnClose
        transitionName=""
        maskTransitionName=""
        onOk={() => {
          if (editTargetId == null) return;
          const next = editValue;
          updateSentenceMutation.mutate({ id: editTargetId, content: next });
        }}
        okButtonProps={{
          disabled: !editValue.trim() || updateSentenceMutation.isPending,
        }}
        confirmLoading={updateSentenceMutation.isPending}
        width={860}
      >
        <Input.TextArea value={editValue} rows={6} onChange={(e) => setEditValue(e.target.value)} />
      </Modal>
    </Spin>
  );
};

export default React.memo(ParagraphSentencesTab);
