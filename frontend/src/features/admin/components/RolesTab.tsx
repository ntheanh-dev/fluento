import React, { useMemo } from "react";
import { Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import type { AdminRole } from "../api";
import { adminListRoles } from "../api";

const RolesTab = () => {
  const { t } = useTranslation();
  const rolesQuery = useQuery({
    queryKey: ["adminRoles"],
    queryFn: () => adminListRoles(),
  });

  const columns: ColumnsType<AdminRole> = useMemo(
    () => [
      { title: t("admin.columns.role"), dataIndex: "name", key: "name" },
      { title: t("admin.columns.description"), dataIndex: "description", key: "description" },
      {
        title: t("admin.columns.permissions"),
        key: "permissions",
        dataIndex: "permissions",
        render: (perms) => (perms?.length ? perms.map((p: { name: string }) => p.name).join(", ") : "-"),
      },
    ],
    [t],
  );

  return (
    <Spin spinning={rolesQuery.isLoading}>
      <Table rowKey="name" columns={columns} dataSource={rolesQuery.data ?? []} pagination={false} />
    </Spin>
  );
};

export default React.memo(RolesTab);
