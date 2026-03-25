import { Tabs } from "antd";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import UsersTab from "./components/UsersTab";
import ApiKeysTab from "./components/ApiKeysTab";
import ParagraphsTab from "./components/ParagraphsTab";
import UserPracticesTab from "./components/UserPracticesTab";
import CreditTransactionsTab from "./components/CreditTransactionsTab";
import RolesTab from "./components/RolesTab";
import ParagraphSentencesTab from "./components/ParagraphSentencesTab";

const { TabPane } = Tabs;

const TAB_QUERY_KEYS: Record<string, string[]> = {
  users: ["usersPage", "usersSize"],
  "api-keys": ["apiKeysPage", "apiKeysSize", "apiKeysUserId"],
  paragraphs: ["paragraphsPage", "paragraphsSize"],
  "user-practices": [
    "userPracticesUserId",
    "userPracticesPage",
    "userPracticesSize",
    "userPracticesSearch",
    "userPracticesSort",
  ],
  "credit-transactions": ["creditTxUserId", "creditTxPage", "creditTxSize"],
  roles: [],
  "paragraph-sentences": ["paragraphSentencesParagraphId"],
};

const AdminPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeKey = searchParams.get("tab") ?? "users";

  useEffect(() => {
    if (searchParams.get("tab")) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", "users");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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

      <Tabs
        activeKey={activeKey}
        destroyInactiveTabPane
        onChange={(nextKey) => {
          const next = new URLSearchParams();
          next.set("tab", nextKey);

          const allowList = TAB_QUERY_KEYS[nextKey] ?? [];
          for (const k of allowList) {
            const v = searchParams.get(k);
            if (v != null && v !== "") next.set(k, v);
          }

          setSearchParams(next, { replace: true });
        }}
      >
        <TabPane tab="Users" key="users">
          <UsersTab />
        </TabPane>
        <TabPane tab="API Keys" key="api-keys">
          <ApiKeysTab />
        </TabPane>
        <TabPane tab="Paragraphs" key="paragraphs">
          <ParagraphsTab />
        </TabPane>
        <TabPane tab="User Practices" key="user-practices">
          <UserPracticesTab />
        </TabPane>
        <TabPane tab="Credit Transactions" key="credit-transactions">
          <CreditTransactionsTab />
        </TabPane>
        <TabPane tab="Roles" key="roles">
          <RolesTab />
        </TabPane>
        <TabPane tab="Paragraph Sentences" key="paragraph-sentences">
          <ParagraphSentencesTab />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminPage;

