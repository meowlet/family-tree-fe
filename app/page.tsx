import React from "react";
import { Star, Heart, Calendar } from "lucide-react";
import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>Family Tree Management</h1>
        <p className={styles.bannerSubtitle}>
          The worst family tree management website ever
        </p>
        <button className={styles.bannerButton}>
          <Calendar className={styles.buttonIcon} />
          Make your own tree now
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button className={`${styles.button} ${styles.buttonPrimary}`}>
          Feedback
        </button>
        <button className={`${styles.button} ${styles.buttonSecondary}`}>
          Coming soon
        </button>
      </div>

      <UserCard name="Chúc Nguyệt" joinDate="22/2/2022" />
      <UserCard name="Hạ Minh" joinDate="13/6/2023" />
    </main>
  );
};

const UserCard = ({ name, joinDate }: { name: string; joinDate: string }) => (
  <div className={styles.userCard}>
    <div className={styles.userAvatar}>
      <div className={styles.avatarShape}></div>
    </div>
    <div className={styles.userInfo}>
      <h2 className={styles.userName}>{name}</h2>
      <p className={styles.userJoinDate}>Joined {joinDate}</p>
      <p className={styles.userDescription}>
        Supporting line text lorem ipsum dolor sit amet, consectetur.
      </p>
    </div>
    <div className={styles.userActions}>
      <div className={styles.starRating}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={styles.starIcon} />
        ))}
      </div>
      <Heart size={24} className={styles.heartIcon} />
    </div>
  </div>
);

export default HomePage;
