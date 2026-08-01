import { useEffect, useMemo, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextField from "../ui/TextField";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import {
  getJobLabel,
  normalizeDecimalInput,
  toApiDecimal,
} from "../../utils/inventory-utils";

const TITLES = {
  receive: "Receive stock",
  issue: "Issue stock",
  return: "Return stock",
  adjust: "Adjust stock",
  transfer: "Transfer stock",
};

export default function StockOperationDialog({
  open,
  operation,
  items,
  locations,
  jobs,
  onClose,
  onSubmit,
}) {
  const activeItems = useMemo(
    () => items.filter((item) => item.is_active),
    [items],
  );
  const activeLocations = useMemo(
    () => locations.filter((location) => location.is_active),
    [locations],
  );

  const [values, setValues] = useState({
    item_id: "",
    location_id: "",
    destination_location_id: "",
    work_order_id: "",
    quantity: "",
    movement_type: "receipt",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setValues({
      item_id: "",
      location_id: "",
      destination_location_id: "",
      work_order_id: "",
      quantity: "",
      movement_type: "receipt",
    });
    setError(null);
    setFieldErrors({});
  }, [open, operation]);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const nextErrors = {};

    if (!values.item_id) {
      nextErrors.item_id = "Choose an inventory item.";
    }

    if (!values.location_id) {
      nextErrors.location_id =
        operation === "transfer"
          ? "Choose a source location."
          : "Choose a stock location.";
    }

    if (operation === "transfer" && !values.destination_location_id) {
      nextErrors.destination_location_id =
        "Choose a destination location.";
    }

    const quantity = toApiDecimal(values.quantity);
    if (!quantity || Number(quantity) === 0) {
      nextErrors.quantity = "Enter a quantity other than zero.";
    }

    if (
      operation === "transfer" &&
      values.location_id &&
      values.destination_location_id &&
      values.location_id === values.destination_location_id
    ) {
      nextErrors.destination_location_id =
        "Choose a different destination location.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setSubmitting(false);
      return;
    }

    let payload = {
      item_id: values.item_id,
    };

    if (operation === "transfer") {
      payload = {
        ...payload,
        source_location_id: values.location_id,
        destination_location_id: values.destination_location_id,
        quantity,
        work_order_id: values.work_order_id || null,
      };
    } else if (operation === "adjust") {
      payload = {
        ...payload,
        location_id: values.location_id,
        quantity_delta: quantity,
      };
    } else {
      payload = {
        ...payload,
        location_id: values.location_id,
        quantity,
      };

      if (["issue", "return"].includes(operation)) {
        payload.work_order_id = values.work_order_id || null;
      }

      if (operation === "receive") {
        payload.movement_type = values.movement_type;
      }
    }

    try {
      await onSubmit(operation, payload);
      onClose();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "The stock operation could not be completed.",
        ),
      );
      setFieldErrors(getApiFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  const allowNegative = operation === "adjust";

  return (
    <Modal
      open={open}
      title={TITLES[operation] || "Stock operation"}
      onClose={submitting ? () => {} : onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}

        {activeItems.length === 0 || activeLocations.length === 0 ? (
          <Alert variant="info">
            Add at least one inventory item and one stock location before
            recording stock.
          </Alert>
        ) : (
          <>
            <SelectField
              label="Inventory item"
              required
              value={values.item_id}
              error={fieldErrors.item_id}
              onChange={(event) => setField("item_id", event.target.value)}
            >
              <option value="">Select an inventory item</option>
              {activeItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label={
                operation === "transfer"
                  ? "Source location"
                  : "Stock location"
              }
              required
              value={values.location_id}
              error={fieldErrors.location_id}
              onChange={(event) => setField("location_id", event.target.value)}
            >
              <option value="">
                {operation === "transfer"
                  ? "Select a source location"
                  : "Select a stock location"}
              </option>
              {activeLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </SelectField>

            {operation === "transfer" && (
              <SelectField
                label="Destination location"
                required
                value={values.destination_location_id}
                error={fieldErrors.destination_location_id}
                onChange={(event) =>
                  setField("destination_location_id", event.target.value)
                }
              >
                <option value="">Select a destination location</option>
                {activeLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </SelectField>
            )}

            {operation === "receive" && (
              <SelectField
                label="Receipt type"
                value={values.movement_type}
                onChange={(event) =>
                  setField("movement_type", event.target.value)
                }
              >
                <option value="receipt">Stock received</option>
                <option value="opening_balance">Opening balance</option>
              </SelectField>
            )}

            {["issue", "return", "transfer"].includes(operation) && (
              <SelectField
                label="Related job"
                value={values.work_order_id}
                onChange={(event) =>
                  setField("work_order_id", event.target.value)
                }
              >
                <option value="">No related job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {getJobLabel(job)}
                  </option>
                ))}
              </SelectField>
            )}

            <TextField
              label={
                operation === "adjust" ? "Quantity change" : "Quantity"
              }
              required
              type="text"
              inputMode="decimal"
              value={values.quantity}
              error={
                fieldErrors.quantity || fieldErrors.quantity_delta
              }
              hint={
                operation === "adjust"
                  ? "Use a positive number to add stock or a negative number to reduce stock."
                  : undefined
              }
              onChange={(event) =>
                setField(
                  "quantity",
                  normalizeDecimalInput(event.target.value, {
                    allowNegative,
                  }),
                )
              }
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={
              activeItems.length === 0 || activeLocations.length === 0
            }
          >
            Complete operation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
