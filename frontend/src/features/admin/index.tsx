import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExclamationCircleFilled } from "@ant-design/icons";

import { maskApiKey } from "@/entities/apiKey/schema";
import type { Paragraph } from "@/entities/paragraph/schema";
import type { ParagraphSentence } from "@/entities/paragraphSentence/schema";
import type { UserPractice } from "@/entities/userPractice/schema";
import type { User } from "@/entities/users/schema";

import {
  TOPIC_GROUPS,
  LEVELS,
  TONES,
  SENTENCE_COUNTS,
  PRACTICE_TYPES,
} from "@/features/practice/constants";
import type { PracticeSetupInput } from "@/features/practice/schema";
import { useTranslation } from "react-i18next";

import {
  adminCreateApiKey,
  adminCreateParagraph,
  adminDeleteApiKey,
  adminDeleteParagraph,
  adminDeleteParagraphSentence,
  adminGenerateParagraphSentenceHints,
  adminListApiKeys,
  adminListCreditTransactions,
  adminListParagraphs,
  adminListParagraphSentencesByParagraphId,
  adminListRoles,
  adminListUserPractices,
  adminListUsers,
  adminUpdateApiKeyCredit,
  adminUpdateUser,
  adminDeleteUser,
} from "./api";

const { TabPane } = Tabs;
const { confirm } = Modal;

const ROLE_ADMIN = "ADMIN";

