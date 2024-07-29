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
  data: {
    _id: string;
    familyTree: string;
    user: User;
    parentNode: string;
    spouse: string;
    gender: boolean;
    birthDate: string;
    deathDate: string;
    marriageDate: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export function NodeInfo(props: { nodeId: string }) {
  const router = useRouter();

  const { data, error } = useSWR<any>("node/" + props.nodeId, fetcher.get);

  console.log(data);

  if (error)
    return <div className={styles.error}>Failed to load user data</div>;
  if (!data) return <div className={styles.loading}>Loading...</div>;

  const user = data.data.user;
  const node = data.data;

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
        <h1 className={styles.title}>Infomation</h1>
      </div>
      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>Full Name:</span>
          <span className={styles.value}>{user ? user.fullName : "N/A"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Username:</span>
          <span className={styles.value}>{user ? user.userName : "N/A"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{user ? user.email : "N/A"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Gender:</span>
          <span className={styles.value}>
            {node.gender ? "Male" : "Female"}
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Birth Date:</span>
          <span className={styles.value}>
            {node.birthDate
              ? new Date(node.birthDate).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Death Date:</span>
          <span className={styles.value}>
            {node.deathDate
              ? new Date(node.deathDate).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Marriage Date:</span>
          <span className={styles.value}>
            {node.marriageDate
              ? new Date(node.marriageDate).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Member Since:</span>
          <span className={styles.value}>
            {new Date(user?.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {/* <button className={styles.logoutButton} onClick={handleLogout}>
        <LogOut className={styles.buttonIcon} />
        Logout
      </button> */}
    </div>
  );
}

export default NodeInfo;
