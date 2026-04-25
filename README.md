# P.Slate

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Environments](#environments)
3. [Run Locally](#run-locally)
4. [Timetable Data Pipeline](#timetable-data-pipeline)
5. [Backend Integration](#backend-integration)
6. [Tuition Calculator](#tuition-calculator)
7. [Compatibility Score](#compatibility-score)
8. [SEO and Google Indexing Setup](#seo-and-google-indexing-setup)

## Tech Stack

### Front-End:

- **React + Vite** – fast development and optimized build setup
- **Tailwind CSS** – responsive, modern UI styling
- **React Router** – routing with multilingual (EN/AR) URL structure
- **i18next** – internationalization with English and Arabic (RTL) support
- **Zustand** – lightweight global state management

### Architecture & Code Quality:

- Modular file structure with separation of concerns (`/components`, `/store`, `/engine`, `/data`)
- API-ready data layer (`src/data/repo.js`) – easily switchable from local JSON to backend endpoints
- Local PDF-to-JSON preprocessing pipeline for timetable data

### Deployment:

- **Production:** `https://www.pslate.app/`
- **Development:** `https://p-slate-app-git-development-pslate.vercel.app/`
- **Hosting:** Vercel

## Environments

### Production
`https://www.pslate.app/`

This is the main public version intended for real usage and final indexing.

### Development
`https://p-slate-app-git-development-pslate.vercel.app/`

This environment is used for testing changes before merging into production.

## Run Locally

### Prerequisites:

- Node.js (v18 or higher)
- npm
- Python 3.x
- `pdfplumber` for timetable parsing

### Steps

1. Clone the repository

```bash
git clone https://github.com/yourusername/pslate.git
cd pslate
```

2. Install frontend dependencies

```bash
npm install
```

3. Install Python dependency for timetable parsing

```bash
pip install pdfplumber
```

4. Start the development server

```bash
npm run dev
```

5. Open in browser
   The app will be available at http://localhost:5173

**_Optional:_**
To build the optimized production version:

```bash
npm run build
npm run preview
```

## Timetable Data Pipeline

The timetable data is generated from a university PDF file and converted into two JSON files used by the app:

- `public/data/males_timetable.json`
- `public/data/females_timetable.json`

A separate config file is also used:

- `public/data/config.json`


### How it works
1. Place **one timetable PDF file** inside the `raw_pdf/` folder.
2. Run the parsing script:

```bash
npm run parse:timetable
```

3. The script:
- detects whether each page belongs to male or female students
- extracts timetable rows using `pdfplumber`
- normalizes Arabic text
- generates `males_timetable.json` and `females_timetable.json`
- keeps `config.json` separate

*Notes*
- The PDF filename can be anything.
- The `raw_pdf/` folder must contain exactly **one PDF at a time**.
- The app does not read the PDF directly in the browser. It works only with the generated JSON files.

## Backend Integration

The P.Slate front-end was intentionally designed to be API-ready. The data layer is separated from the UI logic, so a real backend can be integrated later without restructuring the app.

### Current setup

At the moment, data is loaded from local JSON files under `/public/data/`:

- `males_timetable.json`
- `females_timetable.json`
- `config.json`

The data-access layer lives in `src/data/repo.js`. Components do not fetch data directly. They communicate only through this repository layer.

### Current repository responsibilities

`repo.js`:

- loads male and female timetable JSON files
- normalizes them into the structure required by the planner
- applies course search and filtering logic
- exposes helper methods such as:
  - `searchCourses`
  - `getCourseByCode`
  - `getCourseByCodeFiltered`
  - `getInstructors`
  - `getConfig`

### Switching to a real backend

When a backend API becomes available, only the implementation inside repo.js needs to change.

#### Example future direction:

```js
const API_URL = import.meta.env.VITE_API_URL;

export async function searchCourses(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/courses?${query}`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}
```

### Why this approach

- **Separation of concerns** – UI does not depend on where data comes from
- **Minimal refactoring** – only repo.js changes when moving to a backend
- **Extensibility** – easy to add endpoints for user plans, auth, and config
- **Consistency** – backend can return data in the same normalized shape

### Example environment configuration

```bash
VITE_API_URL=https://pslate-api.example.com
```

The front-end automatically uses this environment variable when deployed.

## Tuition Calculator

The tuition calculator dynamically computes the total study cost based on the number of credits in the selected or generated schedule.

### Formula:

`(credits × price per credit) − (scholarship% × subtotal)`

### How it works:

- Automatically retrieves total credits from the active schedule or selected courses
- Loads default values from config.json
- Allows the user to adjust both values manually
- Instantly recalculates subtotal, scholarship discount, and final tuition
- Can later be switched to backend-driven configuration without UI changes

### Fields:

- **Total Credits** – sum of course credits.
- **Price per Credit** – cost of one academic credit.
- **Scholarship (%)** – percentage discount applied.
- **Total Tuition** – final tuition cost after discount.

## Compatibility Score

Each generated schedule is automatically evaluated with a compatibility score that measures how convenient or balanced the timetable is for the student.
The score is expressed as a percentage (0–100%) — the higher the number, the more comfortable the schedule.

### How it works:

- After generating all conflict-free schedules, the app calculates a score for each one.
- The algorithm considers several time-related factors:
  - Fewer early morning classes (later start = higher score)
  - Shorter gaps between classes on the same day
  - More compact daily layout (no unnecessary breaks)
  - Even distribution of workload across the week (Sun–Thu)
- Each schedules score is displayed alongside it and used for automatic sorting (best first).

### Formula example (simplified):

```bash
score = 100 - earlyMorningPenalty - gapPenalty - unevenDayPenalty
```

### Goal:

To help students choose not only valid schedules, but also comfortable ones that minimize idle hours and improve daily balance.

## SEO and Google Indexing Setup

Basic SEO setup is included in the project.

### Included SEO items

- `<title>`
- meta description
- Open Graph tags
- canonical URL
- robots instructions
- sitemap
- Google Search Console verification support

### Current domains
- Production: https://www.pslate.app/
- Development: https://p-slate-app-git-development-pslate.vercel.app/

### SEO recommendation

SEO and indexing should primarily target the production domain:

`https://www.pslate.app/`

The development deployment is useful for testing, but it should not be treated as the main searchable version.

### Example SEO setup

```html
<title>P.Slate</title>
<meta
  name="description"
  content="A modern web app for PSU students to search, filter, and generate conflict-free class schedules."
/>
<meta name="robots" content="index, follow" />

<meta property="og:title" content="P.Slate" />
<meta
  property="og:description"
  content="A modern web app for PSU students to search, filter, and generate conflict-free class schedules."
/>
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.pslate.app/" />

<link rel="canonical" href="https://www.pslate.app/" />
```

### Google Search Console setup

- Open Google Search Console
- Add the site property
- Verify ownership
- Submit sitemap
- Request indexing for important pages

### Recommended property type

- For the official production website, use the Domain property when possible
- For temporary or test deployments, the URL prefix method can be used

### Important note

The same SEO setup can be reused later if the project moves from demo/testing to the official production domain, but the canonical URL, Search Console property, and sitemap should always point to the final public domain.