import { useEffect, useMemo, useState } from "react";

import { getApiErrorMessage, getApiFieldErrors } from "../../utils/api-errors";
import {
  normalizeDecimalInput,
  toApiDecimal,
} from "../../utils/inventory-utils";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import TextAreaField from "../ui/TextAreaField";
import TextField from "../ui/TextField";

export default function JobMaterialDialog({
  open,
  material,
  inventoryItems,
  existingItemIds,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(material?.id);

  const selectableItems = useMemo(
    () =>
      inventoryItems.filter(
        (item) =>
          (
            item.is_active ||
            item.id === material?.inventory_item_id
          ) &&
          (
            item.id === material?.inventory_item_id ||
            !existingItemIds.has(item.id)
          ),
      ),
    [
      existingItemIds,
      inventoryItems,
      material?.inventory_item_id,
    ],
  );

  const initialValues = useMemo(
    () => ({
      inventory_item_id:
        material?.inventory_item_id ||
        selectableItems[0]?.id ||
        "",
      required_quantity:
        material?.required_quantity
          ? String(material.required_quantity)
          : "",
      notes: material?.notes || "",
    }),
    [material, selectableItems],
  );

  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setValues(initialValues);
    setSubmitting(false);
    setError("");
    setFieldErrors({});
  }, [initialValues, open]);

  function setField(name, value) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const payload = {
      required_quantity: toApiDecimal(
        values.required_quantity,
        null,
      ),
      notes: values.notes.trim() || null,
    };

    if (!isEditing) {
      payload.inventory_item_id = values.inventory_item_id;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "The material requirement could not be saved.",
        ),
      );
      setFieldErrors(getApiFieldErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit required material" : "Add required material"}
      onClose={submitting ? () => {} : onClose}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}

        {selectableItems.length === 0 ? (
          <Alert variant="error">
            No active inventory item is available to add. Add an item
            to the inventory catalogue first.
          </Alert>
        ) : (
          <>
            <SelectField
              label="Inventory item"
              required
              disabled={isEditing}
              value={values.inventory_item_id}
              error={fieldErrors.inventory_item_id}
              onChange={(event) =>
                setField(
                  "inventory_item_id",
                  event.target.value,
                )
              }
            >
              {selectableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku}) · {item.unit_of_measure}
                </option>
              ))}
            </SelectField>

            <TextField
              label="Required quantity"
              required
              type="text"
              inputMode="decimal"
              value={values.required_quantity}
              error={fieldErrors.required_quantity}
              onChange={(event) =>
                setField(
                  "required_quantity",
                  normalizeDecimalInput(event.target.value),
                )
              }
            />

            <TextAreaField
              label="Notes"
              rows={3}
              value={values.notes}
              error={fieldErrors.notes}
              onChange={(event) =>
                setField("notes", event.target.value)
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
            disabled={selectableItems.length === 0}
          >
            {isEditing ? "Save material" : "Add material"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
