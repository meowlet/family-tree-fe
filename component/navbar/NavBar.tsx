"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { usePathname } from "next/navigation";
import Auth from "@/util/Auth";
import {
  Heart,
  Home,
  LogIn,
  Menu,
  MoreHorizontal,
  Star,
  TreePalm,
  UserPlus,
} from "lucide-react";

export function Navbar() {
  const pathName = usePathname();
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    setHasUser(Auth.getToken() !== undefined);
  }, []);

  const navItemsAuth = [
    { text: "Home", href: "/", icon: <Home size={24} /> },
    { text: "Trees", href: "/tree", icon: <TreePalm size={24} /> },
    { text: "My Account", href: "/me", icon: <Star size={24} /> },
  ];

  const navItemsNoAuth = [
    { text: "Home", href: "/", icon: <Home size={24} /> },
    { text: "Login", href: "/signin", icon: <LogIn size={24} /> },
    { text: "Register", href: "/signup", icon: <UserPlus size={24} /> },
  ];

  return (
    <div className={styles.navbar}>
      <button className={styles.menuButton}>
        <Menu />
      </button>
      <ul className={styles.navList}>
        {(hasUser ? navItemsAuth : navItemsNoAuth).map((item) => (
          <li
            key={item.href}
            className={`${styles.navItem} ${
              item.href === "/" && pathName === item.href
                ? styles.active
                : pathName.startsWith(item.href) && item.href !== "/"
                ? styles.active
                : ""
            }`}
          >
            <Link href={item.href} className={styles.navLink}>
              <div>{item.icon}</div>
              <span className={styles.navText}>{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
