import React, { useCallback, useMemo, useState } from "react";
import { Avatar, Button, InputNumber, Modal, Space, Spin, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import type { User } from "@/entities/users/schema";
import { adminDeleteUser, adminListUsers, adminUpdateUser } from "../api";

const ROLE_ADMIN = "ADMIN";
const ROLE_USER = "USER";

const UsersTab = () => {
  const queryClient = useQueryClient();
  const { confirm } = Modal;

  const [searchParams, setSearchParams] = useSearchParams();
  const usersPage = Math.max(0, parseInt(searchParams.get("usersPage") ?? "0", 10) || 0);
  const usersSize = Math.max(1, parseInt(searchParams.get("usersSize") ?? "10", 10) || 10);

  const [creditOpen, setCreditOpen] = useState(false);
  const [creditTargetId, setCreditTargetId] = useState<number | null>(null);
  const [creditValue, setCreditValue] = useState<number | null>(null);

  const usersQuery = useQuery({
    queryKey: ["adminUsers", usersPage, usersSize],
    queryFn: () => adminListUsers(usersPage, usersSize),
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload: { id: number; roleNames?: string[]; credits?: number }) =>
      adminUpdateUser(payload.id, { roleNames: payload.roleNames, credits: payload.credits }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      const id = (variables as any)?.id as number | undefined;
      const nextCredits = (variables as any)?.credits as number | undefined;
      if (id != null && id === creditTargetId && nextCredits != null) {
        setCreditOpen(false);
      }
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => adminDeleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

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

  const columns: ColumnsType<User> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 70 },
      {
        title: "Avatar",
        dataIndex: "urlAvatar",
        key: "avatar",
        width: 90,
        render: (_, record) => (
          <Avatar
            size="small"
            src={record.urlAvatar}
            alt={record.username}
            style={{ backgroundColor: "rgb(15 23 42)" }}
          >
            {(record.username?.[0] ?? "").toUpperCase()}
          </Avatar>
        ),
      },
      { title: "Username", dataIndex: "username", key: "username" },
      { title: "Full name", dataIndex: "fullName", key: "fullName" },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 170,
        render: (_, record) => {
          if (!record.createdAt) return "-";
          const d = new Date(record.createdAt);
          // If invalid date string, fallback to raw value
          if (Number.isNaN(d.getTime())) return record.createdAt;
          return (
            <Typography.Text>
              {d.toLocaleString()}
            </Typography.Text>
          );
        },
      },
      {
        title: "Roles",
        dataIndex: "roles",
        key: "roles",
        render: (_, record) => makeRoleTag(record),
      },
      {
        title: "Streak",
        key: "streak",
        width: 140,
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.currentStreak}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Credits",
        dataIndex: "credits",
        key: "credits",
        width: 120,
        render: (_, record) => (
          <Typography.Text strong>{record.credits ?? 0}</Typography.Text>
        ),
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
                onClick={() => updateUserMutation.mutate({ id: record.id, roleNames: [ROLE_USER] })}
                loading={
                  updateUserMutation.isPending &&
                  (updateUserMutation.variables as any)?.id === record.id
                }
              >
                Make USER
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setCreditTargetId(record.id);
                  setCreditValue(record.credits ?? 0);
                  setCreditOpen(true);
                }}
                loading={
                  updateUserMutation.isPending &&
                  (updateUserMutation.variables as any)?.id === record.id &&
                  (updateUserMutation.variables as any)?.credits != null
                }
              >
                Set Credits
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
    ],
    [confirm, deleteUserMutation.isPending, updateUserMutation, makeRoleTag],
  );

  return (
    <Spin spinning={usersQuery.isLoading}>
      <div className="flex items-center gap-3 mb-3">
        <Button type="primary" onClick={() => queryClient.invalidateQueries({ queryKey: ["adminUsers"] })}>
          Refresh
        </Button>
      </div>

      <Table<User>
        rowKey="id"
        columns={columns}
        dataSource={usersQuery.data?.content ?? []}
        pagination={{
          current: usersPage + 1,
          pageSize: usersSize,
          total: usersQuery.data?.totalElements,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (p, ps) => {
            const nextPage = p - 1;
            const nextSize = ps ?? usersSize;
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set("usersPage", String(nextPage));
              next.set("usersSize", String(nextSize));
              return next;
            }, { replace: true });
          },
        }}
      />

      <Modal
        open={creditOpen}
        title="Set user credits"
        onCancel={() => setCreditOpen(false)}
        onOk={() => {
          if (creditTargetId == null || creditValue == null) return;
          updateUserMutation.mutate({
            id: creditTargetId,
            credits: creditValue,
          });
        }}
        okButtonProps={{
          disabled:
            creditTargetId == null ||
            creditValue == null ||
            Number.isNaN(creditValue) ||
            creditValue < 0,
        }}
        confirmLoading={updateUserMutation.isPending}
        width={520}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Typography.Text type="secondary">
            User ID: {creditTargetId ?? "-"}
          </Typography.Text>
          <Typography.Text>Current credits: {creditValue ?? 0}</Typography.Text>
          <InputNumber
            style={{ width: "100%" }}
            value={creditValue}
            min={0}
            onChange={(v) => setCreditValue(v ?? null)}
          />
        </Space>
      </Modal>
    </Spin>
  );
};

export default React.memo(UsersTab);

