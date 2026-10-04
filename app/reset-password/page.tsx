"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { LockKeyhole, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    if (!supabase) {
      setError("Supabase is not configured.");

      return () => {
        active = false;
      };
    }

    supabase.auth.getSession().then((result) => {
      if (!active) return;

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setReady(Boolean(result.data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setReady(Boolean(session));
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Your password has been updated successfully. You can now sign in with your new password."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to update your password. Please request a new reset link."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-xl flex-col">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#706780] hover:text-[#1f1d35]"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="mt-8 rounded-2xl bg-[#f4eadd] p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4eadd] text-[#4b40ef]">
            <LockKeyhole size={22} />
          </div>

          <h1 className="mt-7 text-xl font-black text-[#1f1d35]">
            Create a new password
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#706780]">
            Choose a strong password for your authorized Hamiq account.
          </p>

          {!ready && !error && (
            <p className="mt-5 flex gap-2 rounded-xl bg-[#fff5eb] px-3 py-2 text-sm text-[#765511]">
              Checking your secure reset session...
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block text-sm font-semibold text-[#1f1d35]">
              New password
            </label>

            <input
              required
              disabled={!ready || loading}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input mt-2"
              placeholder="At least 8 characters"
              type="password"
              autoComplete="new-password"
            />

            <label className="mt-4 block text-sm font-semibold text-[#1f1d35]">
              Confirm password
            </label>

            <input
              required
              disabled={!ready || loading}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="input mt-2"
              placeholder="Repeat your password"
              type="password"
              autoComplete="new-password"
            />

            {message && (
              <p className="mt-4 flex gap-2 rounded-xl bg-green-50 px-3 py-3 text-sm leading-6 text-green-700">
                <CheckCircle size={18} className="mt-0.5 shrink-0" />
                {message}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-sm leading-6 text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!ready || loading}
              className="btn btn-primary mt-6 w-full justify-center"
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            <Link
              href="/login"
              className="mt-5 block text-center text-sm font-semibold text-[#706780] hover:text-[#4a6cf7]"
            >
              Return to Hamiq Login
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
            }
