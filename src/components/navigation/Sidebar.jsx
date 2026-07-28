import {
  Boxes,
  BriefcaseBusiness,
  Gauge,
  Settings,
  Users,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import { NavLink } from "react-router";

import NoveraLogo from "../brand/NoveraLogo";
import { cn } from "../../utils/cn";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: Gauge },
  { label: "Jobs", to: "/jobs", icon: BriefcaseBusiness },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Teams", to: "/teams", icon: Boxes },
  { label: "Equipment", to: "/equipment", icon: Wrench },
  { label: "Inventory", to: "/inventory", icon: Warehouse },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950/95 p-5 shadow-2xl shadow-black/20 backdrop-blur transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Primary navigation"
      >
        <div className="flex items-center justify-between">
          <NoveraLogo />
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Workspace
          </p>
          <p className="mt-2 text-sm font-semibold text-white">Abuja Operations</p>
          <p className="mt-1 text-xs text-slate-500">Field operations command centre</p>
        </div>

        <nav className="novera-scrollbar mt-6 flex-1 overflow-y-auto">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Operations
          </p>
          <div className="space-y-1">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                    isActive
                      ? "bg-emerald-400/10 text-emerald-200"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5 transition",
                        isActive
                          ? "text-emerald-300"
                          : "text-slate-500 group-hover:text-slate-300",
                      )}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-5 border-t border-slate-800/80 pt-5">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                isActive
                  ? "bg-emerald-400/10 text-emerald-200"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              )
            }
          >
            <Settings className="h-4.5 w-4.5" />
            Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
}
