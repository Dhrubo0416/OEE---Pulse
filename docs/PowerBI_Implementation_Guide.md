# Power BI Implementation Guide — OEE & Downtime Dashboard

## Overview
This guide walks you through building the OEE Dashboard in Power BI Desktop using the 7 CSV datasets provided. The dashboard monitors 13 injection molding machines with hourly OEE tracking, downtime analysis, and corrective action logs.

---

## Step 1: Import CSV Data

1. Open **Power BI Desktop**
2. Go to **Home → Get Data → Text/CSV**
3. Import each of the 7 CSV files:
   - `machines.csv`
   - `products.csv` (products_molds)
   - `productionPlan.csv`
   - `productionActual.csv`
   - `downtimeLog.csv`
   - `correctiveActions.csv`
   - `oeeHourly.csv`

### Data Type Settings
After importing, verify these column types in Power Query:
| Table | Column | Type |
|-------|--------|------|
| All tables | date | Date |
| All tables | hour | Whole Number |
| productionActual | plannedQty, actualQty, goodQty, rejectedQty | Whole Number |
| productionActual | downtimeMin, runningTimeMin, availableTimeMin | Decimal |
| oeeHourly | availability, performance, quality, oee | Decimal |
| downtimeLog | durationMin | Decimal |
| correctiveActions | resolutionMin | Decimal |

---

## Step 2: Create Relationships (Data Model)

Navigate to **Model View** and create these relationships:

```
machines[id] ──1:M──► productionActual[machineId]
machines[id] ──1:M──► productionPlan[machineId]
machines[id] ──1:M──► downtimeLog[machineId]
machines[id] ──1:M──► correctiveActions[machineId]
machines[id] ──1:M──► oeeHourly[machineId]
products[id] ──1:M──► productionActual[productId]
products[id] ──1:M──► productionPlan[productId]
downtimeLog[downtimeId] ──1:M──► correctiveActions[downtimeId]
```

### Create a Calendar/Hour Table (recommended)
```dax
Hours = GENERATESERIES(0, 23, 1)
```

---

## Step 3: DAX Measures

### Core OEE Measures

```dax
// Overall OEE %
OEE % = 
VAR AvgAvail = AVERAGE(oeeHourly[availability])
VAR AvgPerf = AVERAGE(oeeHourly[performance])
VAR AvgQual = AVERAGE(oeeHourly[quality])
RETURN
    DIVIDE(AvgAvail, 100) * DIVIDE(AvgPerf, 100) * DIVIDE(AvgQual, 100) * 100

// Availability %
Availability % = AVERAGE(oeeHourly[availability])

// Performance %
Performance % = AVERAGE(oeeHourly[performance])

// Quality %
Quality % = AVERAGE(oeeHourly[quality])

// OEE from raw data (alternative calculation)
OEE Raw % = 
VAR TotalAvailTime = SUM(productionActual[availableTimeMin])
VAR TotalRunTime = SUM(productionActual[runningTimeMin])
VAR TotalPlanned = SUM(productionActual[plannedQty])
VAR TotalActual = SUM(productionActual[actualQty])
VAR TotalGood = SUM(productionActual[goodQty])
VAR Avail = DIVIDE(TotalRunTime, TotalAvailTime)
VAR Perf = DIVIDE(TotalActual, TotalPlanned)
VAR Qual = DIVIDE(TotalGood, TotalActual)
RETURN
    Avail * Perf * Qual * 100
```

### Production Measures

```dax
// Total Good Parts
Total Good Parts = SUM(productionActual[goodQty])

// Total Rejected Parts
Total Rejected = SUM(productionActual[rejectedQty])

// Total Planned
Total Planned = SUM(productionActual[plannedQty])

// Total Actual
Total Actual = SUM(productionActual[actualQty])

// Plan Fulfillment %
Plan Fulfillment % = 
    DIVIDE(SUM(productionActual[actualQty]), SUM(productionActual[plannedQty])) * 100

// Reject Rate %
Reject Rate % = 
    DIVIDE(SUM(productionActual[rejectedQty]), SUM(productionActual[actualQty])) * 100
```

### Downtime Measures