const Admin = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [usersPage, setUsersPage] = useState(0);
  const [usersSize, setUsersSize] = useState(10);

  const [apiKeysPage, setApiKeysPage] = useState(0);
  const [apiKeysSize, setApiKeysSize] = useState(10);
  const [apiKeysUserId, setApiKeysUserId] = useState<number | undefined>(undefined);

  const [paragraphsPage, setParagraphsPage] = useState(0);
  const [paragraphsSize, setParagraphsSize] = useState(10);

  const [userPracticesPage, setUserPracticesPage] = useState(0);
  const [userPracticesSize, setUserPracticesSize] = useState(10);
  const [userPracticesUserId, setUserPracticesUserId] = useState<number | undefined>(undefined);
  const [userPracticesSearch, setUserPracticesSearch] = useState("");
  const [userPracticesSort, setUserPracticesSort] = useState<"asc" | "desc">("desc");

  const [creditTxPage, setCreditTxPage] = useState(0);
  const [creditTxSize, setCreditTxSize] = useState(10);
  const [creditTxUserId, setCreditTxUserId] = useState<number | undefined>(undefined);

  const [paragraphSentencesParagraphId, setParagraphSentencesParagraphId] = useState<number | undefined>(
    undefined,
  );

  // ===== Users =====
  const usersQuery = useQuery({
    queryKey: ["adminUsers", usersPage, usersSize],
    queryFn: () => adminListUsers(usersPage, usersSize),
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload: { id: number; roleNames: string[] }) =>
      adminUpdateUser(payload.id, { roleNames: payload.roleNames }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => adminDeleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  // ===== API Keys =====
  const apiKeysQuery = useQuery({
    queryKey: ["adminApiKeys", apiKeysPage, apiKeysSize, apiKeysUserId],
    queryFn: () => adminListApiKeys({ userId: apiKeysUserId, page: apiKeysPage, size: apiKeysSize }),
  });

  const updateApiKeyCreditMutation = useMutation({
    mutationFn: (payload: { id: number; credit: number }) =>
      adminUpdateApiKeyCredit(payload.id, { credit: payload.credit }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminApiKeys", apiKeysPage, apiKeysSize, apiKeysUserId] }),
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (id: number) => adminDeleteApiKey(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminApiKeys", apiKeysPage, apiKeysSize, apiKeysUserId] }),
  });

  // ===== Paragraphs =====
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

  // ===== User Practices =====
  const userPracticesQuery = useQuery({
    queryKey: [
      "adminUserPractices",
      userPracticesUserId,
      userPracticesPage,
      userPracticesSize,
      userPracticesSort,
      userPracticesSearch,
    ],
    enabled: !!userPracticesUserId,
    queryFn: () =>
      adminListUserPractices({
        userId: userPracticesUserId!,
        page: userPracticesPage,
        size: userPracticesSize,
        sort: userPracticesSort,
        search: userPracticesSearch || undefined,
      }),
  });

  // ===== Credit Transactions =====
  const creditTxQuery = useQuery({
    queryKey: ["adminCreditTx", creditTxUserId, creditTxPage, creditTxSize],
    queryFn: () =>
      adminListCreditTransactions({
        userId: creditTxUserId,
        page: creditTxPage,
        size: creditTxSize,
      }),
  });

  // ===== Roles =====
  const rolesQuery = useQuery({
    queryKey: ["adminRoles"],
    queryFn: () => adminListRoles(),
  });

  // ===== Paragraph Sentences =====
  const paragraphSentencesQuery = useQuery({
    queryKey: ["adminParagraphSentences", paragraphSentencesParagraphId],
    enabled: !!paragraphSentencesParagraphId,
    queryFn: () =>
      adminListParagraphSentencesByParagraphId(paragraphSentencesParagraphId!),
  });

  const generateHintsMutation = useMutation({
    mutationFn: (sentenceId: number) => adminGenerateParagraphSentenceHints(sentenceId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["adminParagraphSentences", paragraphSentencesParagraphId],
      }),
  });

  const deleteSentenceMutation = useMutation({
    mutationFn: (sentenceId: number) => adminDeleteParagraphSentence(sentenceId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["adminParagraphSentences", paragraphSentencesParagraphId],
      }),
  });

  // ===== Modals / local state =====
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyModalTargetId, setApiKeyModalTargetId] = useState<number | null>(null);
  const [apiKeyModalCredit, setApiKeyModalCredit] = useState<number>(0);

  const [createApiKeyModalOpen, setCreateApiKeyModalOpen] = useState(false);
  const [createApiKeyUserId, setCreateApiKeyUserId] = useState<number | null>(null);
  const [createApiKeyValue, setCreateApiKeyValue] = useState("");

  const [createParagraphModalOpen, setCreateParagraphModalOpen] = useState(false);
  const [createParagraphPayload, setCreateParagraphPayload] = useState<PracticeSetupInput>({
    type: "DIARIES" as any,
    topic: "LIFE" as any,
    level: "A2" as any,
    tone: "FORMAL" as any,
    sentenceCount: "TEN" as any,
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

  const makeRoleTag = useCallback((user: User) => {
    const roles = user.roles ?? [];
    return (
      <Space wrap>
        {roles.map((r) => (
          <Tag key={r.name} color={r.name === ROLE_ADMIN ? "blue" : undefined}>
            {r.name}
          </Tag>
        ))}
      </Space>
    );
  }, []);

  const userColumns: ColumnsType<User> = useMemo(
    () => [
      { title: t("admin.columns.id"), dataIndex: "id", key: "id", width: 70 },
      { title: t("admin.columns.username"), dataIndex: "username", key: "username" },
      { title: t("admin.columns.fullName"), dataIndex: "fullName", key: "fullName" },
      {
        title: t("admin.columns.roles"),
        dataIndex: "roles",
        key: "roles",
        render: (_, record) => makeRoleTag(record),
      },
      {
        title: t("admin.columns.actions"),
        key: "actions",
        width: 260,
        render: (_, record) => {
          const roleNames = new Set((record.roles ?? []).map((r) => r.name));
          const isAdmin = roleNames.has(ROLE_ADMIN);
          return (
            <Space>
              <Button
                size="small"
                type={isAdmin ? "default" : "primary"}
                onClick={() => updateUserMutation.mutate({ id: record.id, roleNames: [ROLE_ADMIN] })}
                loading={
                  updateUserMutation.isPending && (updateUserMutation.variables as { id?: number })?.id === record.id
                }
              >
                {isAdmin ? t("admin.users.badgeAdmin") : t("admin.users.makeAdmin")}
              </Button>
              <Button
                size="small"
                onClick={() => updateUserMutation.mutate({ id: record.id, roleNames: ["USER"] })}
                loading={
                  updateUserMutation.isPending && (updateUserMutation.variables as { id?: number })?.id === record.id
                }
              >
                {t("admin.users.makeUser")}
              </Button>
              <Button
                size="small"
                danger
                onClick={() =>
                  confirm({
                    title: t("admin.users.confirmDeleteTitle"),
                    icon: <ExclamationCircleFilled />,
                    content: t("admin.users.confirmDeleteContent", { username: record.username }),
                    okType: "danger",
                    onOk: () => deleteUserMutation.mutate(record.id),
                  })
                }
                loading={deleteUserMutation.isPending}
              >
                {t("admin.delete")}
              </Button>
            </Space>
          );
        },
      },
    ],
    [t, makeRoleTag, updateUserMutation, deleteUserMutation],
  );

  type ApiKeyRow = {
    id: number;
    apiKey: string;
    model: string;
    credit: number;
    isActive: boolean;
    createdAt: string | null;
    userId: number | null;
    username: string | null;
  };

  const apiKeysColumns: ColumnsType<ApiKeyRow> = useMemo(
    () => [
      { title: t("admin.columns.id"), dataIndex: "id", key: "id", width: 80 },
      {
        title: t("admin.columns.user"),
        key: "user",
        width: 160,
        render: (_, r) => (r.username ? `${r.username} (#${r.userId})` : `#${r.userId}`),
      },
      { title: t("admin.columns.model"), dataIndex: "model", key: "model", width: 140 },
      { title: t("admin.columns.apiKey"), dataIndex: "apiKey", key: "apiKey", render: (v) => maskApiKey(v as string) },
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
                setApiKeyModalTargetId(record.id);
                setApiKeyModalCredit(record.credit);
                setApiKeyModalOpen(true);
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
    [t, deleteApiKeyMutation],
  );

  const paragraphColumns: ColumnsType<Paragraph> = useMemo(
    () => [
      { title: t("admin.columns.id"), dataIndex: "id", key: "id", width: 80 },
      { title: t("admin.columns.title"), dataIndex: "title", key: "title", width: 220 },
      { title: t("admin.columns.type"), dataIndex: "type", key: "type", width: 140 },
      { title: t("admin.columns.topic"), dataIndex: "topic", key: "topic", width: 160 },
      { title: t("admin.columns.level"), dataIndex: "level", key: "level", width: 120 },
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
        width: 200,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              danger
              onClick={() =>
                confirm({
                  title: t("admin.paragraphs.confirmDeleteTitle"),
                  icon: <ExclamationCircleFilled />,
                  okType: "danger",
                  onOk: () => deleteParagraphMutation.mutate(record.id),
                })
              }
              loading={deleteParagraphMutation.isPending}
            >
              {t("admin.delete")}
            </Button>
          </Space>
        ),
      },
    ],
    [t, deleteParagraphMutation],
  );

  const userPracticeColumns: ColumnsType<UserPractice> = useMemo(
    () => [
      { title: t("admin.columns.practiceId"), dataIndex: "id", key: "id", width: 110 },
      { title: t("admin.columns.attempt"), dataIndex: "attemptNumber", key: "attemptNumber", width: 90 },
      { title: t("admin.columns.type"), dataIndex: ["paragraph", "type"], key: "type", width: 110 },
      { title: t("admin.columns.topic"), dataIndex: ["paragraph", "topic"], key: "topic", width: 150 },
      { title: t("admin.columns.level"), dataIndex: ["paragraph", "level"], key: "level", width: 110 },
      { title: t("admin.columns.score"), dataIndex: "score", key: "score", width: 100 },
      { title: t("admin.columns.learningTimeMs"), dataIndex: "learningTime", key: "learningTime", width: 150 },
      { title: t("admin.columns.created"), dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
    ],
    [t],
  );

  const creditTxColumns: ColumnsType<Record<string, unknown>> = useMemo(
    () => [
      { title: t("admin.columns.id"), dataIndex: "id", key: "id", width: 80 },
      {
        title: t("admin.columns.user"),
        key: "user",
        render: (_, r) => {
          const row = r as { username?: string; userId?: number };
          return row.username ? `${row.username} (#${row.userId})` : `#${row.userId}`;
        },
      },
      { title: t("admin.columns.amount"), dataIndex: "amount", key: "amount", width: 110 },
      { title: t("admin.columns.type"), dataIndex: "type", key: "type", width: 140 },
      { title: t("admin.columns.status"), dataIndex: "status", key: "status", width: 130 },
      { title: t("admin.columns.reference"), dataIndex: "referenceId", key: "referenceId", render: (v) => v ?? "-" },
      { title: t("admin.columns.created"), dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
    ],
    [t],
  );

  const rolesColumns: ColumnsType<Record<string, unknown>> = useMemo(
    () => [
      { title: t("admin.columns.role"), dataIndex: "name", key: "name" },
      { title: t("admin.columns.description"), dataIndex: "description", key: "description" },
      {
        title: t("admin.columns.permissions"),
        key: "permissions",
        dataIndex: "permissions",
        render: (perms: unknown) =>
          Array.isArray(perms) && perms.length
            ? (perms as { name: string }[]).map((p) => p.name).join(", ")
            : "-",
      },
    ],
    [t],
  );

  const paragraphSentencesColumns: ColumnsType<ParagraphSentence> = useMemo(
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
            <Tag color={count ? "blue" : "default"}>
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
              onClick={() =>
                confirm({
                  title: t("admin.paragraphSentences.confirmGenerateHints"),
                  icon: <ExclamationCircleFilled />,
                  okType: "primary",
                  onOk: () => generateHintsMutation.mutate(record.id),
                })
              }
              loading={generateHintsMutation.isPending}
            >
              {t("admin.paragraphSentences.generate")}
            </Button>
            <Button
              size="small"
              danger
              onClick={() =>
                confirm({
                  title: t("admin.paragraphSentences.confirmDeleteSentence"),
                  icon: <ExclamationCircleFilled />,
                  okType: "danger",
                  onOk: () => deleteSentenceMutation.mutate(record.id),
                })
              }
              loading={deleteSentenceMutation.isPending}
            >
              {t("admin.delete")}
            </Button>
          </Space>
        ),
      },
    ],
    [t, generateHintsMutation, deleteSentenceMutation],
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pb-8 dark:text-slate-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("admin.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("admin.subtitle")}
          </p>
        </div>
      </div>

      <Tabs defaultActiveKey="users">
        <TabPane tab={t("admin.tabUsers")} key="users">
          <Spin spinning={usersQuery.isLoading}>
            <div className="flex items-center gap-3 mb-3">
              <Button
                type="primary"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["adminUsers"] })}
              >
                {t("admin.refresh")}
              </Button>
            </div>
            <Table<User>
              rowKey="id"
              columns={userColumns}
              dataSource={usersQuery.data?.content ?? []}
              pagination={{
                current: (usersQuery.data?.number ?? usersPage) + 1,
                pageSize: usersQuery.data?.size ?? usersSize,
                total: usersQuery.data?.totalElements,
                onChange: (p, ps) => {
                  setUsersPage(p - 1);
                  setUsersSize(ps ?? usersSize);
                },
              }}
            />
          </Spin>
        </TabPane>

        <TabPane tab={t("admin.tabApiKeys")} key="api-keys">
          <Spin spinning={apiKeysQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">{t("admin.labels.userId")}</span>
                <InputNumber value={apiKeysUserId} onChange={(v) => setApiKeysUserId(v ?? undefined)} />
              </Space>
              <Space>
                <Button onClick={() => setCreateApiKeyModalOpen(true)} type="primary">
                  {t("admin.apiKeys.createForUser")}
                </Button>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["adminApiKeys"] })}
                >
                  {t("admin.refresh")}
                </Button>
              </Space>
            </div>

            <Table
              rowKey="id"
              columns={apiKeysColumns}
              dataSource={apiKeysQuery.data?.content ?? []}
              pagination={{
                current: (apiKeysQuery.data?.number ?? apiKeysPage) + 1,
                pageSize: apiKeysQuery.data?.size ?? apiKeysSize,
                total: apiKeysQuery.data?.totalElements,
                onChange: (p, ps) => {
                  setApiKeysPage(p - 1);
                  setApiKeysSize(ps ?? apiKeysSize);
                },
              }}
            />
          </Spin>
        </TabPane>

        <TabPane tab={t("admin.tabParagraphs")} key="paragraphs">
          <Spin spinning={paragraphsQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <Button type="primary" onClick={() => setCreateParagraphModalOpen(true)}>
                  {t("admin.paragraphs.createButton")}
                </Button>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] })}>
                  {t("admin.refresh")}
                </Button>
              </Space>
            </div>

            <Table<Paragraph>
              rowKey="id"
              columns={paragraphColumns}
              dataSource={paragraphsQuery.data?.content ?? []}
              pagination={{
                current: (paragraphsQuery.data?.number ?? paragraphsPage) + 1,
                pageSize: paragraphsQuery.data?.size ?? paragraphsSize,
                total: paragraphsQuery.data?.totalElements,
                onChange: (p, ps) => {
                  setParagraphsPage(p - 1);
                  setParagraphsSize(ps ?? paragraphsSize);
                },
              }}
            />
          </Spin>
        </TabPane>

        <TabPane tab={t("admin.tabUserPractices")} key="user-practices">
          <Spin spinning={userPracticesQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">{t("admin.labels.userId")}</span>
                <InputNumber
                  value={userPracticesUserId}
                  onChange={(v) => {
                    setUserPracticesUserId(v ?? undefined);
                    setUserPracticesPage(0);
                  }}
                />
              </Space>
              <Space>
                <Select value={userPracticesSort} onChange={(v) => setUserPracticesSort(v)}>
                  <Select.Option value="desc">{t("admin.sort.latest")}</Select.Option>
                  <Select.Option value="asc">{t("admin.sort.oldest")}</Select.Option>
                </Select>
                <Input
                  placeholder={t("admin.placeholders.searchOptional")}
                  value={userPracticesSearch}
                  onChange={(e) => setUserPracticesSearch(e.target.value)}
                  style={{ width: 220 }}
                />
              </Space>
            </div>

            <Table<UserPractice>
              rowKey="id"
              columns={userPracticeColumns}
              dataSource={userPracticesQuery.data?.content ?? []}
              pagination={{
                current: (userPracticesQuery.data?.number ?? userPracticesPage) + 1,
                pageSize: userPracticesQuery.data?.size ?? userPracticesSize,
                total: userPracticesQuery.data?.totalElements,
                onChange: (p, ps) => {
                  setUserPracticesPage(p - 1);
                  setUserPracticesSize(ps ?? userPracticesSize);
                },
              }}
            />
          </Spin>
        </TabPane>

        <TabPane tab={t("admin.tabCreditTx")} key="credit-transactions">
          <Spin spinning={creditTxQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">{t("admin.labels.userId")}</span>
                <InputNumber value={creditTxUserId} onChange={(v) => setCreditTxUserId(v ?? undefined)} />
              </Space>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["adminCreditTx"] })}
              >
                {t("admin.refresh")}
              </Button>
            </div>

            <Table
              rowKey="id"
              columns={creditTxColumns}
              dataSource={creditTxQuery.data?.content ?? []}
              pagination={{
                current: (creditTxQuery.data?.number ?? creditTxPage) + 1,
                pageSize: creditTxQuery.data?.size ?? creditTxSize,
                total: creditTxQuery.data?.totalElements,
                onChange: (p, ps) => {
                  setCreditTxPage(p - 1);
                  setCreditTxSize(ps ?? creditTxSize);
                },
              }}
            />
          </Spin>
        </TabPane>

        <TabPane tab={t("admin.tabRoles")} key="roles">
          <Spin spinning={rolesQuery.isLoading}>
            <Table
              rowKey="name"
              columns={rolesColumns}
              dataSource={rolesQuery.data ?? []}
              pagination={false}
            />
          </Spin>
        </TabPane>

        <TabPane tab={t("admin.tabParagraphSentences")} key="paragraph-sentences">
          <Spin spinning={paragraphSentencesQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">{t("admin.labels.paragraphId")}</span>
                <InputNumber
                  value={paragraphSentencesParagraphId}
                  onChange={(v) => {
                    setParagraphSentencesParagraphId(v ?? undefined);
                  }}
                />
              </Space>
              <Button
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["adminParagraphSentences", paragraphSentencesParagraphId],
                  })
                }
              >
                {t("admin.refresh")}
              </Button>
            </div>

            <Table<ParagraphSentence>
              rowKey="id"
              columns={paragraphSentencesColumns}
              dataSource={paragraphSentencesQuery.data ?? []}
              pagination={false}
            />
          </Spin>
        </TabPane>
      </Tabs>

      {/* Set credit modal */}
      <Modal
        open={apiKeyModalOpen}
        title={t("admin.apiKeys.modalCreditTitle")}
        onCancel={() => setApiKeyModalOpen(false)}
        onOk={() => {
          if (apiKeyModalTargetId == null) return;
          updateApiKeyCreditMutation.mutate({
            id: apiKeyModalTargetId,
            credit: apiKeyModalCredit,
          });
          setApiKeyModalOpen(false);
        }}
        confirmLoading={updateApiKeyCreditMutation.isPending}
      >
        <div className="space-y-2">
          <div className="text-sm text-slate-600">
            {t("admin.labels.apiKeyRowId")} {apiKeyModalTargetId}
          </div>
          <InputNumber
            value={apiKeyModalCredit}
            onChange={(v) => setApiKeyModalCredit(v ?? 0)}
            style={{ width: "100%" }}
            min={0}
          />
        </div>
      </Modal>

      {/* Create API key for user */}
      <Modal
        open={createApiKeyModalOpen}
        title={t("admin.apiKeys.createModalTitle")}
        onCancel={() => setCreateApiKeyModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <InputNumber
            placeholder={t("admin.placeholders.userId")}
            value={createApiKeyUserId ?? undefined}
            onChange={(v) => setCreateApiKeyUserId(v ?? null)}
            style={{ width: "100%" }}
          />
          <Input
            placeholder={t("admin.placeholders.apiKeyGemini")}
            value={createApiKeyValue}
            onChange={(e) => setCreateApiKeyValue(e.target.value)}
          />
          <Button
            type="primary"
            onClick={() => {
              if (createApiKeyUserId == null || !createApiKeyValue.trim()) return;
              adminCreateApiKey({ userId: createApiKeyUserId, apiKey: createApiKeyValue.trim() })
                .then(() => {
                  setCreateApiKeyModalOpen(false);
                  setCreateApiKeyValue("");
                  queryClient.invalidateQueries({ queryKey: ["adminApiKeys"] });
                })
                .catch(() => {});
            }}
          >
            {t("admin.create")}
          </Button>
        </Space>
      </Modal>

      {/* Create paragraph modal */}
      <Modal
        open={createParagraphModalOpen}
        title={t("admin.paragraphs.createModalTitle")}
        onCancel={() => setCreateParagraphModalOpen(false)}
        onOk={() => {
          createParagraphMutation.mutate(createParagraphPayload, {
            onSuccess: () => setCreateParagraphModalOpen(false),
          });
        }}
        confirmLoading={createParagraphMutation.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Select
            value={createParagraphPayload.type}
            onChange={(v) => setCreateParagraphPayload((p) => ({ ...p, type: v as any }))}
            style={{ width: "100%" }}
            options={PRACTICE_TYPES.map((x) => ({
              value: x.value,
              label: t(`practice.type.${x.value}`),
            }))}
          />
          <Select
            value={createParagraphPayload.tone}
            onChange={(v) => setCreateParagraphPayload((p) => ({ ...p, tone: v as any }))}
            style={{ width: "100%" }}
            options={TONES.map((x) => ({
              value: x.value,
              label: t(`practice.tone.${x.value}`),
            }))}
          />
          <Select
            value={createParagraphPayload.topic}
            onChange={(v) => setCreateParagraphPayload((p) => ({ ...p, topic: v as any }))}
            style={{ width: "100%" }}
            options={topicOptions}
          />
          <Select
            value={createParagraphPayload.level}
            onChange={(v) => setCreateParagraphPayload((p) => ({ ...p, level: v as any }))}
            style={{ width: "100%" }}
            options={LEVELS.map((l) => ({
              value: l.value,
              label: t(`practice.level.${l.value}`),
            }))}
          />
          <Select
            value={createParagraphPayload.sentenceCount}
            onChange={(v) => setCreateParagraphPayload((p) => ({ ...p, sentenceCount: v as any }))}
            style={{ width: "100%" }}
            options={SENTENCE_COUNTS.map((c) => ({
              value: c.value,
              label: t(`practice.sentenceCount.${c.value}`),
            }))}
          />
        </Space>
      </Modal>
    </div>
  );
};

export { Admin as LegacyAdmin };
export { default } from "./AdminPage";

