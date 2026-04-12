import React, { useMemo, useState } from "react";
import { Button, Input, InputNumber, Modal, Space, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { maskApiKey } from "@/entities/apiKey/schema";
import type { AdminApiKeyResponse } from "../api";
import {
  adminCreateApiKey,
  adminDeleteApiKey,
  adminListApiKeys,
  adminUpdateApiKeyCredit,
} from "../api";

const ApiKeysTab = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { confirm } = Modal;

  const [searchParams, setSearchParams] = useSearchParams();
  const apiKeysPage = Math.max(0, parseInt(searchParams.get("apiKeysPage") ?? "0", 10) || 0);
  const apiKeysSize = Math.max(1, parseInt(searchParams.get("apiKeysSize") ?? "10", 10) || 10);
  const apiKeysUserIdRaw = searchParams.get("apiKeysUserId");
  const apiKeysUserId =
    apiKeysUserIdRaw == null ? undefined : Math.max(1, parseInt(apiKeysUserIdRaw, 10) || 0) || undefined;

  const apiKeysQuery = useQuery({
    queryKey: ["adminApiKeys", apiKeysPage, apiKeysSize, apiKeysUserId],
    queryFn: () => adminListApiKeys({ userId: apiKeysUserId, page: apiKeysPage, size: apiKeysSize }),
  });

  const updateCreditMutation = useMutation({
    mutationFn: (payload: { id: number; credit: number }) =>
      adminUpdateApiKeyCredit(payload.id, { credit: payload.credit }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminApiKeys"] }),
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (id: number) => adminDeleteApiKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminApiKeys"] }),
  });

  const createApiKeyMutation = useMutation({
    mutationFn: (payload: { userId: number; apiKey: string }) => adminCreateApiKey(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminApiKeys"] }),
  });

  const [setCreditOpen, setSetCreditOpen] = useState(false);
  const [setCreditTargetId, setSetCreditTargetId] = useState<number | null>(null);
  const [setCreditValue, setSetCreditValue] = useState<number>(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [createUserId, setCreateUserId] = useState<number | null>(null);
  const [createApiKeyValue, setCreateApiKeyValue] = useState("");

  const columns: ColumnsType<AdminApiKeyResponse> = useMemo(
    () => [
      { title: t("admin.columns.id"), dataIndex: "id", key: "id", width: 80 },
      {
        title: t("admin.columns.user"),
        key: "user",
        width: 160,
        render: (_, r) => (r.username ? `${r.username} (#${r.userId})` : `#${r.userId}`),
      },
      { title: t("admin.columns.model"), dataIndex: "model", key: "model", width: 140 },
      {
        title: t("admin.columns.apiKey"),
        dataIndex: "apiKey",
        key: "apiKey",
        render: (v) => maskApiKey(String(v)),
      },
      { title: t("admin.columns.credit"), dataIndex: "credit", key: "credit", width: 100 },
      {
        title: t("admin.columns.active"),
        dataIndex: "isActive",
        key: "isActive",
        width: 90,
        render: (v) => (
          <Tag color={v ? "green" : "red"}>{v ? t("admin.statusTag.active") : t("admin.statusTag.inactive")}</Tag>
        ),
      },
      { title: t("admin.columns.created"), dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
      {
        title: t("admin.columns.actions"),
        key: "actions",
        width: 220,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setSetCreditTargetId(record.id);
                setSetCreditValue(record.credit);
                setSetCreditOpen(true);
              }}
            >
              {t("admin.apiKeys.setCredit")}
            </Button>
            <Button
              size="small"
              danger
              onClick={() =>
                confirm({
                  title: t("admin.apiKeys.confirmDeleteTitle"),
                  icon: <ExclamationCircleFilled />,
                  okType: "danger",
                  onOk: () => deleteApiKeyMutation.mutate(record.id),
                })
              }
            >
              {t("admin.delete")}
            </Button>
          </Space>
        ),
      },
    ],
    [t, confirm, deleteApiKeyMutation],
  );

  return (
    <Spin spinning={apiKeysQuery.isLoading}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
        <Space>
          <span className="text-sm text-slate-600 dark:text-slate-300">{t("admin.labels.userId")}</span>
          <InputNumber
            value={apiKeysUserId}
            min={1}
            onChange={(v) => {
              const nextUserId = v ?? undefined;
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (nextUserId == null) next.delete("apiKeysUserId");
                  else next.set("apiKeysUserId", String(nextUserId));
                  next.set("apiKeysPage", "0");
                  return next;
                },
                { replace: true },
              );
            }}
          />
        </Space>
        <Space>
          <Button onClick={() => setCreateOpen(true)} type="primary">
            {t("admin.apiKeys.createForUser")}
          </Button>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminApiKeys"] })}>
            {t("admin.refresh")}
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={apiKeysQuery.data?.content ?? []}
        pagination={{
          current: apiKeysPage + 1,
          pageSize: apiKeysSize,
          total: apiKeysQuery.data?.totalElements,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (p, ps) => {
            const nextPage = p - 1;
            const nextSize = ps ?? apiKeysSize;
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.set("apiKeysPage", String(nextPage));
                next.set("apiKeysSize", String(nextSize));
                return next;
              },
              { replace: true },
            );
          },
        }}
      />

      <Modal
        open={setCreditOpen}
        title={t("admin.apiKeys.modalCreditTitle")}
        onCancel={() => setSetCreditOpen(false)}
        onOk={() => {
          if (setCreditTargetId == null) return;
          updateCreditMutation.mutate({
            id: setCreditTargetId,
            credit: setCreditValue,
          });
          setSetCreditOpen(false);
        }}
        confirmLoading={updateCreditMutation.isPending}
      >
        <div className="space-y-2">
          <div className="text-sm text-slate-600">
            {t("admin.labels.apiKeyRowId")} {setCreditTargetId}
          </div>
          <InputNumber
            value={setCreditValue}
            onChange={(v) => setSetCreditValue(v ?? 0)}
            style={{ width: "100%" }}
            min={0}
          />
        </div>
      </Modal>

      <Modal open={createOpen} title={t("admin.apiKeys.createModalTitle")} onCancel={() => setCreateOpen(false)} footer={null}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <InputNumber
            placeholder={t("admin.placeholders.userId")}
            value={createUserId ?? undefined}
            onChange={(v) => setCreateUserId(v ?? null)}
            style={{ width: "100%" }}
          />
          <Input
            placeholder={t("admin.placeholders.apiKeyGemini")}
            value={createApiKeyValue}
            onChange={(e) => setCreateApiKeyValue(e.target.value)}
          />
          <Button
            type="primary"
            loading={createApiKeyMutation.isPending}
            onClick={() => {
              if (createUserId == null || !createApiKeyValue.trim()) return;
              createApiKeyMutation.mutate(
                { userId: createUserId, apiKey: createApiKeyValue.trim() },
                {
                  onSuccess: () => {
                    setCreateOpen(false);
                    setCreateUserId(null);
                    setCreateApiKeyValue("");
                  },
                },
              );
            }}
          >
            {t("admin.create")}
          </Button>
        </Space>
      </Modal>
    </Spin>
  );
};

export default React.memo(ApiKeysTab);
