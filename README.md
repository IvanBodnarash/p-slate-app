## Stack

- React + Vite (for better perfomance)
- TailwindCSS (for faster styling + responsive UI)
- i18next (library for translations)
- Zustand (for global states)
- React Router (for routing and navigation)

- Font: Tajawal (google font)

## Backend Integration (API-Ready Architecture)

The P.Slate front-end was intentionally designed to be API-ready — the data layer is fully separated from the UI logic, making it easy to plug in a real backend later without changing the application’s structure.

### Current setup

At the moment, all data (such as course lists and tuition configuration) is loaded from local JSON files located under `/public/data/` in `courses.json`.

The data-access layer lives in `src/data/repo.js` — every component in the app communicates with this layer instead of fetching data directly.

```js
// Example (current)
export async function getCourseByCode(code) {
  const data = await fetch("/data/courses.json").then((r) => r.json());
  return data.courses.find((c) => c.code === code);
}
```

### Switching to a real backend

When a backend API becomes available, only the implementation inside `repo.js` needs to change — the UI components will continue to work as before.

```js
// Example (future)
const API_URL = import.meta.env.VITE_API_URL;

export async function getCourseByCode(code) {
  const res = await fetch(`${API_URL}/courses/${code}`);
  if (!res.ok) throw new Error("Failed to fetch course data");
  return await res.json();
}

export async function getConfig() {
  const res = await fetch(`${API_URL}/config`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return await res.json();
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
