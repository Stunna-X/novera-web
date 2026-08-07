import { useEffect, useMemo, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";
import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import {
  ITEM_TYPES,
  makeInventoryReference,
  normalizeDecimalInput,
  toApiDecimal,
} from "../../utils/inventory-utils";

const UNIT_OPTIONS = ["each", "bag", "litre", "metre", "kilogram", "tonne", "drum", "box", "roll"];

function normalizeCostInput(value) {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^0-9.]/g, "");
  const [whole = "", ...fractionParts] = cleaned.split(".");
  const fraction = fractionParts.join("").slice(0, 4);

  return cleaned.includes(".")
    ? `${whole}.${fraction}`
    : whole;
}

export default function InventoryItemDialog({
  open,
  item,
  currency,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(item?.id);
  const initialValues = useMemo(
    () => ({
      name: item?.name || "",
      item_type: item?.item_type || "material",
      unit_of_measure: item?.unit_of_measure || "each",
      default_unit_cost: String(item?.default_unit_cost ?? "0"),
      reorder_level: item?.reorder_level || "0",
      description: item?.description || "",
    }),
    [item],
  );
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setValues(initialValues);
    setError(null);
    setFieldErrors({});
  }, [initialValues, open]);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      name: values.name.trim(),
      item_type: values.item_type,
      unit_of_measure: values.unit_of_measure.trim(),
      default_unit_cost: toApiDecimal(values.default_unit_cost, "0"),
      reorder_level: toApiDecimal(values.reorder_level, "0"),
      description: values.description.trim() || null,
    };

    if (!isEditing) {
      payload.sku = makeInventoryReference("INV");
      payload.currency = currency;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "The inventory item could not be saved."));
      setFieldErrors(getApiFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit inventory item" : "Add inventory item"}
      onClose={submitting ? () => {} : onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}

        <TextField
          label="Item name"
          required
          value={values.name}
          error={fieldErrors.name}
          onChange={(event) => setField("name", event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Item type"
            required
            value={values.item_type}
            error={fieldErrors.item_type}
            onChange={(event) => setField("item_type", event.target.value)}
          >
            {ITEM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </SelectField>

          <SelectField
            label="Unit of measure"
            required
            value={values.unit_of_measure}
            error={fieldErrors.unit_of_measure}
            onChange={(event) => setField("unit_of_measure", event.target.value)}
          >
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={`Unit cost (${item?.currency || currency})`}
            type="text"
            inputMode="decimal"
            value={values.default_unit_cost}
            error={fieldErrors.default_unit_cost}
            hint="Used to estimate job shortages and draft purchase requests."
            onChange={(event) =>
              setField(
                "default_unit_cost",
                normalizeCostInput(event.target.value),
              )
            }
          />

          <TextField
            label="Low-stock level"
            type="text"
            inputMode="decimal"
            value={values.reorder_level}
            error={fieldErrors.reorder_level}
            hint="Novera alerts the team when available stock reaches this level."
            onChange={(event) =>
              setField(
                "reorder_level",
                normalizeDecimalInput(event.target.value),
              )
            }
          />
        </div>

        <TextAreaField
          label="Description"
          rows={4}
          value={values.description}
          error={fieldErrors.description}
          onChange={(event) => setField("description", event.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEditing ? "Save item" : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
