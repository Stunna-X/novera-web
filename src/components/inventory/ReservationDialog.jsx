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

export default function ReservationDialog({
  open,
  mode = "create",
  reservation,
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
    work_order_id: "",
    quantity: "",
    expires_at: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setValues({
      item_id: "",
      location_id: "",
      work_order_id: "",
      quantity: "",
      expires_at: "",
    });
    setError(null);
    setFieldErrors({});
  }, [open, mode, reservation]);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    let payload;

    if (mode === "create") {
      const nextErrors = {};

      if (!values.item_id) {
        nextErrors.item_id = "Choose an inventory item.";
      }

      if (!values.location_id) {
        nextErrors.location_id = "Choose a stock location.";
      }

      if (!values.work_order_id) {
        nextErrors.work_order_id = "Choose a job.";
      }

      const quantity = toApiDecimal(values.quantity);
      if (!quantity || Number(quantity) <= 0) {
        nextErrors.quantity = "Enter a quantity greater than zero.";
      }

      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        setSubmitting(false);
        return;
      }

      payload = {
        item_id: values.item_id,
        location_id: values.location_id,
        work_order_id: values.work_order_id,
        quantity,
        expires_at: values.expires_at
          ? new Date(
              `${values.expires_at}T23:59:59.999`,
            ).toISOString()
          : null,
      };
    } else if (mode === "consume") {
      payload = {
        quantity: toApiDecimal(values.quantity),
      };
    } else {
      payload = {};
    }

    try {
      await onSubmit(mode, reservation, payload);
      onClose();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "The reservation action could not be completed.",
        ),
      );
      setFieldErrors(getApiFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    mode === "create"
      ? "Reserve stock"
      : mode === "consume"
        ? "Use reserved stock"
        : "Release reservation";

  return (
    <Modal
      open={open}
      title={title}
      onClose={submitting ? () => {} : onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}

        {mode === "create" && (
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
              label="Stock location"
              required
              value={values.location_id}
              error={fieldErrors.location_id}
              onChange={(event) =>
                setField("location_id", event.target.value)
              }
            >
              <option value="">Select a stock location</option>
              {activeLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Job"
              required
              value={values.work_order_id}
              error={fieldErrors.work_order_id}
              onChange={(event) =>
                setField("work_order_id", event.target.value)
              }
            >
              <option value="">
                {jobs.length === 0
                  ? "No active jobs available"
                  : "Select a job"}
              </option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {getJobLabel(job)}
                </option>
              ))}
            </SelectField>

            <TextField
              label="Quantity"
              required
              type="text"
              inputMode="decimal"
              value={values.quantity}
              error={fieldErrors.quantity}
              onChange={(event) =>
                setField(
                  "quantity",
                  normalizeDecimalInput(event.target.value),
                )
              }
            />

            <TextField
              label="Expiry date"
              type="date"
              value={values.expires_at}
              error={fieldErrors.expires_at}
              onChange={(event) =>
                setField("expires_at", event.target.value)
              }
            />
          </>
        )}

        {mode === "consume" && (
          <TextField
            label="Quantity to use"
            type="text"
            inputMode="decimal"
            value={values.quantity}
            error={fieldErrors.quantity}
            hint="Leave blank to use the full remaining quantity."
            onChange={(event) =>
              setField(
                "quantity",
                normalizeDecimalInput(event.target.value),
              )
            }
          />
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
              mode === "create" &&
              (activeItems.length === 0 ||
                activeLocations.length === 0 ||
                jobs.length === 0)
            }
          >
            {mode === "create"
              ? "Reserve stock"
              : mode === "consume"
                ? "Record usage"
                : "Release stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