```dax
// Total Downtime (minutes)
Total Downtime Min = SUM(downtimeLog[durationMin])

// Total Downtime (hours)
Total Downtime Hours = DIVIDE(SUM(downtimeLog[durationMin]), 60)

// Downtime Events Count
Downtime Events = COUNTROWS(downtimeLog)

// Avg Downtime per Event
Avg Downtime Per Event = AVERAGE(downtimeLog[durationMin])

// MTTR (Mean Time To Repair)
MTTR Minutes = AVERAGE(correctiveActions[resolutionMin])

// Downtime % of Total Time
Downtime % = 
    DIVIDE(
        SUM(productionActual[downtimeMin]),
        SUM(productionActual[availableTimeMin])
    ) * 100
```

### Conditional Formatting Measures

```dax
// OEE Color
OEE Color = 
    SWITCH(TRUE(),
        [OEE %] >= 85, "#00ff88",
        [OEE %] >= 70, "#88cc44",
        [OEE %] >= 55, "#ffaa00",
        [OEE %] >= 40, "#ff6600",
        "#ff3344"
    )

// OEE Status
OEE Status = 
    SWITCH(TRUE(),
        [OEE %] >= 85, "Excellent",
        [OEE %] >= 70, "Good",
        [OEE %] >= 55, "Fair",
        [OEE %] >= 40, "Poor",
        "Critical"
    )

// Department Color
Department Color = 
    SWITCH(SELECTEDVALUE(downtimeLog[department]),
        "Maintenance", "#ffaa00",
        "Production", "#00ff88",
        "Quality", "#4488ff",
        "#666666"
    )
```

---

## Step 4: Dashboard Layout

### Page Theme
Apply a custom dark theme in Power BI:
1. Go to **View → Themes → Customize current theme**
2. Set these values:
   - **Background**: `#050505`
   - **Foreground/Text**: `#f0f0f0`
   - **Table accent**: `#00ff88`
   - **Hyperlink**: `#00ff88`
   - **Secondary text**: `#999999`
   - **Card background**: `#0f0f0f`
   - **Header background**: `#0a0a0a`

Or import this JSON theme file:

```json
{
    "name": "OEE Dark Theme",
    "dataColors": ["#00ff88", "#ff3344", "#ffaa00", "#4488ff", "#00ccff", "#ff6600", "#88cc44", "#cc66ff"],
    "background": { "color": "#050505" },
    "foreground": { "color": "#f0f0f0" },
    "tableAccent": "#00ff88",
    "textClasses": {
        "callout": { "color": "#f0f0f0", "fontFace": "Inter" },
        "title": { "color": "#f0f0f0", "fontFace": "Inter" },
        "header": { "color": "#999999", "fontFace": "Inter" },
        "label": { "color": "#666666", "fontFace": "Inter" }
    },
    "visualStyles": {
        "*": {
            "*": {
                "background": [{ "color": { "solid": { "color": "#0f0f0f" } } }],
                "border": [{ "color": { "solid": { "color": "#222222" } } }]
            }
        }
    }
}
```

Save as `oee_theme.json` and import via **View → Themes → Browse for themes**.

---

## Step 5: Build the 8 Required Visuals

Follow these instructions to create the exact 8 visuals requested for the dashboard:

### 1. Plan vs Actual Production Card Visual
Since we are tracking production rather than sales, we will use a KPI or Card visual to show Plan vs Actual Production.
* **Visual Type**: Multi-row card or KPI visual.
* **Fields**: Add `Total Planned` and `Total Actual` measures.
* **Formatting**: Set background to `#0f0f0f` (Dark grey). Use Green (`#00ff88`) for the Actual value and grey for the Plan label.

### 2. Plant Location Card Visual
* **Visual Type**: Card.
* **Fields**: Add `location` from the `machines` table. Set it to "First" or "Count (Distinct)" depending on if you want to show the specific bay (when a machine is selected) or the total number of bays/locations.
* **Formatting**: Use a smaller text size (e.g., 14pt) to act as metadata for the selected machine.

### 3. Mold Changes by Machine Bar Chart
* **Visual Type**: Stacked Column Chart or Clustered Column Chart.
* **Fields**: 
  * X-axis: `machineId` (from `machines` table)
  * Y-axis: Sum of `durationMin` (from `downtimeLog`)
  * Filter on Visual: Set `category` to "Mold Change"
