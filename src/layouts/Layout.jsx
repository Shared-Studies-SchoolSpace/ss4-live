import { Outlet } from "react-router-dom";
import PageContainer from "./PageContainer";

export default function Layout({ header, footer }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      {header}
      <main className="flex-grow">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
      {footer}
    </div>
  );
}
