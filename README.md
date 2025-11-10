# P.Slate

## Table of Contents

1. [Tech Stack](#tech-stack)

2. [Run Locally](#run-locally)

3. [Backend Integration](#backend-integration)

4. [Tuition Calculator](#tuition-calculator)

5. [Compatibility Score](#compatibility-score)

6. [SEO and Google Indexing Setup](#seo-and-google-indexing-setup)

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

Deployment:

- Vercel

## Run Locally

### Prerequisites:

- Node.js (v18 or higher)

- npm

### Steps

1. Clone the repository

```bash
git clone https://github.com/yourusername/pslate.git
cd pslate
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open in browser
   The app will be available at http://localhost:5173

**_Optional:_**
To build the optimized production version:

```bash
npm run build
npm run preview
```

## Backend Integration

The P.Slate front-end was intentionally designed to be API-ready — the data layer is fully separated from the UI logic, making it easy to plug in a real backend later without changing the application’s structure.

### Current setup

At the moment, all data (such as course lists and tuition configuration) is loaded from local JSON files located under `/public/data/` in `courses.json`.

The data-access layer lives in `src/data/repo.js` — every component in the app communicates with this layer instead of fetching data directly.

```js
let cache = null;

export async function ensureLoaded() {
  if (!cache) {
    const res = await fetch("/data/courses.json");
    cache = await res.json(); // { config, courses: [...] }
  }
}

export async function getCourseByCode(code) {
  await ensureLoaded();
  const q = (code || "").toLowerCase().trim();
  return cache.courses.find((c) => c.code.toLowerCase() === q) || null;
}
```

### Switching to a real backend

When a backend API becomes available, only the implementation inside `repo.js` needs to change — the UI components will continue to work as before.

```js
// Example (future)
const API_URL = import.meta.env.VITE_API_URL;

export async function ensureLoaded() {
  if (!cache) {
    const res = await fetch(`${API_URL}/courses/${code}`);
    if (!res.ok) throw new Error("Failed to fetch course data");
    cache = await res.json(); // { config, courses: [...] }
  }
}
```

### Why this approach

- **Separation of concerns:** the UI layer never depends on where data comes from.

- **Minimal refactoring:** only one file (`repo.js`) changes when moving to a backend.

- **API consistency:** backend can return JSON objects in the same shape as current static files.

- **Extensibility:** easily extend with endpoints like:

  - `POST /api/plans` — save generated schedules

  - `GET /api/config` — load university pricing and scholarship settings

  - `POST /api/auth/login` — handle user authentication

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

- Automatically retrieves the total credits from the active schedule (or from selected courses if no schedule is generated).

- Loads default values (`pricePerCredit`, `defaultScholarshipPct`) from `courses.json`.

- Allows the user to adjust both values manually.

- Instantly recalculates Subtotal, Scholarship discount, and Total tuition in real time.

- Fully API-ready — can later fetch data from /api/config instead of local JSON.

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

### Setting metatags

```html
<!-- index.html -->

<!-- Basic SEO -->
<title>P.Slate</title>
<meta
  name="description"
  content="A modern web app for PSU students to plan, filter, and generate conflict-free class schedules."
/>
<meta
  name="keywords"
  content="PSU, Prince Sultan University, schedule planner, course scheduler, student portal, class planner"
/>
<meta name="author" content="John Doe" />

<!-- Open Graph for social sharing -->
<meta property="og:title" content="P.Slate" />
<meta
  property="og:description"
  content="A modern web app for PSU students to plan, filter, and generate conflict-free class schedules."
/>
<meta property="og:image" content="/public/preview.png" />
<meta property="og:url" content="https://p-slate-app.vercel.app" />
<meta property="og:type" content="website" />

<!-- Canonical (important for SEO) -->
<link rel="canonical" href="https://p-slate-app.vercel.app" />

<!-- Robots.txt (for visibility in browsers) -->
<meta name="robots" content="index, follow" />

<!-- Google Setup (from Google Search Console) -->
<meta
  name="google-site-verification"
  content="jtJOLj4Af3Nk1UYCADLLT4azNVxEzGwjYDZtB2012MM"
/>
```

Basic SEO meta tags, sitemap, and robots.txt are already included in the project.
To make the website visible on Google, you can connect it to **Google Search Console**.

### Google Indexing Setup

For the demo (Vercel) I used the URL prefix method; for the production domain use the Domain method.

1. Go to [Google Search Console](https://search.google.com/search-console/).

2. Add the site URL (for example: `https://pslate.com`).
3. Choose "**Domain**" or "**URL prefix**" as the property type.
4. Verify ownership — easiest method is via the **HTML meta tag** option:

   - Copy the verification `<meta>` tag provided by Google.

   - Paste it into the `<head>` section of your site.
   - Redeploy the site on Vercel.

5. Once verified, click "**Request indexing**".

> After this, Google will crawl and index your site.  
> You can repeat the exact same process later for the **official domain** when it's live.

### Removing or resetting the demo site

If you want to remove the demo version from Google later:

- Go to **Search Console -> Settings -> Remove property**, or
- Add this meta tag to stop indexing:
  ```html
  <meta name="robots" content="noindex, nofollow" />
  ```
