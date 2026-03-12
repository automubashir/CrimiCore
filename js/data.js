/* ================================================================
   CrimiCore - Criminal Records Data
   Dummy data for development & data service layer
   ================================================================ */

const CRIMINALS_DATA = [
  {
    id: "CR-1024",
    name: "John Miller",
    age: 35,
    dateOfBirth: "1990-08-14",
    gender: "Male",
    crime: "Burglary",
    status: "Active",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    alias: "Johnny the Fox",
    address: "1234 Maple Street, Los Angeles, CA",
    height: "6'1\"",
    weight: "180 lbs",
    eyeColor: "Brown",
    hairColor: "Dark Brown",
    nationality: "American",
    distinguishingMarks: ["Scar on left cheek", "Tribal tattoo on right forearm"],
    crimes: ["Burglary", "Grand Theft Auto", "Assault", "Possession of Stolen Property"],
    gangAffiliation: "Fox Street Gang",
    knownAssociates: [
      { name: "Jake Rogers", relation: "Partner in crime" },
      { name: "Mike 'The Snake' Smith", relation: "Fence" }
    ],
    previousConvictions: [
      { crime: "Burglary", year: 2018 },
      { crime: "Assault", year: 2016 },
      { crime: "Drug Possession", year: 2014 }
    ],
    additionalInfo: [
      "Currently under surveillance",
      "Considered armed and dangerous",
      "Multiple warrants outstanding"
    ],
    riskLevel: "High",
    lastKnownLocation: "Downtown Los Angeles, CA",
    warrants: ["Burglary - LAPD Case #45892", "Parole Violation - CA DOJ"]
  },
  {
    id: "CR-2156",
    name: "Steve Johnson",
    age: 42,
    dateOfBirth: "1983-03-22",
    gender: "Male",
    crime: "Drug Trafficking",
    status: "Arrested",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    alias: "Big Steve",
    address: "789 Hill Road, Miami, FL",
    height: "5'11\"",
    weight: "210 lbs",
    eyeColor: "Blue",
    hairColor: "Blonde",
    nationality: "American",
    distinguishingMarks: ["Dragon tattoo on chest", "Missing right pinky finger"],
    crimes: ["Drug Trafficking", "Money Laundering", "Possession with Intent"],
    gangAffiliation: "North Cartel",
    knownAssociates: [
      { name: "Carlos Rivera", relation: "Supplier" },
      { name: "Tommy Wells", relation: "Distributor" }
    ],
    previousConvictions: [
      { crime: "Drug Possession", year: 2020 },
      { crime: "Assault", year: 2017 },
      { crime: "DUI", year: 2012 }
    ],
    additionalInfo: [
      "Arrested during undercover sting operation",
      "Cooperating with federal authorities",
      "Bail set at $500,000"
    ],
    riskLevel: "Medium",
    lastKnownLocation: "Miami-Dade County Jail, FL",
    warrants: []
  },
  {
    id: "CR-3089",
    name: "Lisa Carter",
    age: 29,
    dateOfBirth: "1996-11-05",
    gender: "Female",
    crime: "Fraud",
    status: "Active",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    alias: "The Chameleon",
    address: "456 Lake Avenue, New York, NY",
    height: "5'6\"",
    weight: "130 lbs",
    eyeColor: "Green",
    hairColor: "Red",
    nationality: "American",
    distinguishingMarks: ["Small butterfly tattoo on ankle"],
    crimes: ["Wire Fraud", "Identity Theft", "Credit Card Fraud", "Forgery"],
    gangAffiliation: "None",
    knownAssociates: [
      { name: "Derek Simmons", relation: "Tech expert" },
      { name: "Natalie Brooks", relation: "Document forger" }
    ],
    previousConvictions: [
      { crime: "Identity Theft", year: 2022 },
      { crime: "Credit Card Fraud", year: 2019 }
    ],
    additionalInfo: [
      "Known to use multiple fake identities",
      "Estimated $2.3M in fraudulent transactions",
      "FBI Most Wanted - White Collar Division"
    ],
    riskLevel: "Medium",
    lastKnownLocation: "Manhattan, New York, NY",
    warrants: ["Wire Fraud - FBI Case #WC-78421"]
  },
  {
    id: "CR-4075",
    name: "David Brown",
    age: 38,
    dateOfBirth: "1987-06-30",
    gender: "Male",
    crime: "Assault",
    status: "Wanted",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    alias: "Iron Fist",
    address: "Unknown",
    height: "6'3\"",
    weight: "225 lbs",
    eyeColor: "Brown",
    hairColor: "Black",
    nationality: "American",
    distinguishingMarks: ["Full sleeve tattoos on both arms", "Scar across nose bridge", "Cauliflower left ear"],
    crimes: ["Aggravated Assault", "Battery", "Intimidation"],
    gangAffiliation: "East Side Wolves",
    knownAssociates: [
      { name: "Marcus 'Tank' Williams", relation: "Gang member" },
      { name: "Eddie Russo", relation: "Gang leader" }
    ],
    previousConvictions: [
      { crime: "Assault", year: 2021 },
      { crime: "Battery", year: 2019 },
      { crime: "Disorderly Conduct", year: 2015 },
      { crime: "Assault", year: 2013 }
    ],
    additionalInfo: [
      "Escaped during prisoner transport",
      "Extremely dangerous - do not approach alone",
      "Known to frequent underground fight clubs",
      "Last seen heading toward the Canadian border"
    ],
    riskLevel: "Critical",
    lastKnownLocation: "Last seen near Detroit, MI",
    warrants: ["Aggravated Assault - DPD Case #AG-2234", "Escape from Custody - US Marshals"]
  },
  {
    id: "CR-5192",
    name: "Michael Harris",
    age: 45,
    dateOfBirth: "1980-01-17",
    gender: "Male",
    crime: "Armed Robbery",
    status: "Imprisoned",
    photo: "https://randomuser.me/api/portraits/men/52.jpg",
    alias: "Smooth Mike",
    address: "Federal Correctional Complex, Beaumont, TX",
    height: "5'10\"",
    weight: "175 lbs",
    eyeColor: "Hazel",
    hairColor: "Grey",
    nationality: "American",
    distinguishingMarks: ["Teardrop tattoo under left eye", "Rose tattoo on neck"],
    crimes: ["Armed Robbery", "Possession of Illegal Firearms", "Carjacking"],
    gangAffiliation: "None",
    knownAssociates: [
      { name: "Victor 'Vince' Hernandez", relation: "Getaway driver" },
      { name: "Billy 'The Kid' Turner", relation: "Accomplice" }
    ],
    previousConvictions: [
      { crime: "Armed Robbery", year: 2023 },
      { crime: "Robbery", year: 2015 },
      { crime: "Grand Theft Auto", year: 2010 },
      { crime: "Burglary", year: 2005 }
    ],
    additionalInfo: [
      "Serving 25-year sentence",
      "Robbed 12 banks across 3 states",
      "No possibility of parole until 2040"
    ],
    riskLevel: "High",
    lastKnownLocation: "FCC Beaumont, Texas",
    warrants: []
  },
  {
    id: "CR-6286",
    name: "Emily Davis",
    age: 31,
    dateOfBirth: "1994-09-12",
    gender: "Female",
    crime: "Homicide",
    status: "Active",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    alias: "Ghost",
    address: "Unknown",
    height: "5'7\"",
    weight: "135 lbs",
    eyeColor: "Blue",
    hairColor: "Blonde",
    nationality: "American",
    distinguishingMarks: ["Small mole above upper lip", "Pierced left eyebrow"],
    crimes: ["Second Degree Murder", "Conspiracy to Commit Murder"],
    gangAffiliation: "None",
    knownAssociates: [
      { name: "Richard 'Richie' Cole", relation: "Ex-boyfriend / suspected accomplice" }
    ],
    previousConvictions: [],
    additionalInfo: [
      "No prior criminal record",
      "Disappeared after the incident",
      "Considered a flight risk",
      "May have left the country"
    ],
    riskLevel: "High",
    lastKnownLocation: "Last seen at LAX Airport, Los Angeles, CA",
    warrants: ["Murder 2nd Degree - LAPD Case #HM-11203"]
  },
  {
    id: "CR-7340",
    name: "Ryan Wilson",
    age: 40,
    dateOfBirth: "1985-12-03",
    gender: "Male",
    crime: "Theft",
    status: "Parole",
    photo: "https://randomuser.me/api/portraits/men/22.jpg",
    alias: "Slick",
    address: "2100 Pine Street, Chicago, IL",
    height: "5'9\"",
    weight: "165 lbs",
    eyeColor: "Green",
    hairColor: "Brown",
    nationality: "American",
    distinguishingMarks: ["Compass tattoo on wrist"],
    crimes: ["Grand Theft", "Petty Theft", "Receiving Stolen Goods"],
    gangAffiliation: "None",
    knownAssociates: [
      { name: "Paul 'Paulie' DeLuca", relation: "Fence" },
      { name: "Amanda Chen", relation: "Lookout" }
    ],
    previousConvictions: [
      { crime: "Grand Theft", year: 2021 },
      { crime: "Petty Theft", year: 2018 },
      { crime: "Shoplifting", year: 2015 }
    ],
    additionalInfo: [
      "Currently on parole - supervised release",
      "Required to check in weekly with parole officer",
      "Employed at local warehouse"
    ],
    riskLevel: "Low",
    lastKnownLocation: "Chicago, IL",
    warrants: []
  },
  {
    id: "CR-8412",
    name: "Sarah Martinez",
    age: 27,
    dateOfBirth: "1998-04-20",
    gender: "Female",
    crime: "Cybercrime",
    status: "Active",
    photo: "https://randomuser.me/api/portraits/women/28.jpg",
    alias: "Byte",
    address: "Unknown - operates remotely",
    height: "5'4\"",
    weight: "120 lbs",
    eyeColor: "Brown",
    hairColor: "Black",
    nationality: "American",
    distinguishingMarks: ["Binary code tattoo on inner forearm"],
    crimes: ["Computer Fraud", "Unauthorized Access", "Data Theft", "Ransomware Deployment"],
    gangAffiliation: "Shadow Net Collective",
    knownAssociates: [
      { name: "Alex 'Zero' Petrov", relation: "Hacker group leader" },
      { name: "Unknown alias 'Phantom'", relation: "Dark web facilitator" }
    ],
    previousConvictions: [
      { crime: "Unauthorized Computer Access", year: 2022 }
    ],
    additionalInfo: [
      "Suspected in major corporate data breaches",
      "Estimated damages exceed $15M",
      "Uses cryptocurrency for all transactions",
      "FBI Cyber Division actively investigating"
    ],
    riskLevel: "High",
    lastKnownLocation: "IP traced to Seattle, WA area",
    warrants: ["Computer Fraud - FBI Case #CD-90112"]
  },
  {
    id: "CR-9501",
    name: "James Anderson",
    age: 52,
    dateOfBirth: "1973-07-08",
    gender: "Male",
    crime: "Money Laundering",
    status: "Arrested",
    photo: "https://randomuser.me/api/portraits/men/62.jpg",
    alias: "The Banker",
    address: "8800 Ocean Drive, San Diego, CA",
    height: "5'8\"",
    weight: "190 lbs",
    eyeColor: "Grey",
    hairColor: "Silver",
    nationality: "American",
    distinguishingMarks: ["None visible"],
    crimes: ["Money Laundering", "Tax Evasion", "Racketeering"],
    gangAffiliation: "None - Independent operator",
    knownAssociates: [
      { name: "Vincent Moretti", relation: "Client" },
      { name: "Diana Cho", relation: "Accountant" },
      { name: "Frank 'Numbers' Rossi", relation: "Business partner" }
    ],
    previousConvictions: [
      { crime: "Tax Evasion", year: 2019 }
    ],
    additionalInfo: [
      "Former investment banker at major firm",
      "Laundered estimated $40M through shell companies",
      "Cooperating with IRS investigation",
      "Assets frozen pending trial"
    ],
    riskLevel: "Low",
    lastKnownLocation: "San Diego County Jail, CA",
    warrants: []
  },
  {
    id: "CR-1067",
    name: "Maria Garcia",
    age: 33,
    dateOfBirth: "1992-05-15",
    gender: "Female",
    crime: "Kidnapping",
    status: "Wanted",
    photo: "https://randomuser.me/api/portraits/women/55.jpg",
    alias: "La Sombra",
    address: "Unknown",
    height: "5'5\"",
    weight: "140 lbs",
    eyeColor: "Brown",
    hairColor: "Black",
    nationality: "Mexican-American",
    distinguishingMarks: ["Rose tattoo behind left ear", "Small scar on chin"],
    crimes: ["Kidnapping", "Extortion", "Human Trafficking"],
    gangAffiliation: "Sombra Cartel",
    knownAssociates: [
      { name: "Javier 'El Lobo' Mendez", relation: "Cartel lieutenant" },
      { name: "Rosa Alvarez", relation: "Recruiter" }
    ],
    previousConvictions: [
      { crime: "Extortion", year: 2020 },
      { crime: "Assault", year: 2017 }
    ],
    additionalInfo: [
      "INTERPOL Red Notice issued",
      "Suspected in 5 kidnapping cases across border states",
      "Known to travel between US and Mexico frequently",
      "Armed and extremely dangerous"
    ],
    riskLevel: "Critical",
    lastKnownLocation: "Last seen in El Paso, TX border area",
    warrants: ["Kidnapping - FBI Case #FK-33201", "INTERPOL Red Notice #A-4521"]
  },
  {
    id: "CR-1158",
    name: "Robert Taylor",
    age: 47,
    dateOfBirth: "1978-10-25",
    gender: "Male",
    crime: "Arson",
    status: "Imprisoned",
    photo: "https://randomuser.me/api/portraits/men/85.jpg",
    alias: "Torch",
    address: "State Correctional Institution, Phoenix, AZ",
    height: "6'0\"",
    weight: "195 lbs",
    eyeColor: "Brown",
    hairColor: "Bald",
    nationality: "American",
    distinguishingMarks: ["Flame tattoo on right hand", "Burn scars on left arm"],
    crimes: ["Arson", "Destruction of Property", "Insurance Fraud"],
    gangAffiliation: "None",
    knownAssociates: [
      { name: "Dennis Price", relation: "Insurance agent (co-conspirator)" }
    ],
    previousConvictions: [
      { crime: "Arson", year: 2022 },
      { crime: "Destruction of Property", year: 2018 },
      { crime: "Arson", year: 2014 }
    ],
    additionalInfo: [
      "Serial arsonist - convicted of setting 8 fires",
      "Serving 15-year sentence",
      "Required psychiatric evaluation"
    ],
    riskLevel: "High",
    lastKnownLocation: "SCI Phoenix, Arizona",
    warrants: []
  },
  {
    id: "CR-1243",
    name: "Nicole White",
    age: 36,
    dateOfBirth: "1989-02-18",
    gender: "Female",
    crime: "Extortion",
    status: "Active",
    photo: "https://randomuser.me/api/portraits/women/36.jpg",
    alias: "Ice Queen",
    address: "1500 Sunset Blvd, Las Vegas, NV",
    height: "5'8\"",
    weight: "145 lbs",
    eyeColor: "Blue",
    hairColor: "Platinum Blonde",
    nationality: "American",
    distinguishingMarks: ["Crown tattoo on back of neck"],
    crimes: ["Extortion", "Blackmail", "Wire Fraud"],
    gangAffiliation: "None",
    knownAssociates: [
      { name: "Tony 'Smooth' Valentino", relation: "Casino contact" },
      { name: "Crystal Moore", relation: "Information gatherer" }
    ],
    previousConvictions: [
      { crime: "Blackmail", year: 2021 }
    ],
    additionalInfo: [
      "Targets high-profile businessmen and politicians",
      "Uses hidden cameras and recording devices",
      "Has offshore accounts in multiple countries"
    ],
    riskLevel: "Medium",
    lastKnownLocation: "Las Vegas Strip area, NV",
    warrants: ["Extortion - LVMPD Case #EX-7890"]
  },
  {
    id: "CR-1337",
    name: "Daniel Lee",
    age: 28,
    dateOfBirth: "1997-11-30",
    gender: "Male",
    crime: "Drug Trafficking",
    status: "Wanted",
    photo: "https://randomuser.me/api/portraits/men/35.jpg",
    alias: "Dragon",
    address: "Unknown",
    height: "5'7\"",
    weight: "155 lbs",
    eyeColor: "Brown",
    hairColor: "Black",
    nationality: "Korean-American",
    distinguishingMarks: ["Dragon tattoo covering entire back", "Pierced both ears"],
    crimes: ["Drug Trafficking", "Possession with Intent to Distribute", "Illegal Firearm Possession"],
    gangAffiliation: "Dragon Boys",
    knownAssociates: [
      { name: "Kevin 'K-Pop' Park", relation: "Gang member" },
      { name: "Johnny Tran", relation: "Supplier" },
      { name: "Lisa 'Lucky' Kwon", relation: "Courier" }
    ],
    previousConvictions: [
      { crime: "Drug Possession", year: 2023 },
      { crime: "Illegal Firearm", year: 2021 }
    ],
    additionalInfo: [
      "Failed to appear for court hearing",
      "Bench warrant issued",
      "Known to operate in Koreatown, LA area",
      "May be armed"
    ],
    riskLevel: "High",
    lastKnownLocation: "Koreatown, Los Angeles, CA",
    warrants: ["Drug Trafficking - DEA Case #DT-55012", "Failure to Appear - LA Superior Court"]
  },
  {
    id: "CR-1429",
    name: "Jessica Thomas",
    age: 39,
    dateOfBirth: "1986-08-09",
    gender: "Female",
    crime: "Fraud",
    status: "Parole",
    photo: "https://randomuser.me/api/portraits/women/72.jpg",
    alias: "The Architect",
    address: "3400 Peachtree Road, Atlanta, GA",
    height: "5'6\"",
    weight: "135 lbs",
    eyeColor: "Hazel",
    hairColor: "Auburn",
    nationality: "American",
    distinguishingMarks: ["None visible"],
    crimes: ["Securities Fraud", "Insider Trading", "Ponzi Scheme"],
    gangAffiliation: "None",
    knownAssociates: [
      { name: "Robert Chen", relation: "Former business partner" },
      { name: "Margaret Sullivan", relation: "Attorney" }
    ],
    previousConvictions: [
      { crime: "Securities Fraud", year: 2022 },
      { crime: "Insider Trading", year: 2022 }
    ],
    additionalInfo: [
      "Former hedge fund manager",
      "Defrauded investors of $18M",
      "Currently on supervised release",
      "Electronic ankle monitoring active"
    ],
    riskLevel: "Low",
    lastKnownLocation: "Atlanta, GA",
    warrants: []
  },
  {
    id: "CR-1520",
    name: "Kevin Jackson",
    age: 44,
    dateOfBirth: "1981-04-12",
    gender: "Male",
    crime: "Armed Robbery",
    status: "Arrested",
    photo: "https://randomuser.me/api/portraits/men/91.jpg",
    alias: "K-Jack",
    address: "Houston County Jail, Houston, TX",
    height: "6'2\"",
    weight: "200 lbs",
    eyeColor: "Brown",
    hairColor: "Black",
    nationality: "American",
    distinguishingMarks: ["Skull tattoo on left bicep", "Gold front tooth"],
    crimes: ["Armed Robbery", "Assault with Deadly Weapon", "Carjacking"],
    gangAffiliation: "South Side Crew",
    knownAssociates: [
      { name: "Marcus 'Big M' Johnson", relation: "Gang leader" },
      { name: "Darius White", relation: "Accomplice" }
    ],
    previousConvictions: [
      { crime: "Robbery", year: 2020 },
      { crime: "Assault", year: 2016 },
      { crime: "Grand Theft Auto", year: 2011 }
    ],
    additionalInfo: [
      "Arrested after high-speed chase",
      "Awaiting trial - no bail",
      "Three-strike candidate"
    ],
    riskLevel: "High",
    lastKnownLocation: "Houston County Jail, TX",
    warrants: []
  }
];


