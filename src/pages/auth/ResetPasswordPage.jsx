import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import { resetPassword } from "../../services/auth-service";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setServerError("");
  }

  function validate() {
    const nextErrors = {};

    if (!token || token.length < 32) {
      setServerError(
        "This password reset link is invalid or incomplete. Please request a new one.",
      );
      return false;
    }

    if (!form.password) {
      nextErrors.password = "Enter a new password.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm your new password.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      await resetPassword({
        token,
        password: form.password,
      });

      setSubmitted(true);
    } catch (error) {
      setServerError(
        error?.message ||
          "We could not reset your password. The link may have expired or already been used.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          {submitted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <KeyRound className="h-5 w-5" />
          )}
        </span>

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Account recovery
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {submitted ? "Password updated" : "Create a new password"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {submitted
            ? "Your Novera password has been changed successfully. You can now sign in with your new password."
            : "Choose a new password for your Novera account. Your reset link can only be used once."}
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      {submitted ? (
        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <TextField
            label="New password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            error={errors.password}
            hint="Use at least 8 characters."
            autoComplete="new-password"
            placeholder="Enter your new password"
            required
          />

          <TextField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField}
            error={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="Confirm your new password"
            required
          />

          <Button
            type="submit"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            Reset password
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      )}

      {!submitted && (
        <p className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-300 transition hover:text-emerald-200"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}