import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CirclePlus,
  MapPinPlus,
  RefreshCw,
  SlidersHorizontal,
  Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import AccessDenied from "../../components/feedback/AccessDenied";
import LoadingScreen from "../../components/feedback/LoadingScreen";
import InventoryItemDialog from "../../components/inventory/InventoryItemDialog";
import InventoryLocationDialog from "../../components/inventory/InventoryLocationDialog";
import InventorySummary from "../../components/inventory/InventorySummary";
import InventoryTabs from "../../components/inventory/InventoryTabs";
import {
  ItemsTable,
  LocationsTable,
  LowStockTable,
  MovementsTable,
  ReservationsTable,
  StockTable,
} from "../../components/inventory/InventoryTables";
import ReservationDialog from "../../components/inventory/ReservationDialog";
import StockOperationDialog from "../../components/inventory/StockOperationDialog";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import useInventoryWorkspace from "../../hooks/useInventoryWorkspace";
import useWorkspace from "../../hooks/useWorkspace";
import {
  adjustInventoryStock,
  consumeInventoryReservation,
  createInventoryItem,
  createInventoryLocation,
  createInventoryReservation,
  deactivateInventoryItem,
  deactivateInventoryLocation,
  issueInventoryStock,
  reactivateInventoryItem,
  reactivateInventoryLocation,
  receiveInventoryStock,
  releaseInventoryReservation,
  returnInventoryStock,
  transferInventoryStock,
  updateInventoryItem,
  updateInventoryLocation,
} from "../../services/inventory-service";
import { getApiErrorMessage } from "../../utils/api-errors";
import { resolveWorkspaceCurrency } from "../../utils/currency";
import { INVENTORY_VIEWS } from "../../utils/inventory-utils";

const OPERATION_FUNCTIONS = {
  receive: receiveInventoryStock,
  issue: issueInventoryStock,
  return: returnInventoryStock,
  adjust: adjustInventoryStock,
  transfer: transferInventoryStock,
};

function includesSearch(values, query) {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return values.some((value) => String(value || "").toLowerCase().includes(normalized));
}

