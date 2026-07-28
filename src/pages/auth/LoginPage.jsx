import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import useAuth from "../../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Enter your password.";
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
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      setServerError(error?.message || "We could not sign you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Secure access
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sign in to continue managing your field operations.
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          error={errors.email}
          autoComplete="email"
          placeholder="Enter your email"
          required
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs font-medium text-slate-500 transition hover:text-emerald-300"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Sign in
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        New to Novera?{" "}
        <Link
          to="/register"
          className="font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

