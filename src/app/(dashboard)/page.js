"use client"
import StatsGrid from '@/components/dashboard/StatsGrid/StatsGrid'
import styles from './dashboard.module.css'
import SearchInput from '@/components/ui/SearchInput/SearchInput'
import FilterDropdown from '@/components/ui/FilterDropdown/FilterDropdown'
import { useState } from 'react'
import NewsCard from '@/components/dashboard/NewsCard/NewsCard'
import GlobalMap from '@/components/dashboard/GlobalMap/GlobalMap'
import RecentCriminals from '@/components/dashboard/RecentCriminals/RecentCriminals'
import TopGangs from '@/components/dashboard/TopGangs/TopGangs'
import ActivitiesByType from '@/components/dashboard/ActivitiesByType/ActivitiesByType'
import RecentlyAddedCriminals from '@/components/dashboard/RecentlyAddedCriminals/RecentlyAddedCriminals'

export default function HomePage() {
  const countryOptions = [
    'Pakistan',
    'India',
    'United States',
    'United Kingdom',
    'China',
  ]
  const crimeTypeOptions = [
    'All',
    'Murder',
    'Robbery',
    'Theft',
    'Assault',
  ]
  const gangoptions = [
    'All',
    'BlackHawk',
    'WhiteHawk',
    'GreenHawk',
    'BlueHawk', 
  ]
  const criminalOptions = [
    'joseph Smith',
    'james Doe',
    'jane Doe',
    'james Brown',
    'jane Brown',
  ]
  const dateRangeOptions = [
    'All',
    'Last 24 hours',
    'Last 7 days',
    'Last 30 days',
    'Last 90 days',
  ]
  const NEWS = [
  {
    id: 1,
    category: 'drug-trafficking',
    categoryLabel: 'Drug Trafficking',
    time: '6d ago',
    title: 'Mexican Cartel Expands Fentalyl Production in Northern Regions',
    description: 'Intelligence sources reveal a significant increase in fentanyl across Sinaloa and Sonora..',
  },
  {
    id: 2,
    category: 'military-installments',
    categoryLabel: 'Military Installments',
    time: '6d ago',
    title: 'Attack on Military Convoy in Michoacán Leaves 7 Dead',
    description: 'Armed group ambushed a Mexican Army convoy near Aguadilla, Michoacán. Several weapons ....',
  },
  {
    id: 3,
    category: 'procurement',
    categoryLabel: 'Procurement',
    time: '6d ago',
    title: 'Suspicious Drone Procurement by Cartel-Linked Companies',
    description: 'New Documents show multiple front companies purchased industrial drones...',
  },
  {
    id: 4,
    category: 'extortion',
    categoryLabel: 'Extortion',
    time: '2h ago',
    title: 'Business in Guerrero Pay Up to $10K Monthly in Extortion',
    description: 'Local business forces to pay "Quotas" to criminal groups to operate ...',
  },
  {
    id: 5,
    category: 'drug-trafficking',
    categoryLabel: 'Drug Trafficking',
    time: '2h ago',
    title: 'Drug Trafficking in Mexico Increases',
    description: 'Intelligence sources reveal a significant increase in drug trafficking in Mexico...',
  },
  {
    id: 6,
    category: 'extortion',
    categoryLabel: 'Extortion',
    time: '2h ago',
    title: 'Business in Guerrero Pay Up to $10K Monthly in Extortion',
    description: 'Local business forces to pay "Quotas" to criminal groups to operate ...',
  },
]
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCrimeType, setSelectedCrimeType] = useState(null)
  const [selectedGang, setSelectedGang] = useState(null)
  const [selectedCriminal, setSelectedCriminal] = useState(null)
  const [selectedDateRange, setSelectedDateRange] = useState(null)
  return (
    <main className={styles.dashboardWrapper}>
      <StatsGrid />
      <div className={styles.dashboardGrid}>
        <div className={styles.col1}>
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">Recent News</h2>
              <button className="linkButton">View all</button>
            </div>
            <div className="section-card-content">
              <div className={styles.rnBody}>
                <div className={styles.rnSearch}>
                  <SearchInput />
                </div>
                <div className={styles.rnDrops}>
                    <FilterDropdown 
                      label="Country"
                      options={countryOptions}
                      selected={selectedCountry}
                      setSelected={setSelectedCountry}
                    />
                    <FilterDropdown 
                      label="Crime Type"
                      options={crimeTypeOptions}
                      selected={selectedCrimeType}
                      setSelected={setSelectedCrimeType}
                    />
                    <FilterDropdown 
                      label="Gang"
                      options={gangoptions}
                      selected={selectedGang}
                      setSelected={setSelectedGang}
                    />
                    <FilterDropdown 
                      label="Criminal"
                      options={criminalOptions}
                      selected={selectedCriminal}
                      setSelected={setSelectedCriminal}
                    />
                    <FilterDropdown 
                      label="Date Range"
                      options={dateRangeOptions}
                      selected={selectedDateRange}
                      setSelected={setSelectedDateRange}
                    />
                </div>
                <div className={styles.ncsWrapper}>
                  {NEWS.map((item) => (
                    <NewsCard key={item.id} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.col2}><GlobalMap /></div>
        {/* <div className={styles.col3}><RecentCriminals /></div> */}
        <div className={styles.col4}><TopGangs /></div>
        <div className={styles.col5}><ActivitiesByType /></div>
        <div className={styles.col6}><RecentlyAddedCriminals /></div>
      </div>
    </main>
  )
}
