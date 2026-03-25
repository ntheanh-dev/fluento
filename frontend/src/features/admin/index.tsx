import { useMemo, useState } from "react";
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

  const makeRoleTag = (user: User) => {
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
  };

  // ===== Columns =====
  const userColumns: ColumnsType<User> = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Full name", dataIndex: "fullName", key: "fullName" },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (_, record) => makeRoleTag(record),
    },
    {
      title: "Actions",
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
              onClick={() =>
                updateUserMutation.mutate({ id: record.id, roleNames: [ROLE_ADMIN] })
              }
              loading={
                updateUserMutation.isPending &&
                (updateUserMutation.variables as any)?.id === record.id
              }
            >
              {isAdmin ? "ADMIN" : "Make ADMIN"}
            </Button>
            <Button
              size="small"
              onClick={() =>
                updateUserMutation.mutate({ id: record.id, roleNames: ["USER"] })
              }
              loading={
                updateUserMutation.isPending &&
                (updateUserMutation.variables as any)?.id === record.id
              }
            >
              Make USER
            </Button>
            <Button
              size="small"
              danger
              onClick={() =>
                confirm({
                  title: "Delete user?",
                  icon: <ExclamationCircleFilled />,
                  content: `User: ${record.username}`,
                  okType: "danger",
                  onOk: () => deleteUserMutation.mutate(record.id),
                })
              }
              loading={deleteUserMutation.isPending}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  const apiKeysColumns: ColumnsType<{
    id: number;
    apiKey: string;
    model: string;
    credit: number;
    isActive: boolean;
    createdAt: string | null;
    userId: number | null;
    username: string | null;
  }> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "User", key: "user", width: 160, render: (_, r) => (r.username ? `${r.username} (#${r.userId})` : `#${r.userId}`) },
    { title: "Model", dataIndex: "model", key: "model", width: 140 },
    { title: "API Key", dataIndex: "apiKey", key: "apiKey", render: (v) => maskApiKey(v as any) },
    { title: "Credit", dataIndex: "credit", key: "credit", width: 100 },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 90,
      render: (v) => (v ? <Tag color="green">ACTIVE</Tag> : <Tag color="red">INACTIVE</Tag>),
    },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
    {
      title: "Actions",
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
            Set Credit
          </Button>
          <Button
            size="small"
            danger
            onClick={() =>
              confirm({
                title: "Delete API key group?",
                icon: <ExclamationCircleFilled />,
                okType: "danger",
                onOk: () => deleteApiKeyMutation.mutate(record.id),
              })
            }
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const paragraphColumns: ColumnsType<Paragraph> = [
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            danger
            onClick={() =>
              confirm({
                title: "Delete paragraph?",
                icon: <ExclamationCircleFilled />,
                okType: "danger",
                onOk: () => deleteParagraphMutation.mutate(record.id),
              })
            }
            loading={deleteParagraphMutation.isPending}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const userPracticeColumns: ColumnsType<UserPractice> = [
    { title: "Practice ID", dataIndex: "id", key: "id", width: 110 },
    { title: "Attempt", dataIndex: "attemptNumber", key: "attemptNumber", width: 90 },
    { title: "Type", dataIndex: ["paragraph", "type"], key: "type", width: 110 },
    { title: "Topic", dataIndex: ["paragraph", "topic"], key: "topic", width: 150 },
    { title: "Level", dataIndex: ["paragraph", "level"], key: "level", width: 110 },
    { title: "Score", dataIndex: "score", key: "score", width: 100 },
    { title: "Learning time (ms)", dataIndex: "learningTime", key: "learningTime", width: 150 },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
  ];

  const creditTxColumns: ColumnsType<any> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "User", key: "user", render: (_, r) => (r.username ? `${r.username} (#${r.userId})` : `#${r.userId}`) },
    { title: "Amount", dataIndex: "amount", key: "amount", width: 110 },
    { title: "Type", dataIndex: "type", key: "type", width: 140 },
    { title: "Status", dataIndex: "status", key: "status", width: 130 },
    { title: "Reference", dataIndex: "referenceId", key: "referenceId", render: (v) => v ?? "-" },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
  ];

  const rolesColumns: ColumnsType<any> = [
    { title: "Role", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Permissions",
      key: "permissions",
      dataIndex: "permissions",
      render: (perms) => (perms?.length ? perms.map((p: any) => p.name).join(", ") : "-"),
    },
  ];

  const paragraphSentencesColumns: ColumnsType<ParagraphSentence> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Order", dataIndex: "orderIndex", key: "orderIndex", width: 90 },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (v) => (v ? String(v).slice(0, 60) + (String(v).length > 60 ? "..." : "") : "-"),
    },
    {
      title: "Hints",
      key: "hints",
      render: (_, r) => {
        const count = r.vocabularyHints?.length ?? 0;
        return <Tag color={count ? "blue" : "default"}>{count ? `${count} items` : "none"}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 240,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() =>
              confirm({
                title: "Generate vocabulary hints (AI)?",
                icon: <ExclamationCircleFilled />,
                okType: "primary",
                onOk: () => generateHintsMutation.mutate(record.id),
              })
            }
            loading={generateHintsMutation.isPending}
          >
            Generate
          </Button>
          <Button
            size="small"
            danger
            onClick={() =>
              confirm({
                title: "Delete sentence?",
                icon: <ExclamationCircleFilled />,
                okType: "danger",
                onOk: () => deleteSentenceMutation.mutate(record.id),
              })
            }
            loading={deleteSentenceMutation.isPending}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pb-8 dark:text-slate-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Admin Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý users, API keys, paragraphs, user practices, credit transactions và hints.
          </p>
        </div>
      </div>

      <Tabs defaultActiveKey="users">
        <TabPane tab="Users" key="users">
          <Spin spinning={usersQuery.isLoading}>
            <div className="flex items-center gap-3 mb-3">
              <Button
                type="primary"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["adminUsers"] })}
              >
                Refresh
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

        <TabPane tab="API Keys" key="api-keys">
          <Spin spinning={apiKeysQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">User ID:</span>
                <InputNumber value={apiKeysUserId} onChange={(v) => setApiKeysUserId(v ?? undefined)} />
              </Space>
              <Space>
                <Button onClick={() => setCreateApiKeyModalOpen(true)} type="primary">
                  Create for user
                </Button>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["adminApiKeys"] })}
                >
                  Refresh
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

        <TabPane tab="Paragraphs" key="paragraphs">
          <Spin spinning={paragraphsQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <Button type="primary" onClick={() => setCreateParagraphModalOpen(true)}>
                  Create paragraph
                </Button>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminParagraphs"] })}>
                  Refresh
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

        <TabPane tab="User Practices" key="user-practices">
          <Spin spinning={userPracticesQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">User ID:</span>
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
                  <Select.Option value="desc">Latest</Select.Option>
                  <Select.Option value="asc">Oldest</Select.Option>
                </Select>
                <Input
                  placeholder="Search (optional)"
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

        <TabPane tab="Credit Transactions" key="credit-transactions">
          <Spin spinning={creditTxQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">User ID:</span>
                <InputNumber value={creditTxUserId} onChange={(v) => setCreditTxUserId(v ?? undefined)} />
              </Space>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["adminCreditTx"] })}
              >
                Refresh
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

        <TabPane tab="Roles" key="roles">
          <Spin spinning={rolesQuery.isLoading}>
            <Table
              rowKey="name"
              columns={rolesColumns}
              dataSource={rolesQuery.data ?? []}
              pagination={false}
            />
          </Spin>
        </TabPane>

        <TabPane tab="Paragraph Sentences" key="paragraph-sentences">
          <Spin spinning={paragraphSentencesQuery.isLoading}>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
              <Space>
                <span className="text-sm text-slate-600 dark:text-slate-300">Paragraph ID:</span>
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
                Refresh
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
        title="Set API key credit"
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
          <div className="text-sm text-slate-600">API key row ID: {apiKeyModalTargetId}</div>
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
        title="Create API key for user"
        onCancel={() => setCreateApiKeyModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <InputNumber
            placeholder="User ID"
            value={createApiKeyUserId ?? undefined}
            onChange={(v) => setCreateApiKeyUserId(v ?? null)}
            style={{ width: "100%" }}
          />
          <Input
            placeholder="API key (Gemini)"
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
            Create
          </Button>
        </Space>
      </Modal>

      {/* Create paragraph modal */}
      <Modal
        open={createParagraphModalOpen}
        title="Create paragraph (AI-generated)"
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
            options={PRACTICE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <Select
            value={createParagraphPayload.tone}
            onChange={(v) => setCreateParagraphPayload((p) => ({ ...p, tone: v as any }))}
            style={{ width: "100%" }}
            options={TONES.map((t) => ({ value: t.value, label: t.label }))}
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
            options={LEVELS.map((l) => ({ value: l.value, label: l.label }))}
          />
          <Select
            value={createParagraphPayload.sentenceCount}
            onChange={(v) => setCreateParagraphPayload((p) => ({ ...p, sentenceCount: v as any }))}
            style={{ width: "100%" }}
            options={SENTENCE_COUNTS.map((c) => ({ value: c.value, label: c.label }))}
          />
        </Space>
      </Modal>
    </div>
  );
};

export { Admin as LegacyAdmin };
export { default } from "./AdminPage";

