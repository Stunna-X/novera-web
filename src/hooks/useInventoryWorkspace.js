import { useCallback, useEffect, useState } from "react";

import { listJobs } from "../services/job-service";
import {
  listInventoryBalances,
  listInventoryItems,
  listInventoryLocations,
  listInventoryMovements,
  listInventoryReservations,
  listLowStock,
} from "../services/inventory-service";
import { getListItems } from "../utils/inventory-utils";

const DEFAULT_LIMIT = 200;

export default function useInventoryWorkspace(organizationId) {
  const [data, setData] = useState({
    items: [],
    locations: [],
    balances: [],
    lowStock: [],
    movements: [],
    reservations: [],
    jobs: [],
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!organizationId) {
      setData({
        items: [],
        locations: [],
        balances: [],
        lowStock: [],
        movements: [],
        reservations: [],
        jobs: [],
      });
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError(null);

    const common = { skip: 0, limit: DEFAULT_LIMIT };

    try {
      const [items, locations, balances, lowStock, movements, reservations, jobs] =
        await Promise.all([
          listInventoryItems(organizationId, {
            ...common,
            include_inactive: true,
          }),
          listInventoryLocations(organizationId, {
            ...common,
            include_inactive: true,
          }),
          listInventoryBalances(organizationId, {
            ...common,
            include_inactive_catalogue: true,
          }),
          listLowStock(organizationId, common),
          listInventoryMovements(organizationId, {
            skip: 0,
            limit: 100,
          }),
          listInventoryReservations(organizationId, {
            ...common,
            include_inactive: true,
          }),
          listJobs(organizationId, {
            skip: 0,
            limit: DEFAULT_LIMIT,
            include_inactive: false,
          }),
        ]);

      setData({
        items: getListItems(items),
        locations: getListItems(locations),
        balances: getListItems(balances),
        lowStock: getListItems(lowStock),
        movements: getListItems(movements),
        reservations: getListItems(reservations),
        jobs: getListItems(jobs).filter(
          (job) => !["completed", "cancelled"].includes(job.status),
        ),
      });
      setStatus("ready");
    } catch (requestError) {
      setError(requestError);
      setStatus("error");
    }
  }, [organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...data,
    status,
    error,
    isLoading: status === "loading",
    refresh,
  };
}
