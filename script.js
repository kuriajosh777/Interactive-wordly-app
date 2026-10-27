/* ---------- Theme colors (changed by JavaScript through data-theme) ---------- */
:root {
  --bg: #f4f6fb;
  --surface: #ffffff;
  --text: #1c2333;
  --muted: #5b6478;
  --border: #dde2ee;
  --accent: #4b5bdc;
  --accent-text: #ffffff;
  --accent-soft: #e9ecff;
  --saved: #fff4cc;
  --saved-border: #f0c43d;
  --error-bg: #fdecec;
  --error-text: #a12626;
  --shadow: 0 6px 24px rgba(28, 35, 51, 0.08);
}

:root[data-theme="dark"] {
  --bg: #12151f;
  --surface: #1c2130;
  --text: #eef0f8;
  --muted: #a3abc2;
  --border: #2d3449;
  --accent: #8a96ff;
  --accent-text: #12151f;
  --accent-soft: #272e4a;
  --saved: #3a3315;
  --saved-border: #c9a227;
  --error-bg: #3b1d1f;
  --error-text: #ffb4b4;
  --shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
}

/* ---------- Base ---------- */
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s ease, color 0.3s ease;
}

h1, h2, h3, p, ul { margin: 0; }
ul { padding: 0; list-style: none; }
a { color: var(--accent); }

.hidden { display: none !important; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
/* ---------- Header ---------- */
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 760px;
  margin: 0 auto;
  padding: 1.25rem 1rem 0;
}

.brand { display: flex; align-items: center; gap: 0.6rem; }
.brand h1 { font-size: 1.6rem; letter-spacing: 0.02em; }

.brand-mark {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  background: var(--accent);
  color: var(--accent-text);
  font-weight: 800;
}

.icon-button {
  width: 2.6rem;
  height: 2.6rem;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.icon-button:hover { transform: scale(1.08); border-color: var(--accent); }

/* ---------- Layout ---------- */
.container {
  max-width: 760px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: grid;
  gap: 1.75rem;
}

.tagline { color: var(--muted); margin-bottom: 0.9rem; }

/* ---------- Search form ---------- */
.search-form { display: flex; gap: 0.6rem; }

.search-form input {
  flex: 1;
  min-width: 0;
  padding: 0.85rem 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  font-size: 1.05rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.search-form input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

button {
  font: inherit;
  cursor: pointer;
}

.search-form button {
  padding: 0.85rem 1.4rem;
  border: none;
  border-radius: 12px;
  background: var(--accent);
  color: var(--accent-text);
  font-weight: 700;
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.search-form button:hover:not(:disabled) { transform: translateY(-2px); }
.search-form button:disabled { opacity: 0.6; cursor: wait; }
/* ---------- Messages ---------- */
.message {
  margin-top: 0.8rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
}
.message.error { background: var(--error-bg); color: var(--error-text); }
.message.status { background: var(--accent-soft); color: var(--text); }
