import { ArrowRight, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import useAuth from "../../hooks/useAuth";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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

    if (!form.firstName.trim()) nextErrors.firstName = "Enter your first name.";
    if (!form.lastName.trim()) nextErrors.lastName = "Enter your last name.";

    if (!form.email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "The passwords do not match.";
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
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(error?.message || "We could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <UserPlus className="h-5 w-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Create workspace access
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Start with Novera
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Create your account. Organisation setup comes next.
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-5">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={updateField}
            error={errors.firstName}
            autoComplete="given-name"
            placeholder="First name"
            required
          />
          <TextField
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={updateField}
            error={errors.lastName}
            autoComplete="family-name"
            placeholder="Last name"
            required
          />
        </div>

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
          label="Phone number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={updateField}
          autoComplete="tel"
          placeholder="Optional"
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          error={errors.password}
          autoComplete="new-password"
          hint="Minimum 8 characters."
          placeholder="Create a password"
          required
        />

        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={updateField}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Repeat your password"
          required
        />

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Create account
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