/* ================================================================
   Gang Data
   Derived from criminal records + additional intelligence
   ================================================================ */
const GANGS_DATA = [
  {
    id: "GNG-001",
    name: "Fox Street Gang",
    leader: "Eddie 'The Fox' Morales",
    leaderAlias: "The Fox",
    foundedYear: 2008,
    territory: "Downtown Los Angeles, CA",
    status: "Active",
    threatLevel: "High",
    memberCount: 45,
    primaryCrimes: ["Burglary", "Grand Theft Auto", "Assault"],
    knownMembers: ["John Miller", "Jake Rogers", "Mike 'The Snake' Smith"],
    associatedCriminals: ["CR-1024"],
    description: "Street-level gang specializing in burglary rings and auto theft operations across the Greater LA area.",
    lastActivity: "2025-11-20",
    allies: ["South Side Crew"],
    rivals: ["East Side Wolves", "Dragon Boys"]
  },
  {
    id: "GNG-002",
    name: "North Cartel",
    leader: "Carlos 'El Jefe' Rivera",
    leaderAlias: "El Jefe",
    foundedYear: 2001,
    territory: "Miami, FL & Southeast US",
    status: "Under Investigation",
    threatLevel: "Critical",
    memberCount: 120,
    primaryCrimes: ["Drug Trafficking", "Money Laundering", "Racketeering"],
    knownMembers: ["Steve Johnson", "Carlos Rivera", "Tommy Wells"],
    associatedCriminals: ["CR-2156"],
    description: "Major drug trafficking organization with international supply lines. Under active federal investigation.",
    lastActivity: "2026-01-15",
    allies: ["Sombra Cartel"],
    rivals: []
  },
  {
    id: "GNG-003",
    name: "East Side Wolves",
    leader: "Eddie Russo",
    leaderAlias: "The Alpha",
    foundedYear: 2012,
    territory: "Detroit, MI",
    status: "Active",
    threatLevel: "Critical",
    memberCount: 60,
    primaryCrimes: ["Aggravated Assault", "Intimidation", "Extortion"],
    knownMembers: ["David Brown", "Marcus 'Tank' Williams", "Eddie Russo"],
    associatedCriminals: ["CR-4075"],
    description: "Violent gang known for territory enforcement and underground fight operations. Leader is a fugitive.",
    lastActivity: "2026-02-28",
    allies: [],
    rivals: ["Fox Street Gang", "South Side Crew"]
  },
  {
    id: "GNG-004",
    name: "Shadow Net Collective",
    leader: "Alex 'Zero' Petrov",
    leaderAlias: "Zero",
    foundedYear: 2019,
    territory: "Online / Seattle, WA (base)",
    status: "Active",
    threatLevel: "High",
    memberCount: 18,
    primaryCrimes: ["Cybercrime", "Ransomware", "Data Theft"],
    knownMembers: ["Sarah Martinez", "Alex 'Zero' Petrov", "Phantom"],
    associatedCriminals: ["CR-8412"],
    description: "Decentralized hacking collective responsible for major corporate breaches. Operates primarily through encrypted channels.",
    lastActivity: "2026-03-01",
    allies: [],
    rivals: []
  },
  {
    id: "GNG-005",
    name: "Sombra Cartel",
    leader: "Javier 'El Lobo' Mendez",
    leaderAlias: "El Lobo",
    foundedYear: 1998,
    territory: "El Paso, TX & US-Mexico Border",
    status: "Active",
    threatLevel: "Critical",
    memberCount: 200,
    primaryCrimes: ["Kidnapping", "Human Trafficking", "Extortion"],
    knownMembers: ["Maria Garcia", "Javier 'El Lobo' Mendez", "Rosa Alvarez"],
    associatedCriminals: ["CR-1067"],
    description: "Cross-border cartel with INTERPOL Red Notices. Involved in kidnapping and human trafficking operations spanning multiple states.",
    lastActivity: "2026-02-10",
    allies: ["North Cartel"],
    rivals: []
  },
  {
    id: "GNG-006",
    name: "Dragon Boys",
    leader: "Kevin 'K-Pop' Park",
    leaderAlias: "K-Pop",
    foundedYear: 2015,
    territory: "Koreatown, Los Angeles, CA",
    status: "Active",
    threatLevel: "High",
    memberCount: 30,
    primaryCrimes: ["Drug Trafficking", "Illegal Firearms", "Racketeering"],
    knownMembers: ["Daniel Lee", "Kevin 'K-Pop' Park", "Johnny Tran", "Lisa 'Lucky' Kwon"],
    associatedCriminals: ["CR-1337"],
    description: "Organized gang operating in the Koreatown district. Involved in drug distribution and illegal arms trade.",
    lastActivity: "2025-12-05",
    allies: [],
    rivals: ["Fox Street Gang"]
  },
  {
    id: "GNG-007",
    name: "South Side Crew",
    leader: "Marcus 'Big M' Johnson",
    leaderAlias: "Big M",
    foundedYear: 2010,
    territory: "Houston, TX",
    status: "Disrupted",
    threatLevel: "Medium",
    memberCount: 25,
    primaryCrimes: ["Armed Robbery", "Carjacking", "Assault"],
    knownMembers: ["Kevin Jackson", "Marcus 'Big M' Johnson", "Darius White"],
    associatedCriminals: ["CR-1520"],
    description: "Street gang focused on armed robberies and carjacking. Multiple key members recently arrested.",
    lastActivity: "2025-10-18",
    allies: ["Fox Street Gang"],
    rivals: ["East Side Wolves"]
  }
];


