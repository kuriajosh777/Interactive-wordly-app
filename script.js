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

