import { Outlet } from "react-router-dom";
import PageContainer from "./PageContainer";

export default function Layout({ header, footer }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4F0] font-sans text-[#111111]">
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
