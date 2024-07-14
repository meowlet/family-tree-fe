"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AuthForm.module.css";
import { fetcher } from "@/api";
import useSWRMutation from "swr/mutation";
import Auth from "@/util/Auth";
import { SignInFormSchema } from "@/util/Type";
import toast from "react-hot-toast";

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { trigger } = useSWRMutation(
    "auth/signin",
    (url, { arg }: { arg: any }) => fetcher.post(url, arg)
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const signInFormValues = {
      identifier: formData.get("identifier") as string,
      password: formData.get("password") as string,
    };

    const formResult = SignInFormSchema.safeParse(signInFormValues);
    if (!formResult.success) {
      let errorMessage = "";
      formResult.error.errors.forEach((error: any) => {
        errorMessage += error.message + "\n";
      });
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    try {
      const result = await trigger(signInFormValues);
      Auth.setToken((result as any).data.token);
      toast.success("Sign in successfully! Redirecting...");
      window.location.href = "/";
      router.replace("/");
    } catch (error) {
      toast.error(
        (error as any).response?.data?.message || "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ←
      </button>
      <h1 className={styles.title}>Your story begins here</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="identifier">
            Username/Email
          </label>
          <input
            className={styles.input}
            type="text"
            id="identifier"
            name="identifier"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            type="password"
            id="password"
            name="password"
            required
          />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
