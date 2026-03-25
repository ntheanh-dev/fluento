import React, { useMemo } from "react";
import { Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";

import type { AdminRole } from "../api";
import { adminListRoles } from "../api";

const RolesTab = () => {
  const rolesQuery = useQuery({
    queryKey: ["adminRoles"],
    queryFn: () => adminListRoles(),
  });

  const columns: ColumnsType<AdminRole> = useMemo(
    () => [
      { title: "Role", dataIndex: "name", key: "name" },
      { title: "Description", dataIndex: "description", key: "description" },
      {
        title: "Permissions",
        key: "permissions",
        dataIndex: "permissions",
        render: (perms) => (perms?.length ? perms.map((p) => p.name).join(", ") : "-"),
      },
    ],
    [],
  );

  return (
    <Spin spinning={rolesQuery.isLoading}>
      <Table
        rowKey="name"
        columns={columns}
        dataSource={rolesQuery.data ?? []}
        pagination={false}
      />
    </Spin>
  );
};

export default React.memo(RolesTab);

