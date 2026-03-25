import React, { useMemo } from "react";
import { Button, Input, InputNumber, Select, Space, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import type { UserPractice } from "@/entities/userPractice/schema";
import { adminListUserPractices } from "../api";

type SortOrder = "asc" | "desc";

const UserPracticesTab = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const userPracticesUserIdRaw = searchParams.get("userPracticesUserId");
  const userId =
    userPracticesUserIdRaw == null ? undefined : Math.max(1, parseInt(userPracticesUserIdRaw, 10) || 0) || undefined;
  const page = Math.max(0, parseInt(searchParams.get("userPracticesPage") ?? "0", 10) || 0);
  const size = Math.max(1, parseInt(searchParams.get("userPracticesSize") ?? "10", 10) || 10);
  const search = searchParams.get("userPracticesSearch") ?? "";
  const sortRaw = searchParams.get("userPracticesSort");
  const sort: SortOrder = sortRaw === "asc" ? "asc" : "desc";

  const userPracticesQuery = useQuery({
    queryKey: ["adminUserPractices", userId, page, size, search, sort],
    queryFn: () =>
      adminListUserPractices({
        userId,
        page,
        size,
        sort,
        search: search || undefined,
      }),
  });

  const columns: ColumnsType<UserPractice> = useMemo(
    () => [
      { title: "Practice ID", dataIndex: "id", key: "id", width: 110 },
      { title: "Attempt", dataIndex: "attemptNumber", key: "attemptNumber", width: 90 },
      { title: "Type", dataIndex: ["paragraph", "type"], key: "type", width: 110 },
      { title: "Topic", dataIndex: ["paragraph", "topic"], key: "topic", width: 150 },
      { title: "Level", dataIndex: ["paragraph", "level"], key: "level", width: 110 },
      { title: "Score", dataIndex: "score", key: "score", width: 100 },
      { title: "Learning time (ms)", dataIndex: "learningTime", key: "learningTime", width: 150 },
      { title: "Created", dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
    ],
    [],
  );

  return (
    <Spin spinning={userPracticesQuery.isLoading}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
        <Space>
          <span className="text-sm text-slate-600 dark:text-slate-300">User ID:</span>
          <InputNumber
            value={userId}
            onChange={(v) => {
              const nextUserId = v ?? undefined;
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (nextUserId == null) next.delete("userPracticesUserId");
                  else next.set("userPracticesUserId", String(nextUserId));
                  next.set("userPracticesPage", "0");
                  return next;
                },
                { replace: true },
              );
            }}
            min={1}
          />
        </Space>
        <Space>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminUserPractices"] })}>
            Refresh
          </Button>
          <Select
            value={sort}
            onChange={(v) => {
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("userPracticesSort", v);
                  next.set("userPracticesPage", "0");
                  return next;
                },
                { replace: true },
              );
            }}
          >
            <Select.Option value="desc">Latest</Select.Option>
            <Select.Option value="asc">Oldest</Select.Option>
          </Select>
          <Input
            placeholder="Search (optional)"
            value={search}
            onChange={(e) => {
              const nextSearch = e.target.value;
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (!nextSearch.trim()) next.delete("userPracticesSearch");
                  else next.set("userPracticesSearch", nextSearch);
                  next.set("userPracticesPage", "0");
                  return next;
                },
                { replace: true },
              );
            }}
            style={{ width: 220 }}
          />
        </Space>
      </div>

      <Table<UserPractice>
        rowKey="id"
        columns={columns}
        dataSource={userPracticesQuery.data?.content ?? []}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: userPracticesQuery.data?.totalElements,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (p, ps) => {
            const nextPage = p - 1;
            const nextSize = ps ?? size;
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.set("userPracticesPage", String(nextPage));
                next.set("userPracticesSize", String(nextSize));
                return next;
              },
              { replace: true },
            );
          },
        }}
      />
    </Spin>
  );
};

export default React.memo(UserPracticesTab);

