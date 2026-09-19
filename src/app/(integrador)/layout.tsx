import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { mockIntegratorUser } from "@/lib/mock-data";

export default function IntegradorLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar greetingName={mockIntegratorUser.name.split(" ")[0]} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
