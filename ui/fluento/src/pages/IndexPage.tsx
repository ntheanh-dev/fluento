import { Link, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const IndexPage = () => (
  <div>
    <h1>Home Page</h1>
    <nav>
      <Link to="probes">Go to Home</Link>
    </nav>
    <Suspense fallback={<Spin indicator={<LoadingOutlined spin />} />}>
      <Outlet />
    </Suspense>
  </div>
);

export default IndexPage;
