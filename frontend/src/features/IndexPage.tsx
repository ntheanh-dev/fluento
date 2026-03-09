import { Link, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const IndexPage = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
