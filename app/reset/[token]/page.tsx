"use client";
import { fetcher } from "@/api";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import styles from "../../signin/AuthForm.module.css";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { token: string } }) {
  const { trigger } = useSWRMutation(
    `auth/password/reset/${params.token}`,
    (url, { arg }: { arg: any }) => fetcher.post(url, arg)
  );

  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await trigger({ password });
      toast.success("Password reset successfully! Redirecting...");
      router.replace("/");
    } catch (error) {
      toast.error(
        (error as any).response?.data?.message || "An unexpected error occurred"
      );
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">
            New Password
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
          <label className={styles.label} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className={styles.input}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
          />
        </div>
        <button className={styles.submitButton} type="submit">
          {"Submit"}
        </button>
      </form>
    </div>
  );
}
