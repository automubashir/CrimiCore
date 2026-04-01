import { useCountryFilter } from '../../context/CountryFilterContext';
import ThemeChanger from '../ui/ThemeChanger';

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
            <option value="Pakistan">Pakistan</option>
            <option value="United States">United States</option>
            <option value="India">India</option>
            <option value="Iran">Iran</option>
            <option value="Uae">Uae</option>
            <option value="Iraq">Iraq</option>
            <option value="Lebanon">Lebanon</option>
            <option value="Syria">Syria</option>
            <option value="Uk">Uk</option>
            <option value="Morocco">Morocco</option>
            <option value="Algeria">Algeria</option>
            <option value="Africa">Africa</option>
            <option value="Angola">Angola</option>
            <option value="Benin">Benin</option>
            <option value="Botswana">Botswana</option>
            <option value="Burkina Faso">Burkina Faso</option>
            <option value="Burundi">Burundi</option>
            <option value="Cabo Verde">Cabo Verde</option>
            <option value="Cameroon">Cameroon</option>
            <option value="Central African Republic">Central African Republic</option>
            <option value="Chad">Chad</option>
            <option value="Comoros">Comoros</option>
            <option value="Congo (Congo-Brazzaville)">Congo (Congo-Brazzaville)</option>
            <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
            <option value="Djibouti">Djibouti</option>
            <option value="Egypt">Egypt</option>
            <option value="Equatorial Guinea">Equatorial Guinea</option>
            <option value="Eritrea">Eritrea</option>
            <option value="Eswatini">Eswatini</option>
            <option value="Ethiopia">Ethiopia</option>
            <option value="Gabon">Gabon</option>
            <option value="Gambia">Gambia</option>
            <option value="Ghana">Ghana</option>
            <option value="Guinea">Guinea</option>
            <option value="Guinea-Bissau">Guinea-Bissau</option>
            <option value="Ivory Coast">Ivory Coast</option>
            <option value="Kenya">Kenya</option>
            <option value="Lesotho">Lesotho</option>
            <option value="Liberia">Liberia</option>
            <option value="Libya">Libya</option>
            <option value="Madagascar">Madagascar</option>
            <option value="Malawi">Malawi</option>
            <option value="Mali">Mali</option>
            <option value="Mauritania">Mauritania</option>
            <option value="Mauritius">Mauritius</option>
            <option value="Mozambique">Mozambique</option>
            <option value="Namibia">Namibia</option>
            <option value="Niger">Niger</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Sao Tome and Principe">Sao Tome and Principe</option>
            <option value="Senegal">Senegal</option>
            <option value="Seychelles">Seychelles</option>
            <option value="Sierra Leone">Sierra Leone</option>
            <option value="Somalia">Somalia</option>
            <option value="South Africa">South Africa</option>
            <option value="South Sudan">South Sudan</option>
            <option value="Sudan">Sudan</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Togo">Togo</option>
            <option value="Tunisia">Tunisia</option>
            <option value="Uganda">Uganda</option>
            <option value="Zambia">Zambia</option>
            <option value="Zimbabwe">Zimbabwe</option>
          </select>
        </div>
        <ThemeChanger />
      </div>
    </div>
  );
}
