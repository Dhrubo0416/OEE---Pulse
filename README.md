# 🏭 OEE & Downtime Monitoring Dashboard
### Injection Molding Plant — 13 Machines · Daily Production Analytics

---

## Overview

A comprehensive **Overall Equipment Effectiveness (OEE)** and **Downtime Monitoring** dashboard designed for a 13-machine injection molding plant. The dashboard provides:

- **Hourly OEE tracking** for each of the 13 machines (24h × 13 = 312 data points)
- **OEE breakdown** into Availability %, Performance %, Quality %
- **Downtime analysis** with Pareto charts and category breakdowns
- **Corrective actions log** showing what Maintenance, Production, and Quality departments did to resolve issues
- **Mold change tracking** as a major downtime factor across ~230 product line items
- **Interactive drill-down** from plant overview to individual machine detail

## Color Theme
| Element | Color |
|---------|-------|
| Background | Black (#050505) |
| Cards | Dark Grey (#0f0f0f) |
| Good/Target | Green (#00ff88) |
| Alert/Bad | Red (#ff3344) |
| Warning | Yellow/Orange (#ffaa00) |
| Text | Light Grey (#f0f0f0) |

---

## Quick Start

### Web Dashboard (No Installation Required)
1. Open `dashboard/index.html` in any modern browser
2. The dashboard loads with synthetic data for yesterday's production
3. Click any machine name or heatmap cell for detailed breakdown
4. Use shift tabs (Night/Morning/Evening) to filter by shift
5. Use export buttons to download CSV data

### Export CSV for Power BI
1. Open `dashboard/export-csv.html` in your browser
2. Click **"Download All CSV Files"** to get all 7 datasets
3. Import into Power BI Desktop (see guide below)

### Power BI Implementation
1. Read `docs/PowerBI_Implementation_Guide.md` for step-by-step instructions
2. Import `docs/oee_dark_theme.json` into Power BI for matching dark theme
3. Import all 7 CSV files and create relationships as documented
4. Copy DAX measures from the guide

---

## Project Structure

```
Power BI OEE Dashboard/
│
├── dashboard/                      # Web Dashboard
│   ├── index.html                  # Main dashboard page
│   ├── styles.css                  # Dark theme stylesheet
│   ├── app.js                      # Dashboard logic & charts
│   ├── data.js                     # Synthetic data generator
│   └── export-csv.html             # CSV data export utility
│
├── docs/                           # Documentation
│   ├── PowerBI_Implementation_Guide.md  # Step-by-step PBI guide
│   └── oee_dark_theme.json         # Power BI theme file
│
└── README.md                       # This file
```

---

## Data Model

### Tables & Row Counts

| Table | Rows | Description |
|-------|------|-------------|
| **machines** | 13 | Machine master data (ID, name, tonnage, type, location) |
| **products** | ~230 | Products/molds with cycle times, cavities, materials |
| **productionPlan** | 312 | Hourly production plan (13 machines × 24 hours) |
| **productionActual** | 312 | Actual production with planned vs actual quantities |
| **downtimeLog** | ~150+ | Individual downtime events with reasons & departments |
| **correctiveActions** | ~150+ | Department actions with resolution times & status |
| **oeeHourly** | 312 | Pre-calculated hourly OEE with full breakdown |

### Relationships
```
machines ──1:M──► productionActual (machineId)
machines ──1:M──► productionPlan (machineId)
machines ──1:M──► downtimeLog (machineId)
machines ──1:M──► oeeHourly (machineId)
products ──1:M──► productionActual (productId)
downtimeLog ──1:M──► correctiveActions (downtimeId)
```

---

## Machines

| ID | Machine | Tonnage | Type |
|----|---------|---------|------|
| IMM-01 | Engel Victory 80T | 80T | Hydraulic |
| IMM-02 | Engel Victory 110T | 110T | Hydraulic |
| IMM-03 | Arburg 150T | 150T | Electric |
| IMM-04 | KraussMaffei 200T | 200T | Hydraulic |
| IMM-05 | Sumitomo 250T | 250T | Electric |
| IMM-06 | Haitian Mars 320T | 320T | Servo-Hyd |
| IMM-07 | Nissei NEX 400T | 400T | Electric |
| IMM-08 | JSW J450 | 450T | Hydraulic |
| IMM-09 | Toshiba EC500 | 500T | Electric |
| IMM-10 | Milacron Magna 650T | 650T | Hydraulic |
| IMM-11 | Negri Bossi 800T | 800T | Servo-Hyd |
| IMM-12 | Husky HyPET 1000T | 1000T | Hydraulic |
| IMM-13 | Engel Duo 1300T | 1300T | Two-Platen |

---

## OEE Calculation

```
OEE = Availability × Performance × Quality

Availability = Running Time / Available Time (60 min/hour)
Performance  = Actual Output / Theoretical Output
Quality      = Good Parts / Total Parts Produced
```

### Color Coding
| OEE Range | Status | Color |
|-----------|--------|-------|
| ≥ 85% | Excellent | 🟢 Green |
| 70 - 84% | Good | 🟡 Light Green |
| 55 - 69% | Fair | 🟠 Yellow |
| 40 - 54% | Poor | 🟠 Orange |
| < 40% | Critical | 🔴 Red |

---

## Downtime Categories

| Category | Department | Description |
|----------|-----------|-------------|
| **Mold Change** | Production | Product changeover, mold swap (MAJOR factor) |
| **Mechanical Failure** | Maintenance | Hydraulic, clamping, ejector, nozzle issues |
| **Electrical Fault** | Maintenance | PLC, servo, temperature controller, power |
| **Material Issue** | Production | Shortage, contamination, moisture, wrong grade |
| **Quality Hold** | Quality | Dimensional, surface defects, short shots |
| **Process Setup** | Production | Parameter optimization, startup, cooling |
| **Planned Maintenance** | Maintenance | Scheduled PM, lubrication, calibration |
| **Utility Failure** | Maintenance | Chiller, compressed air, cooling tower |

---

## Product Categories

The ~230 line items span 7 categories:
- **Automotive** (bumper clips, dashboard trims, mirror housings)
- **Electronics** (connectors, switch bodies, terminal blocks)
- **Medical** (syringe barrels, catheter hubs, vial caps)
- **Packaging** (bottle caps, container lids, sprayer bodies)
- **Consumer** (toothbrush handles, pen barrels, toy parts)
- **Industrial** (pipe fittings, gears, bearings, cable ties)
- **Appliance** (washer knobs, fan blade hubs, vent louvers)

---

## Technologies Used

| Component | Technology |
|-----------|-----------|
| Web Dashboard | HTML5, CSS3, Vanilla JS |
| Charts | Chart.js 4.4 |
| Fonts | Inter, JetBrains Mono, Outfit (Google Fonts) |
| BI Platform | Power BI Desktop (optional) |
| Data | Synthetic (seeded RNG for reproducibility) |

---

## License
This project is created for demonstration purposes with synthetic data.
