import { useCountryFilter } from '../../context/CountryFilterContext';

export default function Topbar({ title }) {
  const { country, setCountry } = useCountryFilter();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="country-filter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <select
            className="country-select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="All">All Countries</option>
            <option value="uae">UAE</option>
            <option value="uk">UK</option>
          </select>
        </div>
      </div>
    </div>
  );
}
