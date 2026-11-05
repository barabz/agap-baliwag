# AGAP Baliwag

AGAP Baliwag is a role-based emergency response and dispatch platform designed for barangay and local rescue operations. It connects citizens, rescuers, and administrators through a shared real-time incident workflow—from the first SOS request to team dispatch, live location updates, arrival, and incident resolution.

> This repository is an academic prototype. It should be security-reviewed and tested before use in real emergency operations.

## Key Features

### Citizen portal

- Send categorized emergency requests from a mobile-friendly interface
- Capture precise browser geolocation with a registered-address fallback
- Share updated location data while an incident is active
- Track emergency status and the assigned rescue team
- Cancel an active request when assistance is no longer needed

### Rescuer workspace

- View the active mission, incident details, and citizen location
- Follow mission progress from dispatch to arrival and completion
- Publish the rescue team's live location
- Automatically mark arrival when the team is within the configured distance
- View team members and assigned responsibilities

### Administrator command center

- Monitor alerts and rescue teams in real time
- Dispatch available teams to pending incidents
- View incidents and responder positions on an interactive map
- Resolve or cancel dispatches
- Create, update, and remove rescue teams
- Review incident logs and operational activity

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Create React App |
| Database and realtime updates | Supabase Postgres and Realtime |
| Maps | Leaflet and React Leaflet |
| Icons | Lucide React |
| Browser APIs | Geolocation and Local Storage |

## Application Flow

```text
Citizen sends SOS
       |
       v
Supabase stores and broadcasts the alert
       |
       v
Administrator assigns an available team
       |
       v
Rescuer receives the mission and shares location
       |
       v
Team arrives, completes the response, and closes the incident
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project
- Supabase tables for `alerts`, `teams`, and `logs`

### Installation

```bash
git clone https://github.com/barabz/agap-baliwag.git
cd agap-baliwag
npm install
```

### Supabase configuration

Update `src/supabaseClient.js` with the URL and publishable/anonymous key for your Supabase project:

```js
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

The application expects these core tables:

- `alerts` — SOS details, status, severity, coordinates, and citizen information
- `teams` — rescue team availability, assigned alert, personnel, and coordinates
- `logs` — completed incident and activity history

Enable Supabase Realtime for these tables so changes appear across the citizen, rescuer, and administrator interfaces.

### Run locally

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
```

The optimized application will be generated in `build/`.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Run the development server |
| `npm test` | Start the test runner |
| `npm run build` | Create an optimized production build |

## Project Structure

```text
src/
├── components/          Shared navigation and interface components
├── controllers/         Alert-related application logic
├── models/              Alert data helpers
├── views/
│   ├── citizen/         SOS, emergency status, and profile views
│   ├── rescuer/         Mission, navigation, status, and team views
│   └── ...              Admin dashboards, maps, alerts, teams, and logs
├── AdminApp.js           Administrator workflow
├── CitizenApp.js         Citizen workflow
├── RescuerApp.js         Responder workflow
├── App.js                Session, realtime data, and role routing
└── supabaseClient.js     Supabase client configuration
```

## Important Notes

- Browser geolocation requires permission and normally works only on HTTPS or localhost.
- The current role selection and local session mechanism are intended for demonstration. A production deployment should use Supabase Auth, server-verified roles, Row Level Security, and audited access policies.
- Medical and personal information must be protected according to applicable privacy requirements.
- Never commit private service-role keys. The browser client should use only a restricted publishable/anonymous key.

## Future Improvements

- Supabase Auth with verified administrator and responder roles
- Row Level Security policies for every table
- Push notifications and SMS fallback
- Offline-first emergency submission
- Incident attachments and responder notes
- Automated tests for dispatch and completion workflows

## Author

Developed by [Gabriel Barbacena](https://github.com/barabz).
