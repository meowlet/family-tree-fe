"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../signin/./AuthForm.module.css";
import { fetcher } from "@/api";
import Auth from "@/util/Auth";
import { SignUpFormSchema } from "@/util/Type";
import toast from "react-hot-toast";
import useSWRMutation from "swr/mutation";

export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { trigger } = useSWRMutation(
    "auth/signup",
    (url, { arg }: { arg: any }) => fetcher.post(url, arg)
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const signUpFormValues = {
      userName: formData.get("userName") as string,
      email: formData.get("email") as string,
      fullName: formData.get("fullName") as string,
      password: formData.get("password") as string,
      passwordConfirm: formData.get("passwordConfirm") as string,
    };

    console.log(signUpFormValues);

    const formResult = SignUpFormSchema.safeParse(signUpFormValues);
    if (!formResult.success) {
      let errorMessage = "";
      formResult.error.errors.forEach((error: any) => {
        errorMessage += error.message + "\n";
      });
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    if (signUpFormValues.password !== signUpFormValues.passwordConfirm) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const finalSignUpFormValues = {
        userName: signUpFormValues.userName,
        email: signUpFormValues.email,
        fullName: signUpFormValues.fullName,
        passwordHash: signUpFormValues.password,
      };
      const result = await trigger(finalSignUpFormValues);
      Auth.setToken((result as any).data.token);
      toast.success("Sign up successful! Redirecting...");
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
          <label className={styles.label} htmlFor="userName">
            Username
          </label>
          <input
            className={styles.input}
            type="text"
            id="userName"
            name="userName"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            type="email"
            id="email"
            name="email"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="fullName">
            Full name
          </label>
          <input
            className={styles.input}
            type="text"
            id="fullName"
            name="fullName"
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
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="passwordConfirm">
            Repeat password
          </label>
          <input
            className={`${styles.input} ${error ? styles.errorInput : ""}`}
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            required
          />
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
        <button
          className={styles.submitButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
