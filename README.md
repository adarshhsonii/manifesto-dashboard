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


