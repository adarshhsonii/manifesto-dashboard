# MP Manifesto Dashboard · मध्य प्रदेश संकल्प-पत्र ट्रैकर

An interactive, evidence-backed dashboard tracking all **414 commitments** from the Madhya Pradesh Vidhan Sabha 2023 Sankalp Patra.

---

## 📁 Project Structure

The project has been arranged into a clean, maintainable modular structure as well as a standalone all-in-one file:

```text
dashboard/
├── index.html                                        # Main modular entry point
├── css/
│   └── style.css                                     # Modular design system, variables, themes & animations
├── js/
│   ├── app.js                                        # Application controller, charts, filters & drawer interactions
│   └── data.js                                       # Cleaned dataset (DATA, DEPARTMENTS, WORK_DISTRIBUTION)
├── data/
│   ├── promises.json                                 # All 414 cleaned promises with verified URLs & notes
│   ├── departments.json                              # 45 official government departments from PDF
│   └── work_distribution.json                       # Cohort assignments & POC mapping from PDF
├── MP Manifesto Watch · मध्य प्रदेश संकल्प-पत्र ट्रैकर (2).html  # Beautifully formatted standalone all-in-one file
├── MP_Manifesto_Clean_Spelling_and_URLs.pdf          # Source PDF report
└── README.md                                         # Project documentation & schema
```

---

## 🚀 How to Run

### Option 1: Modular Web Project (Recommended for development)
Run a local static HTTP server (any server works):

```bash
# Python
python3 -m http.server 8080

# Or Node.js
npx serve .
```
Then visit `http://localhost:8080/index.html` in your browser.

### Option 2: Standalone Single File (Offline / Double-Click)
Double-click `MP Manifesto Watch · मध्य प्रदेश संकल्प-पत्र ट्रैकर (2).html` directly in your file explorer. It contains all HTML, CSS, JavaScript, and data embedded into one file without needing a web server or CORS permissions.

---

## 📊 Dashboard Features

1. **Top Reading Progress Bar**: Real-time gradient indicator tracking scroll position.
2. **Hero Overview & SVG Ring**: Real-time calculated fulfilment rate with animated circular progress indicator.
3. **Interactive Category Ticker**: Continuously scrolling horizontal marquee showcasing categories and counts.
4. **Interactive KPI Metric Cards**:
   - Total Promises (414)
   - Fulfilled / पूर्ण (47 · 11.4%)
   - In Progress / प्रगति पर (244 · 58.9%)
   - Early Stage / प्रारंभिक चरण (62 · 15.0%)
   - Not Started / प्रारंभ नहीं (61 · 14.7%)
   - Includes 3D cursor perspective tilt and celebratory confetti on clicking "पूर्ण".
5. **Multi-Filter Toolbar**:
   - Instant search with 180ms debounce (searches titles, summaries, departments, numbers).
   - Category selector dropdown.
   - Political importance filter (उच्च, मध्यम, सीमित).
   - Clear all filters button with dynamic result counter.
6. **Visual Analytics Grid (Chart.js)**:
   - **Status Distribution**: Donut chart with clickable slices to filter by status.
   - **Promises by Category**: Stacked horizontal bar chart with clickable category filtering.
   - **Department Load**: Top 10 departments stacked bar visualization.
   - **Evidence Coverage**: Percentage and average reference links per status bar chart.
   - **Category × Status Heatmap**: Density matrix displaying relative percentage and volume.
7. **Spotlight Carousel**: Auto-rotating hero card (6s interval) highlighting fulfilled promises with smooth pause on hover and prev/next controls.
8. **Rule-Based Dynamic Insights**: Data-driven statistical highlights (highest fulfilment share, most pending departments, high-priority unstarted count, evidence gap).
9. **Promise Explorer Table**:
   - Paginated (12 items per page).
   - Color-coded badges with status icons.
   - Responsive column hiding on smaller viewports.
10. **Slide-Out Detail Drawer**:
    - Clicking any table row slides out a detailed modal drawer.
    - Displays full promise description, start status, political importance, and detailed notes/updates.
    - Highlights review warnings if placeholder text exists.
    - Clickable source reference links with external redirection icons.
11. **Theme Switcher**:
    - Three color schemes: **Orange** (Saffron/State palette), **Dark Mode**, and **Light Mode**.
    - Re-renders chart canvas elements seamlessly on theme toggle.

---

## 📋 Data Schema

Each promise object in `js/data.js` and `data/promises.json` conforms to the following schema:

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `n` | `number` | Unique promise index | `1` |
| `t` | `string` | Promise title | `"मुख्यमंत्री लाड़ली बहना योजना"` |
| `s` | `string` | Brief promise summary | `"पात्र महिलाओं को आर्थिक रूप से मजबूत..."` |
| `d` | `string` | Primary department | `"महिला एवं बाल विकास विभाग"` |
| `dall` | `string` | All associated departments | `"महिला एवं बाल विकास विभाग"` |
| `c` | `string` | Thematic category | `"सशक्त नारी"` |
| `st` | `string` | Implementation status | `"पूर्ण"` \| `"प्रगति पर"` \| `"प्रारंभिक चरण"` \| `"प्रारंभ नहीं"` |
| `sp` | `string` | Work started flag | `"हाँ"` \| `"नहीं"` |
| `im` | `string` | Political importance | `"उच्च"` \| `"मध्यम"` \| `"सीमित"` |
| `nt` | `string` | Verification notes / updates | `"19 अगस्त 2026 को प्रदेश की..."` |
| `u` | `array` | Source reference tuples `[label, url]` | `[["संदर्भ लिंक", "https://..."]]` |
| `ph` | `boolean`| AI / Formula placeholder flag | `false` |
