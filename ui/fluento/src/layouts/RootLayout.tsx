import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import "./RootLayout.less";
import { Spin } from "antd";

function RootLayout() {
  return (
    <Suspense fallback={<Spin indicator={<LoadingOutlined spin />} />}>
      <Outlet />
    </Suspense>
  );
}

export default RootLayout;