* **Formatting**: Set columns to a distinct color (e.g., `#cc2233` Red) to highlight downtime impact.

### 4. Hourly OEE% Trend Line Chart (Machine-wise)
* **Visual Type**: Line Chart.
* **Fields**:
  * X-axis: `hour` (from `oeeHourly` or Calendar table)
  * Y-axis: `OEE %` measure
  * Legend: `machineId` (optional, if you want all 13 lines at once, otherwise rely on the slicer).
* **Formatting**: Set Y-axis range from 0 to 100. Add markers to the line. Use a smooth line style.

### 5. Total OEE% Factors Pie/Donut Chart
While OEE is a product of its factors (not a sum), you can visualize the average weights of the factors contributing to the final score for a specific day/machine.
* **Visual Type**: Donut Chart.
* **Fields**: Create three separate values in the "Values" well:
  * `Availability %` (Average)
  * `Performance %` (Average)
  * `Quality %` (Average)
* **Formatting**: 
  * Availability: `#ffaa00` (Yellow)
  * Performance: `#00ff88` (Green)
  * Quality: `#4488ff` (Blue)
  * Set data labels to show "Category, Value".

### 6. Hourly Downtime Trend Details
* **Visual Type**: Area Chart or Stacked Column Chart.
* **Fields**:
  * X-axis: `hour`
  * Y-axis: `durationMin` (from `downtimeLog`)
  * Legend: `category` (from `downtimeLog`)
* **Formatting**: This visual will perfectly sync with the Hourly OEE Trend. As OEE drops, the Downtime bars/area will spike up.

### 7. Root Cause Analysis & Real-time Actions Table
* **Visual Type**: Table or Matrix.
* **Fields**: 
  * Columns: `machineId`, `hour`, `category` (Downtime Reason), `department`, `actionTaken`, `description`, `resolutionMin`, `status`.
* **Formatting**: 
  * Apply Conditional Formatting to the `status` column (Green for RESOLVED, Red/Yellow for PENDING).
  * Apply Conditional Formatting to the `department` column using the `Department Color` measure.
  * Ensure background is dark `#0f0f0f` with grey/white text for readability.

### 8. Machine & Date Slicers
* **Machine Slicer**:
  * **Visual Type**: Slicer
  * **Field**: `machineId` (or `machineName`)
  * **Setting**: Dropdown or Vertical List. Enables drilling down into a specific machine.
* **Date Slicer**:
  * **Visual Type**: Slicer
  * **Field**: `date` 
  * **Setting**: "Between" slider or dropdown. Enables observing past performance.

---

## Step 6: Interactivity

### Slicers
1. **Shift Slicer**: Add a slicer on `shift` column (buttons style)
2. **Machine Slicer**: Add a slicer on `machineId` (dropdown)
3. **Department Slicer**: Add a slicer on `department` from downtimeLog

### Drill-through
Create a drill-through page for machine detail:
- Add `machineId` as drill-through field
- Show hourly OEE bar chart, downtime events table, and corrective actions for selected machine

### Cross-filtering
Enable cross-filtering between:
- Heatmap → All other visuals
- Downtime Pareto → Actions table
- Department donut → Actions table

---

## Step 7: Bookmarks & Navigation

1. Create bookmarks for each shift view (All/Night/Morning/Evening)
2. Add navigation buttons styled with the dark theme
3. Create a "Machine Detail" overlay page with drill-through

---

## Data Refresh Setup

For real production use:
1. Replace CSV files with database connections (SQL Server, PostgreSQL, etc.)
2. Set up scheduled refresh via Power BI Service
3. Use DirectQuery for real-time monitoring
4. Configure Row Level Security (RLS) for department-based access

---

## Tips

- Use **Inter** or **Segoe UI** font for consistency with the web dashboard
- Set page size to **16:9 (1920×1080)** for large screen display
- Enable **High contrast** visual headers for better readability on dark backgrounds
- Use **Conditional formatting rules** extensively to match the green/red color coding
- Consider using **Power BI Embedded** for shop-floor TV displays
