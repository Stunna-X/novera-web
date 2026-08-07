import {
  ArrowDownLeft,
  ArrowUpRight,
  Edit3,
  Package,
  RotateCcw,
  Trash2,
} from "lucide-react";

import Button from "../ui/Button";
import { formatCurrency } from "../../utils/currency";
import {
  MOVEMENT_LABELS,
  RESERVATION_LABELS,
  formatQuantity,
  isOpenReservation,
} from "../../utils/inventory-utils";

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center text-sm text-slate-500">
        {message}
      </td>
    </tr>
  );
}

function TableShell({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function StatusPill({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        active
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-slate-700 bg-slate-800/80 text-slate-400"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function StockTable({ balances }) {
  return (
    <TableShell>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Item</th>
            <th className="px-5 py-4 font-medium">Location</th>
            <th className="px-5 py-4 font-medium">On hand</th>
            <th className="px-5 py-4 font-medium">Reserved</th>
            <th className="px-5 py-4 font-medium">Available</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {balances.length === 0 ? (
            <EmptyRow colSpan={5} message="No stock balances yet. Receive stock to begin." />
          ) : (
            balances.map((balance) => (
              <tr key={balance.id} className="hover:bg-slate-800/25">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{balance.item?.name || "Inventory item"}</p>
                  <p className="mt-1 text-xs text-slate-500">{balance.item?.sku}</p>
                </td>
                <td className="px-5 py-4 text-slate-300">{balance.location?.name || "—"}</td>
                <td className="px-5 py-4 text-slate-300">
                  {formatQuantity(balance.quantity_on_hand, balance.item?.unit_of_measure)}
                </td>
                <td className="px-5 py-4 text-amber-200">
                  {formatQuantity(balance.quantity_reserved, balance.item?.unit_of_measure)}
                </td>
                <td className="px-5 py-4 font-semibold text-emerald-200">
                  {formatQuantity(balance.available_quantity, balance.item?.unit_of_measure)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

export function ItemsTable({ items, canUpdate, canDelete, onEdit, onDeactivate, onReactivate }) {
  return (
    <TableShell>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Item</th>
            <th className="px-5 py-4 font-medium">Type</th>
            <th className="px-5 py-4 font-medium">Unit</th>
            <th className="px-5 py-4 font-medium">Unit cost</th>
            <th className="px-5 py-4 font-medium">Low-stock level</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {items.length === 0 ? (
            <EmptyRow colSpan={7} message="No inventory items have been added." />
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/25">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.sku}</p>
                </td>
                <td className="px-5 py-4 capitalize text-slate-300">
                  {String(item.item_type || "other").replaceAll("_", " ")}
                </td>
                <td className="px-5 py-4 text-slate-300">{item.unit_of_measure}</td>
                <td className="px-5 py-4 text-slate-300">
                  {formatCurrency(
                    item.default_unit_cost,
                    item.currency,
                  )}
                </td>
                <td className="px-5 py-4 text-slate-300">
                  {formatQuantity(item.reorder_level, item.unit_of_measure)}
                </td>
                <td className="px-5 py-4"><StatusPill active={item.is_active} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {canUpdate && item.is_active && (
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && item.is_active && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(item)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-rose-300 transition hover:bg-rose-400/10"
                        aria-label={`Deactivate ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {canUpdate && !item.is_active && (
                      <button
                        type="button"
                        onClick={() => onReactivate(item)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-emerald-300 transition hover:bg-emerald-400/10"
                        aria-label={`Reactivate ${item.name}`}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

export function LocationsTable({
  locations,
  canUpdate,
  canDelete,
  onEdit,
  onDeactivate,
  onReactivate,
}) {
  return (
    <TableShell>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Location</th>
            <th className="px-5 py-4 font-medium">Type</th>
            <th className="px-5 py-4 font-medium">Address</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {locations.length === 0 ? (
            <EmptyRow colSpan={5} message="No stock locations have been added." />
          ) : (
            locations.map((location) => (
              <tr key={location.id} className="hover:bg-slate-800/25">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{location.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{location.code}</p>
                </td>
                <td className="px-5 py-4 capitalize text-slate-300">
                  {String(location.location_type || "other").replaceAll("_", " ")}
                </td>
                <td className="max-w-xs px-5 py-4 text-slate-400">{location.address || "—"}</td>
                <td className="px-5 py-4"><StatusPill active={location.is_active} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    {canUpdate && location.is_active && (
                      <button
                        type="button"
                        onClick={() => onEdit(location)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        aria-label={`Edit ${location.name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && location.is_active && (
                      <button
                        type="button"
                        onClick={() => onDeactivate(location)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-rose-300 transition hover:bg-rose-400/10"
                        aria-label={`Deactivate ${location.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {canUpdate && !location.is_active && (
                      <button
                        type="button"
                        onClick={() => onReactivate(location)}
                        className="grid h-9 w-9 place-items-center rounded-lg text-emerald-300 transition hover:bg-emerald-400/10"
                        aria-label={`Reactivate ${location.name}`}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

export function MovementsTable({ movements }) {
  return (
    <TableShell>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Movement</th>
            <th className="px-5 py-4 font-medium">Item</th>
            <th className="px-5 py-4 font-medium">Location</th>
            <th className="px-5 py-4 font-medium">Quantity</th>
            <th className="px-5 py-4 font-medium">Recorded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {movements.length === 0 ? (
            <EmptyRow colSpan={5} message="No inventory movements have been recorded." />
          ) : (
            movements.map((movement) => {
              const incoming = Number(movement.quantity_delta) >= 0;
              const Icon = incoming ? ArrowDownLeft : ArrowUpRight;

              return (
                <tr key={movement.id} className="hover:bg-slate-800/25">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-xl ${incoming ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-slate-200">
                        {MOVEMENT_LABELS[movement.movement_type] || movement.movement_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white">{movement.item?.name || "Inventory item"}</td>
                  <td className="px-5 py-4 text-slate-300">{movement.location?.name || "—"}</td>
                  <td className={`px-5 py-4 font-semibold ${incoming ? "text-emerald-200" : "text-amber-200"}`}>
                    {incoming ? "+" : ""}{formatQuantity(movement.quantity_delta, movement.item?.unit_of_measure)}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(movement.occurred_at).toLocaleString()}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

export function LowStockTable({ items }) {
  return (
    <TableShell>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Item</th>
            <th className="px-5 py-4 font-medium">Available</th>
            <th className="px-5 py-4 font-medium">Alert level</th>
            <th className="px-5 py-4 font-medium">Shortage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {items.length === 0 ? (
            <EmptyRow colSpan={4} message="No low-stock alerts. Stock levels are healthy." />
          ) : (
            items.map((item) => (
              <tr key={item.item_id} className="hover:bg-slate-800/25">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.sku}</p>
                </td>
                <td className="px-5 py-4 text-amber-200">
                  {formatQuantity(item.available_quantity, item.unit_of_measure)}
                </td>
                <td className="px-5 py-4 text-slate-300">
                  {formatQuantity(item.reorder_level, item.unit_of_measure)}
                </td>
                <td className="px-5 py-4 font-semibold text-rose-200">
                  {formatQuantity(item.shortage_quantity, item.unit_of_measure)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableShell>
  );
}

export function ReservationsTable({ reservations, jobs, canUpdate, onConsume, onRelease }) {
  const jobsById = new Map(jobs.map((job) => [job.id, job]));

  return (
    <TableShell>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Item</th>
            <th className="px-5 py-4 font-medium">Job</th>
            <th className="px-5 py-4 font-medium">Location</th>
            <th className="px-5 py-4 font-medium">Remaining</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {reservations.length === 0 ? (
            <EmptyRow colSpan={6} message="No stock reservations have been created." />
          ) : (
            reservations.map((reservation) => {
              const job = jobsById.get(reservation.work_order_id);
              const open = isOpenReservation(reservation);

              return (
                <tr key={reservation.id} className="hover:bg-slate-800/25">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{reservation.item?.name || "Inventory item"}</p>
                    <p className="mt-1 text-xs text-slate-500">{reservation.item?.sku}</p>
                  </td>
                  <td className="max-w-xs px-5 py-4 text-slate-300">
                    {job?.title || job?.work_order_number || reservation.work_order_id}
                  </td>
                  <td className="px-5 py-4 text-slate-300">{reservation.location?.name || "—"}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-200">
                    {formatQuantity(reservation.remaining_quantity, reservation.item?.unit_of_measure)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300">
                      {RESERVATION_LABELS[reservation.status] || reservation.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {canUpdate && open && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => onConsume(reservation)}>
                            <Package className="h-4 w-4" /> Use
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onRelease(reservation)}>
                            Release
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </TableShell>
  );
}
