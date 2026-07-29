import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import useAuth from "../../hooks/useAuth";

function getTitle(pathname) {
  if (pathname.startsWith("/jobs/") && pathname.endsWith("/edit")) {
    return "Edit job";
  }

  if (pathname === "/jobs/new") {
    return "Create job";
  }

  if (pathname.startsWith("/jobs/")) {
    return "Job details";
  }

  if (pathname === "/customers/new") {
    return "Create customer";
  }

  if (
    pathname.startsWith("/customers/") &&
    pathname.includes("/sites/") &&
    pathname.endsWith("/edit")
  ) {
    return "Edit site";
  }

  if (
    pathname.startsWith("/customers/") &&
    pathname.endsWith("/sites/new")
  ) {
    return "Create site";
  }

  if (
    pathname.startsWith("/customers/") &&
    pathname.endsWith("/edit")
  ) {
    return "Edit customer";
  }

  if (pathname.startsWith("/customers/")) {
    return "Customer details";
  }

  if (pathname === "/workspace/setup") {
    return "Workspace setup";
  }

  return {
    "/dashboard": "Dashboard",
    "/jobs": "Jobs",
    "/customers": "Customers",
    "/teams": "Teams",
    "/equipment": "Equipment",
    "/inventory": "Inventory",
    "/settings": "Settings",
  }[pathname] || "Novera";
}

function getInitials(user) {
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((value) => value[0])
    .join("")
    .toUpperCase();

  return initials || user?.email?.[0]?.toUpperCase() || "N";
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:text-white lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <p className="truncate text-base font-semibold text-white">
            {getTitle(location.pathname)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
          </button>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-2 pr-3 text-left transition hover:border-slate-700"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400/15 text-xs font-bold text-emerald-200">
                {getInitials(user)}
              </span>

              <span className="hidden max-w-36 sm:block">
                <span className="block truncate text-xs font-semibold text-slate-100">
                  {fullName || "Novera user"}
                </span>

                <span className="block truncate text-[10px] text-slate-500">
                  {user?.email || "Authenticated"}
                </span>
              </span>

              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-black/30"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />

                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
