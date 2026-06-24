import Image from '@/components/ui/Image/Image';
import styles from "./page.module.css";
import LoginForm from "@/components/login/LoginForm";
import logoFull from "@/assets/images/logo-full.png";
import videoBg from "@/assets/videos/loginVideo.mp4";
import videoBg2 from "@/assets/videos/video2.mp4";
import videoBg3 from "@/assets/videos/video3.mp4";
import lockIcon from "@/assets/images/lock.png";

export const metadata = {
  title: "Sign In | CrimePanel",
  description: "Sign in to access the CrimePanel Crime Intelligence System.",
};

const features = [
  {
    title: "Real-time Intelligence",
    description: "Aggregate data from news social media, and intel sources in real-time",
  },
  {
    title: "Advanced Insights",
    description: "AI Powered correlation and pattern recognition for deeper insights.",
  },
  {
    title: "Security & Reliability",
    description: "Enterprise-grade security ensuring data confidentiality and system integrity.",
  },
];

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <video
        src={videoBg}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className={styles.bgVideo}
      />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Image
            src={logoFull}
            alt="CrimePanel — Crime Intelligence System"
            style={{ height: 64, width: "auto" }}
            priority
          />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.leftSide}>
          <div className={styles.heroSection}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleWhite}>Intelligence</span>
              <span className={styles.heroTitleCyan}>Redefined</span>
            </h1>
            <div className={styles.heroDivider} />
            <p className={styles.heroDescription}>
              Real-time intelligence from multiple sources actionable insights,
              and advanced analytics to combat organized crime worldwide.
            </p>
          </div>

          <div className={styles.features}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.featureItem}>
                <div className={styles.featureIconWrap}>
                  <Image src={lockIcon} alt="" width={36} height={36} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightSide}>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
