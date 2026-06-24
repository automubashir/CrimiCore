import Image from '@/components/ui/Image/Image'
import logo from '@/assets/images/logo-full.png'
import NavLinks from './NavLinks'
import HeaderRight from './HeaderRight'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <Image
        src={logo}
        alt="CrimePanel"
        height={40}
        priority
        className={styles.logo}
      />

      <NavLinks />

      <HeaderRight />
    </header>
  )
}
