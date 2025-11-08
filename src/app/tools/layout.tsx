import "../globals.css";
import ToolSidebar from "@/components/ToolSidebar";
import SiteHeader from "@/components/SiteHeader";
import ToasterClient from "@/components/ToasterClient";

export const metadata = { title: "Media Tools" };

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/*<SiteHeader />*/}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="md:flex md:gap-6">
          <ToolSidebar />
          <div className="mt-4 md:mt-0 flex-1">{children}</div>
        </div>
      </div>
      <ToasterClient />
    </div>
  );
}
