import { FC } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  navbar?: React.ReactNode;
  footer?: React.ReactNode;
}

const PageLayout: FC<PageLayoutProps> = ({
  children,
  navbar,
  sidebar,
  footer,
}) => {
  return (
    <div className="h-screen flex flex-col">
      {navbar ? (
        <div className="sticky top-0 z-50 bg-accent-foreground">
          <Navbar />
        </div>
      ) : null}
      <div
        className="flex flex-grow"
      >
        {sidebar ? (
          <div className="hidden md:block sticky top-0 z-40 text-accent-foreground">
            <Sidebar />
          </div>
        ) : null}
        <div className="flex-grow overflow-y-auto">{children}</div>
      </div>
      {footer ? <div className="bg-background text-accent-foreground"></div> : null}
    </div>
  );
};

export default PageLayout;