export default function InventoryPage() {
  const {
    activeOrganization,
    activeOrganizationId,
    hasWorkspace,
    hasPermission,
    isLoading: workspaceLoading,
  } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get("view") || "stock";
  const activeView = INVENTORY_VIEWS.some((view) => view.value === requestedView)
    ? requestedView
    : "stock";
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [notice, setNotice] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [itemDialog, setItemDialog] = useState({ open: false, item: null });
  const [locationDialog, setLocationDialog] = useState({
    open: false,
    location: null,
  });
  const [operationDialog, setOperationDialog] = useState({
    open: false,
    operation: "receive",
  });
  const [reservationDialog, setReservationDialog] = useState({
    open: false,
    mode: "create",
    reservation: null,
  });

  const inventory = useInventoryWorkspace(activeOrganizationId);
  const currency = resolveWorkspaceCurrency(activeOrganization);
  const canRead = hasPermission("inventory.read");
  const canCreate = hasPermission("inventory.create");
  const canUpdate = hasPermission("inventory.update");
  const canDelete = hasPermission("inventory.delete");

  const hasActiveItems = inventory.items.some((item) => item.is_active);
  const hasActiveLocations = inventory.locations.some(
    (location) => location.is_active,
  );
  const inventorySetupReady = hasActiveItems && hasActiveLocations;
  const reservationSetupReady =
    inventorySetupReady && inventory.jobs.length > 0;

  const setupMessage =
    !hasActiveItems && !hasActiveLocations
      ? "Add an inventory item and stock location to begin."
      : !hasActiveItems
        ? "Add an inventory item to begin."
        : "Add a stock location to begin.";

  const filteredItems = useMemo(
    () =>
      inventory.items.filter(
        (item) =>
          (includeInactive || item.is_active) &&
          includesSearch([item.name, item.sku, item.item_type], search),
      ),
    [includeInactive, inventory.items, search],
  );

  const filteredLocations = useMemo(
    () =>
      inventory.locations.filter(
        (location) =>
          (includeInactive || location.is_active) &&
          includesSearch(
            [location.name, location.code, location.location_type, location.address],
            search,
          ),
      ),
    [includeInactive, inventory.locations, search],
  );

  const filteredBalances = useMemo(
    () =>
      inventory.balances.filter((balance) =>
        includesSearch(
          [balance.item?.name, balance.item?.sku, balance.location?.name],
          search,
        ),
      ),
    [inventory.balances, search],
  );

  const filteredMovements = useMemo(
    () =>
      inventory.movements.filter((movement) =>
        includesSearch(
          [
            movement.item?.name,
            movement.item?.sku,
            movement.location?.name,
            movement.movement_type,
            movement.reference_id,
          ],
          search,
        ),
      ),
    [inventory.movements, search],
  );

  const filteredLowStock = useMemo(
    () =>
      inventory.lowStock.filter((item) =>
        includesSearch([item.name, item.sku, item.item_type], search),
      ),
    [inventory.lowStock, search],
  );

  const filteredReservations = useMemo(
    () =>
      inventory.reservations.filter((reservation) =>
        includesSearch(
          [
            reservation.item?.name,
            reservation.item?.sku,
            reservation.location?.name,
            reservation.status,
          ],
          search,
        ),
      ),
    [inventory.reservations, search],
  );

  function changeView(nextView) {
    setSearchParams(nextView === "stock" ? {} : { view: nextView });
    setSearch("");
    setNotice(null);
    setPageError(null);
  }

  async function runAction(action, successMessage) {
    setPageError(null);
    setNotice(null);

    try {
      await action();
      await inventory.refresh();
      setNotice(successMessage);
    } catch (error) {
      setPageError(getApiErrorMessage(error));
      throw error;
    }
  }

  async function handleItemSubmit(payload) {
    const current = itemDialog.item;
    await runAction(
      () =>
        current
          ? updateInventoryItem(activeOrganizationId, current.id, payload)
          : createInventoryItem(activeOrganizationId, payload),
      current ? "Inventory item updated." : "Inventory item added.",
    );
  }

  async function handleLocationSubmit(payload) {
    const current = locationDialog.location;
    await runAction(
      () =>
        current
          ? updateInventoryLocation(activeOrganizationId, current.id, payload)
          : createInventoryLocation(activeOrganizationId, payload),
      current ? "Stock location updated." : "Stock location added.",
    );
  }

  async function handleStockOperation(operation, payload) {
    const action = OPERATION_FUNCTIONS[operation];
    if (!action) throw new Error("Unsupported stock operation.");

    await runAction(
      () => action(activeOrganizationId, payload),
      "Stock balance updated.",
    );
  }

  async function handleReservation(mode, reservation, payload) {
    if (mode === "create") {
      await runAction(
        () => createInventoryReservation(activeOrganizationId, payload),
        "Stock reserved for the job.",
      );
      return;
    }

    if (mode === "consume") {
      await runAction(
        () =>
          consumeInventoryReservation(
            activeOrganizationId,
            reservation.id,
            payload,
          ),
        "Reserved stock usage recorded.",
      );
      return;
    }

    await runAction(
      () =>
        releaseInventoryReservation(
          activeOrganizationId,
          reservation.id,
          payload,
        ),
      "Unused reservation released.",
    );
  }

  async function confirmAndRun(message, action, successMessage) {
    if (!window.confirm(message)) return;
    try {
      await runAction(action, successMessage);
    } catch {
      // Page-level error is already displayed.
    }
  }

  if (workspaceLoading) return <LoadingScreen />;

  if (!hasWorkspace) {
    return (
      <AccessDenied
        title="Workspace required"
        description="Create or select a workspace before managing inventory."
      />
    );
  }

  if (!canRead) {
    return (
      <AccessDenied
        title="Inventory access restricted"
        description="Your workspace role does not include inventory.read permission."
      />
    );
  }

  const showInactiveToggle = ["items", "locations"].includes(activeView);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/35 p-6 sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Materials control
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Inventory
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Track materials and supplies across stores, vehicles, and job sites without complicating daily field work.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={inventory.refresh} loading={inventory.isLoading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            {canCreate && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setLocationDialog({ open: true, location: null })}
                >
                  <MapPinPlus className="h-4 w-4" /> Add location
                </Button>
                <Button onClick={() => setItemDialog({ open: true, item: null })}>
                  <CirclePlus className="h-4 w-4" /> Add item
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <InventorySummary
        items={inventory.items}
        locations={inventory.locations}
        balances={inventory.balances}
        lowStock={inventory.lowStock}
      />

      {canUpdate && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/55 p-4">
          {!inventorySetupReady && (
            <Alert variant="info">{setupMessage}</Alert>
          )}

          {inventorySetupReady && inventory.jobs.length === 0 && (
            <Alert variant="info">
              Add or activate a job before reserving stock for field work.
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!inventorySetupReady}
              onClick={() =>
                setOperationDialog({ open: true, operation: "receive" })
              }
            >
              <ArrowDownToLine className="h-4 w-4" /> Receive
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!inventorySetupReady}
              onClick={() =>
                setOperationDialog({ open: true, operation: "issue" })
              }
            >
              <ArrowUpFromLine className="h-4 w-4" /> Issue
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!inventorySetupReady}
              onClick={() =>
                setOperationDialog({ open: true, operation: "return" })
              }
            >
              <Undo2 className="h-4 w-4" /> Return
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!inventorySetupReady}
              onClick={() =>
                setOperationDialog({ open: true, operation: "transfer" })
              }
            >
              <ArrowLeftRight className="h-4 w-4" /> Transfer
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!inventorySetupReady}
              onClick={() =>
                setOperationDialog({ open: true, operation: "adjust" })
              }
            >
              <SlidersHorizontal className="h-4 w-4" /> Adjust count
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!reservationSetupReady}
              onClick={() =>
                setReservationDialog({
                  open: true,
                  mode: "create",
                  reservation: null,
                })
              }
            >
              <Boxes className="h-4 w-4" /> Reserve for job
            </Button>
          </div>
        </section>
      )}

      <InventoryTabs value={activeView} onChange={changeView} />

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/55 p-4 sm:flex-row sm:items-end sm:justify-between">
        <TextField
          label="Search"
          value={search}
          className="w-full sm:max-w-lg"
          onChange={(event) => setSearch(event.target.value)}
        />

        {showInactiveToggle && (
          <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
              className="h-4 w-4 accent-emerald-400"
            />
            Include inactive
          </label>
        )}
      </section>

      {notice && <Alert variant="success">{notice}</Alert>}
      {pageError && <Alert variant="error">{pageError}</Alert>}
      {inventory.error && (
        <Alert variant="error">
          {getApiErrorMessage(inventory.error, "Inventory records could not be loaded.")}
        </Alert>
      )}

      {inventory.isLoading && inventory.status !== "ready" ? (
        <LoadingScreen />
      ) : (
        <>
          {activeView === "stock" && <StockTable balances={filteredBalances} />}
          {activeView === "items" && (
            <ItemsTable
              items={filteredItems}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={(item) => setItemDialog({ open: true, item })}
              onDeactivate={(item) =>
                confirmAndRun(
                  `Deactivate ${item.name}? Existing movement history will remain available.`,
                  () => deactivateInventoryItem(activeOrganizationId, item.id),
                  "Inventory item deactivated.",
                )
              }
              onReactivate={(item) =>
                confirmAndRun(
                  `Reactivate ${item.name}?`,
                  () => reactivateInventoryItem(activeOrganizationId, item.id),
                  "Inventory item reactivated.",
                )
              }
            />
          )}
          {activeView === "locations" && (
            <LocationsTable
              locations={filteredLocations}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={(location) => setLocationDialog({ open: true, location })}
              onDeactivate={(location) =>
                confirmAndRun(
                  `Deactivate ${location.name}? The backend will refuse this when stock remains there.`,
                  () => deactivateInventoryLocation(activeOrganizationId, location.id),
                  "Stock location deactivated.",
                )
              }
              onReactivate={(location) =>
                confirmAndRun(
                  `Reactivate ${location.name}?`,
                  () => reactivateInventoryLocation(activeOrganizationId, location.id),
                  "Stock location reactivated.",
                )
              }
            />
          )}
          {activeView === "movements" && (
            <MovementsTable movements={filteredMovements} />
          )}
          {activeView === "low-stock" && (
            <LowStockTable items={filteredLowStock} />
          )}
          {activeView === "reservations" && (
            <ReservationsTable
              reservations={filteredReservations}
              jobs={inventory.jobs}
              canUpdate={canUpdate}
              onConsume={(reservation) =>
                setReservationDialog({
                  open: true,
                  mode: "consume",
                  reservation,
                })
              }
              onRelease={(reservation) =>
                setReservationDialog({
                  open: true,
                  mode: "release",
                  reservation,
                })
              }
            />
          )}
        </>
      )}

      <InventoryItemDialog
        open={itemDialog.open}
        item={itemDialog.item}
        currency={currency}
        onClose={() => setItemDialog({ open: false, item: null })}
        onSubmit={handleItemSubmit}
      />

      <InventoryLocationDialog
        open={locationDialog.open}
        location={locationDialog.location}
        onClose={() => setLocationDialog({ open: false, location: null })}
        onSubmit={handleLocationSubmit}
      />

      <StockOperationDialog
        open={operationDialog.open}
        operation={operationDialog.operation}
        items={inventory.items}
        locations={inventory.locations}
        jobs={inventory.jobs}
        onClose={() =>
          setOperationDialog({ open: false, operation: "receive" })
        }
        onSubmit={handleStockOperation}
      />

      <ReservationDialog
        open={reservationDialog.open}
        mode={reservationDialog.mode}
        reservation={reservationDialog.reservation}
        items={inventory.items}
        locations={inventory.locations}
        jobs={inventory.jobs}
        onClose={() =>
          setReservationDialog({
            open: false,
            mode: "create",
            reservation: null,
          })
        }
        onSubmit={handleReservation}
      />
    </div>
  );
}