/* ================================================================
   Data Service
   Handles switching between dummy data and API
   ================================================================ */
const DataService = {
  useAPI: false,
  apiBaseURL: '/api',  // Configure your API base URL here
  loadDelay: 1200,     // Simulated loading delay (ms) for skeleton demo

  async getCriminals() {
    if (this.useAPI) {
      return this._fetchFromAPI('/criminals');
    }
    // Simulate network delay to showcase skeleton loading
    await this._delay(this.loadDelay);
    return [...CRIMINALS_DATA];
  },

  async getGangs() {
    if (this.useAPI) {
      return this._fetchFromAPI('/gangs');
    }
    await this._delay(this.loadDelay);
    return [...GANGS_DATA];
  },

  async getGangById(id) {
    if (this.useAPI) {
      return this._fetchFromAPI(`/gangs/${id}`);
    }
    await this._delay(this.loadDelay);
    const gang = GANGS_DATA.find(g => g.id === id);
    return gang ? { ...gang } : null;
  },

  async getCriminalById(id) {
    if (this.useAPI) {
      return this._fetchFromAPI(`/criminals/${id}`);
    }
    await this._delay(this.loadDelay);
    const criminal = CRIMINALS_DATA.find(c => c.id === id);
    return criminal ? { ...criminal } : null;
  },

  async _fetchFromAPI(endpoint) {
    try {
      const response = await fetch(this.apiBaseURL + endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to fetch from API. Please check your API configuration or switch to dummy data.');
    }
  },

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  toggleSource(useAPI) {
    this.useAPI = useAPI;
  }
};
