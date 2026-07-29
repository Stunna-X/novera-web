import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import useWorkspace from "../hooks/useWorkspace";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isReady,
    requiresWorkspaceRename,
    hasPermission,
    accessStatus,
  } = useWorkspace();

  useEffect(() => {
    const canRename =
      accessStatus === "ready" && hasPermission("organizations.update");
    const isWorkspaceRoute =
      location.pathname === "/settings" ||
      location.pathname === "/workspace/setup";

    if (isReady && requiresWorkspaceRename && canRename && !isWorkspaceRoute) {
      navigate("/settings", {
        replace: true,
        state: { workspaceNameRequired: true },
      });
    }
  }, [
    accessStatus,
    hasPermission,
    isReady,
    location.pathname,
    navigate,
    requiresWorkspaceRename,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
