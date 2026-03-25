import React, { useMemo } from "react";
import { Button, InputNumber, Space, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import type { AdminCreditTransaction } from "../api";
import { adminListCreditTransactions } from "../api";

const CreditTransactionsTab = () => {
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const creditTxPage = Math.max(0, parseInt(searchParams.get("creditTxPage") ?? "0", 10) || 0);
  const creditTxSize = Math.max(1, parseInt(searchParams.get("creditTxSize") ?? "10", 10) || 10);
  const creditTxUserIdRaw = searchParams.get("creditTxUserId");
  const creditTxUserId =
    creditTxUserIdRaw == null ? undefined : Math.max(1, parseInt(creditTxUserIdRaw, 10) || 0) || undefined;

  const creditTxQuery = useQuery({
    queryKey: ["adminCreditTx", creditTxUserId, creditTxPage, creditTxSize],
    queryFn: () =>
      adminListCreditTransactions({
        userId: creditTxUserId,
        page: creditTxPage,
        size: creditTxSize,
      }),
  });

  const columns: ColumnsType<AdminCreditTransaction> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      {
        title: "User",
        key: "user",
        render: (_, r) => (r.username ? `${r.username} (#${r.userId})` : `#${r.userId}`),
      },
      { title: "Amount", dataIndex: "amount", key: "amount", width: 110 },
      { title: "Type", dataIndex: "type", key: "type", width: 140 },
      { title: "Status", dataIndex: "status", key: "status", width: 130 },
      { title: "Reference", dataIndex: "referenceId", key: "referenceId", render: (v) => v ?? "-" },
      { title: "Created", dataIndex: "createdAt", key: "createdAt", render: (v) => v ?? "-" },
    ],
    [],
  );

  return (
    <Spin spinning={creditTxQuery.isLoading}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between mb-3">
        <Space>
          <span className="text-sm text-slate-600 dark:text-slate-300">User ID:</span>
          <InputNumber
            value={creditTxUserId}
            onChange={(v) => {
              const nextUserId = v ?? undefined;
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (nextUserId == null) next.delete("creditTxUserId");
                  else next.set("creditTxUserId", String(nextUserId));
                  next.set("creditTxPage", "0");
                  return next;
                },
                { replace: true },
              );
            }}
          />
        </Space>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminCreditTx"] })}>Refresh</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={creditTxQuery.data?.content ?? []}
        pagination={{
          current: creditTxPage + 1,
          pageSize: creditTxSize,
          total: creditTxQuery.data?.totalElements,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (p, ps) => {
            const nextPage = p - 1;
            const nextSize = ps ?? creditTxSize;
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.set("creditTxPage", String(nextPage));
                next.set("creditTxSize", String(nextSize));
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

export default React.memo(CreditTransactionsTab);

