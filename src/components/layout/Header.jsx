import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NavMenu from './NavMenu';
import ThemeChanger from '../ui/ThemeChanger';
import { useCountryFilter } from '../../context/CountryFilterContext';

function useClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function UserMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>User</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`user-menu-chevron${open ? ' user-menu-chevron--open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="user-menu-dropdown animate-scale-in">
          <button className="user-menu-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </button>
          <button className="user-menu-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Settings
          </button>
          <div className="user-menu-divider" />
          <button className="user-menu-item user-menu-item--danger" onClick={() => { setOpen(false); onLogout(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

const countryOptions = [
  { value: 'All', label: 'All Countries' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'United States', label: 'United States' },
  { value: 'India', label: 'India' },
  { value: 'Iran', label: 'Iran' },
  { value: 'Uae', label: 'Uae' },
  { value: 'Iraq', label: 'Iraq' },
  { value: 'Lebanon', label: 'Lebanon' },
  { value: 'Syria', label: 'Syria' },
  { value: 'Uk', label: 'Uk' },
  { value: 'Morocco', label: 'Morocco' },
  { value: 'Algeria', label: 'Algeria' },
  { value: 'Africa', label: 'Africa' },
  { value: 'Angola', label: 'Angola' },
  { value: 'Benin', label: 'Benin' },
  { value: 'Botswana', label: 'Botswana' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'Cabo Verde', label: 'Cabo Verde' },
  { value: 'Cameroon', label: 'Cameroon' },
  { value: 'Central African Republic', label: 'Central African Republic' },
  { value: 'Chad', label: 'Chad' },
  { value: 'Comoros', label: 'Comoros' },
  { value: 'Congo (Congo-Brazzaville)', label: 'Congo (Congo-Brazzaville)' },
  { value: 'Democratic Republic of the Congo', label: 'Democratic Republic of the Congo' },
  { value: 'Djibouti', label: 'Djibouti' },
  { value: 'Egypt', label: 'Egypt' },
  { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
  { value: 'Eritrea', label: 'Eritrea' },
  { value: 'Eswatini', label: 'Eswatini' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Gabon', label: 'Gabon' },
  { value: 'Gambia', label: 'Gambia' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Guinea', label: 'Guinea' },
  { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
  { value: 'Ivory Coast', label: 'Ivory Coast' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Lesotho', label: 'Lesotho' },
  { value: 'Liberia', label: 'Liberia' },
  { value: 'Libya', label: 'Libya' },
  { value: 'Madagascar', label: 'Madagascar' },
  { value: 'Malawi', label: 'Malawi' },
  { value: 'Mali', label: 'Mali' },
  { value: 'Mauritania', label: 'Mauritania' },
  { value: 'Mauritius', label: 'Mauritius' },
  { value: 'Mozambique', label: 'Mozambique' },
  { value: 'Namibia', label: 'Namibia' },
  { value: 'Niger', label: 'Niger' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe' },
  { value: 'Senegal', label: 'Senegal' },
  { value: 'Seychelles', label: 'Seychelles' },
  { value: 'Sierra Leone', label: 'Sierra Leone' },
  { value: 'Somalia', label: 'Somalia' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'South Sudan', label: 'South Sudan' },
  { value: 'Sudan', label: 'Sudan' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Togo', label: 'Togo' },
  { value: 'Tunisia', label: 'Tunisia' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Zambia', label: 'Zambia' },
  { value: 'Zimbabwe', label: 'Zimbabwe' },
];

function CountrySelector() {
  const { country, setCountry } = useCountryFilter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = countryOptions.find((o) => o.value === country) ?? countryOptions[0];

  function handleSelect(value) {
    setCountry(value);
    setOpen(false);
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Country filter"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{selected.label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`user-menu-chevron${open ? ' user-menu-chevron--open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="user-menu-dropdown animate-scale-in">
          {countryOptions.map((opt) => (
            <button
              key={opt.value}
              className={`user-menu-item${country === opt.value ? ' user-menu-item--active' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {opt.label}
              {country === opt.value && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, marginLeft: 'auto', color: 'var(--color-primary)' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({ onLogout }) {
  const time = useClock();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          {/* Brand */}
          <Link to="/" className="header-brand">
            <div className="header-brand-icon">
              <img src="/apple-touch-icon.png" alt="CrimePanel" />
            </div>
            <span className="header-brand-name">CrimePanel</span>
          </Link>

          {/* Center Nav */}
          <div className="header-center">
            <NavMenu />
          </div>

          {/* Right Controls */}
          <div className="header-right">
            <span className="header-time">{time}</span>
            <CountrySelector />
            <UserMenu onLogout={onLogout} />
            {/* <ThemeChanger /> */}

            {/* Hamburger (mobile) */}
            <button
              className="header-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <NavMenu isMobile onItemClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
