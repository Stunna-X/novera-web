import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import { requestPasswordReset } from "../../services/auth-service";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent password reset instructions.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setError("");
    setServerError("");
  }

  function validate() {
    if (!email.trim()) {
      setError("Enter your email address.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (requestError) {
      setServerError(
        requestError?.message ||
          "We could not process your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <Mail className="h-5 w-5" />
        </span>

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Account recovery
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Forgot your password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter the email address associated with your Novera account and
          we'll send you instructions to reset your password.
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      {submitted ? (
        <div className="space-y-5">
          <Alert variant="success">{GENERIC_MESSAGE}</Alert>

          <p className="text-sm leading-6 text-slate-500">
            Check your inbox and follow the link in the email. The reset link
            expires after one hour and can only be used once.
          </p>

          <Link
            to="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={error}
            autoComplete="email"
            placeholder="Enter your email"
            required
          />

          <Button
            type="submit"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            Send reset instructions
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