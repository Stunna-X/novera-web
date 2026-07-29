import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

import CustomerStatusBadge from "./CustomerStatusBadge";
import CustomerTypeBadge from "./CustomerTypeBadge";

function customerLocation(customer) {
  return [customer.city, customer.state, customer.country].filter(Boolean).join(", ");
}

export default function CustomersTable({ customers }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
      <div className="hidden grid-cols-[1.5fr_1fr_1fr_auto] gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 lg:grid">
        <span>Customer</span>
        <span>Contact</span>
        <span>Location</span>
        <span>Status</span>
      </div>

      <div className="divide-y divide-slate-800">
        {customers.map((customer) => {
          const location = customerLocation(customer);

          return (
            <Link
              key={customer.id}
              to={`/customers/${customer.id}`}
              className="group grid gap-4 px-5 py-5 transition hover:bg-slate-800/45 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-white group-hover:text-emerald-200">
                    {customer.name}
                  </p>
                  <CustomerTypeBadge type={customer.customer_type} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {customer.contact_name || "No named contact"}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                {customer.email ? (
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    {customer.email}
                  </p>
                ) : null}
                {customer.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    {customer.phone}
                  </p>
                ) : null}
                {!customer.email && !customer.phone ? (
                  <span className="text-slate-600">No contact details</span>
                ) : null}
              </div>

              <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                <span className="truncate">{location || "No address recorded"}</span>
              </div>

              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <CustomerStatusBadge active={customer.is_active} />
                <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
