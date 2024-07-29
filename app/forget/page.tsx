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
    "auth/password/reset",
    (url, { arg }: { arg: any }) => fetcher.post(url, arg)
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const signInFormValues = {
      identifier: formData.get("identifier") as string,
    };

    try {
      const result = await trigger(signInFormValues);
      console.log(result);
      toast.success(result.message);
    } catch (error) {
      console.log(error);
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
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Checking" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
