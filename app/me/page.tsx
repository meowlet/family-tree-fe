"use client";
import React from "react";
import useSWR from "swr";
import { LogOut } from "lucide-react";
import styles from "./UserProfile.module.css";
import { useRouter } from "next/navigation";
import { fetcher } from "@/api";
import Auth from "@/util/Auth";

interface User {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: User;
  message: string;
}

const UserProfile: React.FC = () => {
  const router = useRouter();

  const { data, error } = useSWR<any>("user/me", fetcher.get);

  console.log(data);

  if (error)
    return <div className={styles.error}>Failed to load user data</div>;
  if (!data) return <div className={styles.loading}>Loading...</div>;

  const user = data.data;

  const handleLogout = async () => {
    try {
      Auth.removeToken();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Profile</h1>
      </div>
      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>Full Name:</span>
          <span className={styles.value}>{user.fullName}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Username:</span>
          <span className={styles.value}>{user.userName}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Member Since:</span>
          <span className={styles.value}>
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <button className={styles.logoutButton} onClick={handleLogout}>
        <LogOut className={styles.buttonIcon} />
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
