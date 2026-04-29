import React, { useMemo, useState } from "react";
import { Button, Input, Modal, Select, Space, Spin, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Paragraph } from "@/entities/paragraph/schema";
import type { ParagraphSentence } from "@/entities/paragraphSentence/schema";
import type { PracticeSetupInput } from "@/features/practice/schema";
import { LEVELS, PRACTICE_TYPES, SENTENCE_COUNTS, TONES, TOPIC_GROUPS } from "@/features/practice/constants";
import {
  adminCreateParagraph,
  adminDeleteParagraph,
  adminListParagraphs,
  adminUpdateParagraphTitle,
} from "../api";

const ParagraphsTab = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { confirm } = Modal;

  const [searchParams, setSearchParams] = useSearchParams();
  const paragraphsPage = Math.max(0, parseInt(searchParams.get("paragraphsPage") ?? "0", 10) || 0);
  const paragraphsSize = Math.max(1, parseInt(searchParams.get("paragraphsSize") ?? "10", 10) || 10);
  const filterType = searchParams.get("paragraphsType")?.trim() || undefined;
  const filterTone = searchParams.get("paragraphsTone")?.trim() || undefined;
  const filterTopic = searchParams.get("paragraphsTopic")?.trim() || undefined;
  const filterLevel = searchParams.get("paragraphsLevel")?.trim() || undefined;
  const filterSentenceCount = searchParams.get("paragraphsSentenceCount")?.trim() || undefined;
  const filterSentenceCountMax = useMemo(() => {
    if (!filterSentenceCount?.startsWith("<=")) return undefined;
    const parsed = Number.parseInt(filterSentenceCount.slice(2), 10);
    return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : undefined;
  }, [filterSentenceCount]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [editTitleOpen, setEditTitleOpen] = useState(false);
  const [editTitleTargetId, setEditTitleTargetId] = useState<number | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const paragraphsQuery = useQuery({
    queryKey: [
      "adminParagraphs",
      paragraphsPage,
      paragraphsSize,
      filterType,
      filterTone,
      filterTopic,
      filterLevel,
      filterSentenceCount,
    ],
    queryFn: () =>
      adminListParagraphs({
        page: paragraphsPage,
        size: paragraphsSize,
        type: filterType,
        tone: filterTone,
        topic: filterTopic,
        level: filterLevel,
        sentenceCount: filterSentenceCount,
      }),
  });

  const deleteParagraphMutation = useMutation({
    mutationFn: (id: number) => adminDeleteParagraph(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] }),
  });
  const deleteSelectedParagraphsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => adminDeleteParagraph(id)));
    },
    onSuccess: () => {
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] });
    },
  });

  const createParagraphMutation = useMutation({
    mutationFn: (payload: PracticeSetupInput) => adminCreateParagraph(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] }),
  });

  const updateTitleMutation = useMutation({
    mutationFn: (payload: { id: number; title: string }) =>
      adminUpdateParagraphTitle(payload.id, { title: payload.title }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] });
      if (updated && selectedParagraph?.id === updated.id) {
        setSelectedParagraph(updated);
      }
      setEditTitleOpen(false);
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [payload, setPayload] = useState<PracticeSetupInput>({
    type: "DIARIES" as never,
    topic: "LIFE" as never,
    level: "A2" as never,
    tone: "FORMAL" as never,
    sentenceCount: "TEN" as never,
  });

  const topicOptions = useMemo(
    () =>
      TOPIC_GROUPS.flatMap((g) =>
        g.topics.map((topic) => ({
          value: topic.value,
          label: t(`common.topic.${topic.value}`),
        })),
      ),
    [t],
  );

  const setFilterParam = (key: string, value: string | undefined) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value == null || value === "") next.delete(key);
        else next.set(key, value);
        next.set("paragraphsPage", "0");
        return next;
      },
      { replace: true },
    );
  };

  const columns: ColumnsType<Paragraph> = useMemo(
    () => [
      { title: t("admin.columns.id"), dataIndex: "id", key: "id", width: 80 },
      { title: t("admin.columns.title"), dataIndex: "title", key: "title", width: 220 },
      { title: t("admin.columns.type"), dataIndex: "type", key: "type", width: 140 },
      { title: t("admin.columns.topic"), dataIndex: "topic", key: "topic", width: 160 },
      { title: t("admin.columns.level"), dataIndex: "level", key: "level", width: 120 },
      {
        title: t("admin.columns.tone"),
        dataIndex: "tone",
        key: "tone",
        width: 120,
        render: (v: string) => (v ? t(`practice.tone.${v}`) : "-"),
      },
      {
        title: t("admin.columns.sentenceCount"),
        dataIndex: "sentences",
        key: "sentences",
        render: (v) => (v ? v.length : 0),
        width: 140,
      },
      { title: t("admin.columns.created"), dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
      {
        title: t("admin.columns.actions"),
        key: "actions",
        width: 280,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setEditTitleTargetId(record.id);
                setEditTitleValue(record.title ?? "");
                setEditTitleOpen(true);
              }}
            >
              {t("admin.paragraphs.editTitleButton")}
            </Button>
            <Button
              size="small"
              loading={deleteParagraphMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                confirm({
                  title: t("admin.paragraphs.confirmDeleteTitle"),
                  icon: <ExclamationCircleFilled />,
                  onOk: () => deleteParagraphMutation.mutate(record.id),
                });
              }}
            >
              {t("admin.delete")}
            </Button>
          </Space>
        ),
      },
    ],
    [t, confirm, deleteParagraphMutation.isPending, deleteParagraphMutation],
  );

  return (
    <Spin spinning={paragraphsQuery.isLoading}>
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
          <Space wrap>
            <Button type="primary" onClick={() => setCreateOpen(true)}>
              {t("admin.paragraphs.createButton")}
            </Button>
            <Button
              disabled={selectedRowKeys.length === 0}
              loading={deleteSelectedParagraphsMutation.isPending}
              onClick={() => {
                const ids = selectedRowKeys.map((key) => Number(key)).filter((id) => Number.isFinite(id));
                if (!ids.length) return;
                confirm({
                  title: `Delete ${ids.length} selected paragraph(s)?`,
                  icon: <ExclamationCircleFilled />,
                  onOk: () => deleteSelectedParagraphsMutation.mutate(ids),
                });
              }}
            >
              Delete selected ({selectedRowKeys.length})
            </Button>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] })}>
              {t("admin.refresh")}
            </Button>
          </Space>
        </div>
        <Space wrap className="w-full" size={[8, 8]}>
          <Select
            allowClear
            placeholder={t("admin.columns.type")}
            style={{ minWidth: 160 }}
            value={filterType}
            onChange={(v) => setFilterParam("paragraphsType", v ?? undefined)}
            options={PRACTICE_TYPES.map((x) => ({
              value: x.value,
              label: t(`practice.type.${x.value}`),
            }))}
          />
          <Select
            allowClear
            placeholder={t("admin.columns.topic")}
            style={{ minWidth: 180 }}
            value={filterTopic}
            onChange={(v) => setFilterParam("paragraphsTopic", v ?? undefined)}
            options={topicOptions}
          />
          <Select
            allowClear
            placeholder={t("admin.columns.level")}
            style={{ minWidth: 120 }}
            value={filterLevel}
            onChange={(v) => setFilterParam("paragraphsLevel", v ?? undefined)}
            options={LEVELS.map((l) => ({
              value: l.value,
              label: t(`practice.level.${l.value}`),
            }))}
          />
          <Select
            allowClear
            placeholder={t("admin.columns.tone")}
            style={{ minWidth: 140 }}
            value={filterTone}
            onChange={(v) => setFilterParam("paragraphsTone", v ?? undefined)}
            options={TONES.map((x) => ({
              value: x.value,
              label: t(`practice.tone.${x.value}`),
            }))}
          />
          <Select
            allowClear
            placeholder={t("admin.columns.sentenceCount")}
            style={{ minWidth: 160 }}
            value={filterSentenceCount}
            onChange={(v) => setFilterParam("paragraphsSentenceCount", v ?? undefined)}
            options={SENTENCE_COUNTS.map((c) => ({
              value: c.value,
              label: t(`practice.sentenceCount.${c.value}`),
            }))}
          />
          <Input
            placeholder={`${t("admin.columns.sentenceCount")} <=`}
            type="number"
            min={1}
            style={{ width: 170 }}
            value={filterSentenceCountMax}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (!raw) {
                setFilterParam("paragraphsSentenceCount", undefined);
                return;
              }
              const parsed = Number.parseInt(raw, 10);
              if (!Number.isFinite(parsed) || parsed <= 0) return;
              setFilterParam("paragraphsSentenceCount", `<=${parsed}`);
            }}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={paragraphsQuery.data?.content ?? []}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        onRow={(record) => ({
          onClick: (event) => {
            const target = event.target as HTMLElement;
            if (target.closest(".ant-checkbox-wrapper") || target.closest(".ant-checkbox")) return;
            setSelectedParagraph(record);
            setDetailOpen(true);
          },
        })}
        pagination={{
          current: paragraphsPage + 1,
          pageSize: paragraphsSize,
          total: paragraphsQuery.data?.totalElements,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (p, ps) => {
            const nextPage = p - 1;
            const nextSize = ps ?? paragraphsSize;
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.set("paragraphsPage", String(nextPage));
                next.set("paragraphsSize", String(nextSize));
                return next;
              },
              { replace: true },
            );
          },
        }}
      />

      <Modal
        open={detailOpen}
        title={t("admin.paragraphs.detailModalTitle")}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={1000}
        destroyOnClose
        transitionName=""
        maskTransitionName=""
      >
        {selectedParagraph ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-slate-500">{t("admin.columns.id")}</div>
              <div className="font-mono">{selectedParagraph.id}</div>
              <div className="text-slate-500">{t("admin.columns.title")}</div>
              <div className="font-mono">{selectedParagraph.title ?? "-"}</div>
              <div className="text-slate-500">{t("admin.columns.type")}</div>
              <div className="font-mono">{selectedParagraph.type}</div>
              <div className="text-slate-500">{t("admin.columns.topic")}</div>
              <div className="font-mono">{selectedParagraph.topic}</div>
              <div className="text-slate-500">{t("admin.columns.level")}</div>
              <div className="font-mono">{selectedParagraph.level}</div>
              <div className="text-slate-500">{t("admin.columns.tone")}</div>
              <div className="font-mono">
                {selectedParagraph.tone ? t(`practice.tone.${selectedParagraph.tone}`) : "-"}
              </div>
              <div className="text-slate-500">{t("admin.columns.sentenceCount")}</div>
              <div className="font-mono">{selectedParagraph.sentences?.length ?? 0}</div>
              <div className="text-slate-500">{t("admin.columns.created")}</div>
              <div className="font-mono">{selectedParagraph.createdAt ?? "-"}</div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-slate-500 font-semibold">{t("admin.paragraphs.sentencesSection")}</div>
              {selectedParagraph.sentences?.length ? (
                <Typography.Paragraph
                  style={{ margin: 0 }}
                  className="bg-slate-50/50 dark:bg-slate-950/30 rounded-lg bg-white dark:bg-slate-900/90 sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-3 md:px-6 text-slate-800 dark:text-slate-100 font-medium leading-6 sm:leading-7 space-y-3"
                >
                  {selectedParagraph.sentences.map((s: ParagraphSentence, idx: number) => (
                    <React.Fragment key={`${s.id ?? idx}`}>
                      <Typography.Text className="relative inline whitespace-pre-line text-sm text-gray-600 dark:text-slate-500 opacity-60">
                        {" " + s.content.replace(/\n/g, "\n\n")}
                      </Typography.Text>
                    </React.Fragment>
                  ))}
                </Typography.Paragraph>
              ) : (
                <div className="text-sm text-slate-500">{t("admin.paragraphs.noSentences")}</div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={createOpen}
        closable={false}
        title={t("admin.paragraphs.createModalTitle")}
        onCancel={() => setCreateOpen(false)}
        destroyOnClose
        transitionName=""
        maskTransitionName=""
        onOk={() => {
          createParagraphMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
        }}
        confirmLoading={createParagraphMutation.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Select
            value={payload.type}
            onChange={(v) => setPayload((p) => ({ ...p, type: v as never }))}
            style={{ width: "100%" }}
            options={PRACTICE_TYPES.map((x) => ({
              value: x.value,
              label: t(`practice.type.${x.value}`),
            }))}
          />
          <Select
            value={payload.tone}
            onChange={(v) => setPayload((p) => ({ ...p, tone: v as never }))}
            style={{ width: "100%" }}
            options={TONES.map((x) => ({
              value: x.value,
              label: t(`practice.tone.${x.value}`),
            }))}
          />
          <Select
            value={payload.topic}
            onChange={(v) => setPayload((p) => ({ ...p, topic: v as never }))}
            style={{ width: "100%" }}
            options={topicOptions}
          />
          <Select
            value={payload.level}
            onChange={(v) => setPayload((p) => ({ ...p, level: v as never }))}
            style={{ width: "100%" }}
            options={LEVELS.map((l) => ({
              value: l.value,
              label: t(`practice.level.${l.value}`),
            }))}
          />
          <Select
            value={payload.sentenceCount}
            onChange={(v) => setPayload((p) => ({ ...p, sentenceCount: v as never }))}
            style={{ width: "100%" }}
            options={SENTENCE_COUNTS.map((c) => ({
              value: c.value,
              label: t(`practice.sentenceCount.${c.value}`),
            }))}
          />
        </Space>
      </Modal>

      <Modal
        open={editTitleOpen}
        closable={false}
        title={t("admin.paragraphs.editTitleModal")}
        onCancel={() => setEditTitleOpen(false)}
        destroyOnClose
        transitionName=""
        maskTransitionName=""
        onOk={() => {
          if (editTitleTargetId == null) return;
          updateTitleMutation.mutate({ id: editTitleTargetId, title: editTitleValue });
        }}
        okButtonProps={{
          disabled: !editTitleValue.trim() || updateTitleMutation.isPending,
        }}
        confirmLoading={updateTitleMutation.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          <Typography.Text type="secondary">
            {t("admin.labels.paragraphIdShort")} {editTitleTargetId ?? "-"}
          </Typography.Text>
          <Input
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            placeholder={t("admin.placeholders.title")}
          />
        </Space>
      </Modal>
    </Spin>
  );
};

export default React.memo(ParagraphsTab);
