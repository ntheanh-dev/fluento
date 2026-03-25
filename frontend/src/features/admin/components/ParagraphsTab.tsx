import React, { useMemo, useState } from "react";
import { Button, Input, Modal, Select, Space, Spin, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

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
  const queryClient = useQueryClient();
  const { confirm } = Modal;

  const [searchParams, setSearchParams] = useSearchParams();
  const paragraphsPage = Math.max(0, parseInt(searchParams.get("paragraphsPage") ?? "0", 10) || 0);
  const paragraphsSize = Math.max(1, parseInt(searchParams.get("paragraphsSize") ?? "10", 10) || 10);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(null);

  const [editTitleOpen, setEditTitleOpen] = useState(false);
  const [editTitleTargetId, setEditTitleTargetId] = useState<number | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const paragraphsQuery = useQuery({
    queryKey: ["adminParagraphs", paragraphsPage, paragraphsSize],
    queryFn: () => adminListParagraphs(paragraphsPage, paragraphsSize),
  });

  const deleteParagraphMutation = useMutation({
    mutationFn: (id: number) => adminDeleteParagraph(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] }),
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
    type: "BASIC" as any,
    topic: "LIFE" as any,
    level: "A2" as any,
    tone: "FORMAL" as any,
    sentenceCount: "TEN" as any,
  });

  const topicOptions = useMemo(
    () => TOPIC_GROUPS.flatMap((g) => g.topics.map((t) => ({ value: t.value, label: t.label }))),
    [],
  );

  const columns: ColumnsType<Paragraph> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      { title: "Title", dataIndex: "title", key: "title", width: 220 },
      { title: "Type", dataIndex: "type", key: "type", width: 140 },
      { title: "Topic", dataIndex: "topic", key: "topic", width: 160 },
      { title: "Level", dataIndex: "level", key: "level", width: 120 },
      { title: "# Sentences", dataIndex: "sentences", key: "sentences", render: (v) => (v ? v.length : 0), width: 140 },
      { title: "Created", dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
      {
        title: "Actions",
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
              Edit title
            </Button>
            <Button
              size="small"
              danger
              loading={deleteParagraphMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                confirm({
                  title: "Delete paragraph?",
                  icon: <ExclamationCircleFilled />,
                  okType: "danger",
                  onOk: () => deleteParagraphMutation.mutate(record.id),
                });
              }}
            >
              Delete
            </Button>
          </Space>
        ),
      },
    ],
    [confirm, deleteParagraphMutation.isPending, deleteParagraphMutation],
  );

  return (
    <Spin spinning={paragraphsQuery.isLoading}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
        <Space>
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            Create paragraph
          </Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] })}>Refresh</Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={paragraphsQuery.data?.content ?? []}
        onRow={(record) => ({
          onClick: () => {
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
        title="Paragraph detail"
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={1000}
      >
        {selectedParagraph ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-slate-500">ID</div>
              <div className="font-mono">{selectedParagraph.id}</div>
              <div className="text-slate-500">Title</div>
              <div className="font-mono">{selectedParagraph.title ?? "-"}</div>
              <div className="text-slate-500">Type</div>
              <div className="font-mono">{selectedParagraph.type}</div>
              <div className="text-slate-500">Topic</div>
              <div className="font-mono">{selectedParagraph.topic}</div>
              <div className="text-slate-500">Level</div>
              <div className="font-mono">{selectedParagraph.level}</div>
              <div className="text-slate-500"># Sentences</div>
              <div className="font-mono">{selectedParagraph.sentences?.length ?? 0}</div>
              <div className="text-slate-500">Created</div>
              <div className="font-mono">{selectedParagraph.createdAt ?? "-"}</div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-slate-500 font-semibold">Sentences</div>
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
                <div className="text-sm text-slate-500">No sentences</div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={createOpen}
        title="Create paragraph (AI-generated)"
        onCancel={() => setCreateOpen(false)}
        onOk={() => {
          createParagraphMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
        }}
        confirmLoading={createParagraphMutation.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Select
            value={payload.type}
            onChange={(v) => setPayload((p) => ({ ...p, type: v as any }))}
            style={{ width: "100%" }}
            options={PRACTICE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <Select
            value={payload.tone}
            onChange={(v) => setPayload((p) => ({ ...p, tone: v as any }))}
            style={{ width: "100%" }}
            options={TONES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <Select
            value={payload.topic}
            onChange={(v) => setPayload((p) => ({ ...p, topic: v as any }))}
            style={{ width: "100%" }}
            options={topicOptions}
          />
          <Select
            value={payload.level}
            onChange={(v) => setPayload((p) => ({ ...p, level: v as any }))}
            style={{ width: "100%" }}
            options={LEVELS.map((l) => ({ value: l.value, label: l.label }))}
          />
          <Select
            value={payload.sentenceCount}
            onChange={(v) => setPayload((p) => ({ ...p, sentenceCount: v as any }))}
            style={{ width: "100%" }}
            options={SENTENCE_COUNTS.map((c) => ({ value: c.value, label: c.label }))}
          />
        </Space>
      </Modal>

      <Modal
        open={editTitleOpen}
        title="Edit paragraph title"
        onCancel={() => setEditTitleOpen(false)}
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
          <Typography.Text type="secondary">Paragraph ID: {editTitleTargetId ?? "-"}</Typography.Text>
          <Input
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            placeholder="Title"
          />
        </Space>
      </Modal>
    </Spin>
  );
};

export default React.memo(ParagraphsTab);

