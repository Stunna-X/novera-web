import { ChevronRight, Mail, Phone, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

import AvailabilityBadge from "./AvailabilityBadge";
import WorkforceStatusBadge from "./WorkforceStatusBadge";
import { humanizeTeamValue, teamMemberName } from "../../utils/team-utils";

function initials(member) {
  const letters = [member?.first_name, member?.last_name]
    .filter(Boolean)
    .map((value) => value[0])
    .join("")
    .toUpperCase();

  return letters || member?.email?.[0]?.toUpperCase() || "N";
}

export default function TeamTable({ members }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
      <div className="hidden grid-cols-[minmax(240px,1.2fr)_minmax(170px,.75fr)_minmax(190px,.8fr)_150px_110px_28px] gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 lg:grid">
        <span>Team member</span>
        <span>Role and position</span>
        <span>Contact</span>
        <span>Availability</span>
        <span>Status</span>
        <span />
      </div>

      <div className="divide-y divide-slate-800">
        {members.map((member) => (
          <Link
            key={member.id}
            to={`/teams/${member.id}`}
            className="grid gap-4 px-5 py-5 transition hover:bg-slate-800/25 lg:grid-cols-[minmax(240px,1.2fr)_minmax(170px,.75fr)_minmax(190px,.8fr)_150px_110px_28px] lg:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-xs font-bold text-emerald-200">
                {initials(member)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {teamMemberName(member)}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {member.employee_code || "No employee code"}
                </p>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-sm text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
                {member.role_name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {member.job_title || humanizeTeamValue(member.employment_type)}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              <p className="flex min-w-0 items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </p>
              {member.phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {member.phone}
                </p>
              ) : null}
            </div>

            <AvailabilityBadge available={member.is_available} />
            <WorkforceStatusBadge status={member.status} />
            <ChevronRight className="hidden h-4 w-4 text-slate-600 lg:block" />
          </Link>
        ))}
      </div>
    </section>
  );
}
