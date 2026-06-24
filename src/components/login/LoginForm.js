"use client";

import { useState } from "react";
import Image from '@/components/ui/Image/Image';
import { login } from "@/app/(auth)/login/actions";
import styles from "./LoginForm.module.css";
import logoMain from "@/assets/images/logo-main.png";

const UserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.success) {
        window.location.replace('/');
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Image
          src={logoMain}
          alt="CrimePanel"
          width={80}
          height={80}
          className={styles.cardLogo}
        />
        <h2 className={styles.cardTitle}>Welcome Back</h2>
        <p className={styles.cardSubtitle}>Sign in to access the CrimePanel</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="cp-email">
            Username / Email
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIconLeft}>
              <UserIcon />
            </span>
            <input
              id="cp-email"
              type="text"
              className={styles.input}
              placeholder="Enter your email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="cp-password">
            Password
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIconLeft}>
              <LockIcon />
            </span>
            <input
              id="cp-password"
              type={showPassword ? "text" : "password"}
              className={`${styles.input} ${styles.inputWithRight}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className={styles.formOptions}>
          <label className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <span className={styles.checkboxLabel}>Remember Me</span>
          </label>
          <a href="/forgot-password" className={styles.forgotLink}>
            Forgot Password
          </a>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loadingContent}>
              <span className={styles.spinner} />
              Signing in...
            </span>
          ) : (
            "Sign in →"
          )}
        </button>
      </form>

      <div className={styles.cardFooter}>
        <LockIcon />
        <span>Secured with end-to-end encryption</span>
      </div>
    </div>
  );
}
