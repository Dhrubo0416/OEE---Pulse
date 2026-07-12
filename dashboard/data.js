// ============================================================
// SYNTHETIC DATA GENERATOR - OEE Dashboard
// 13 Injection Molding Machines | ~230 Products | 24 Hours
// ============================================================

// Seeded random number generator for reproducibility
class SeededRandom {
    constructor(seed = 42) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 16807 + 0) % 2147483647;
        return this.seed / 2147483647;
    }
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    nextFloat(min, max) {
        return this.next() * (max - min) + min;
    }
    pick(arr) {
        return arr[this.nextInt(0, arr.length - 1)];
    }
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}

const rng = new SeededRandom(2026);

// ============================================================
// 1. MACHINES (13 Injection Molding Machines)
// ============================================================
const MACHINES = [
    { id: 'IMM-01', name: 'Engel Victory 80T',    tonnage: 80,   location: 'Bay A', type: 'Hydraulic',  year: 2019 },
    { id: 'IMM-02', name: 'Engel Victory 110T',   tonnage: 110,  location: 'Bay A', type: 'Hydraulic',  year: 2020 },
    { id: 'IMM-03', name: 'Arburg 150T',          tonnage: 150,  location: 'Bay A', type: 'Electric',   year: 2021 },
    { id: 'IMM-04', name: 'KraussMaffei 200T',    tonnage: 200,  location: 'Bay B', type: 'Hydraulic',  year: 2018 },
    { id: 'IMM-05', name: 'Sumitomo 250T',        tonnage: 250,  location: 'Bay B', type: 'Electric',   year: 2022 },
    { id: 'IMM-06', name: 'Haitian Mars 320T',    tonnage: 320,  location: 'Bay B', type: 'Servo-Hyd',  year: 2020 },
    { id: 'IMM-07', name: 'Nissei NEX 400T',      tonnage: 400,  location: 'Bay C', type: 'Electric',   year: 2021 },
    { id: 'IMM-08', name: 'JSW J450',             tonnage: 450,  location: 'Bay C', type: 'Hydraulic',  year: 2019 },
    { id: 'IMM-09', name: 'Toshiba EC500',        tonnage: 500,  location: 'Bay C', type: 'Electric',   year: 2023 },
    { id: 'IMM-10', name: 'Milacron Magna 650T',  tonnage: 650,  location: 'Bay D', type: 'Hydraulic',  year: 2017 },
    { id: 'IMM-11', name: 'Negri Bossi 800T',     tonnage: 800,  location: 'Bay D', type: 'Servo-Hyd',  year: 2022 },
    { id: 'IMM-12', name: 'Husky HyPET 1000T',   tonnage: 1000, location: 'Bay D', type: 'Hydraulic',  year: 2020 },
    { id: 'IMM-13', name: 'Engel Duo 1300T',      tonnage: 1300, location: 'Bay E', type: 'Two-Platen', year: 2023 },
];

// ============================================================
// 2. PRODUCTS / MOLDS (~230 products)
// ============================================================
const PRODUCT_CATEGORIES = [
    { prefix: 'AUT', category: 'Automotive', parts: ['Bumper Clip', 'Door Handle Insert', 'Dashboard Trim', 'Mirror Housing', 'Grille Element', 'Light Bracket', 'Fender Liner Clip', 'Console Panel', 'Air Vent Blade', 'Wiper Arm Cover', 'Fog Lamp Bezel', 'Wheel Arch Trim', 'Pillar Cover', 'Seat Belt Guide', 'Headlamp Bracket', 'Rocker Panel Clip', 'Hood Insulator Pin', 'Trunk Latch Cover', 'Window Regulator Clip'] },
    { prefix: 'ELC', category: 'Electronics', parts: ['Connector Shell', 'Switch Body', 'Relay Housing', 'Terminal Block', 'Cable Gland', 'Junction Box Lid', 'PCB Spacer', 'Sensor Cover', 'USB Port Frame', 'Battery Clip', 'LED Lens Cap', 'Fuse Holder', 'Encoder Wheel', 'Antenna Mount', 'IC Tray', 'SIM Card Tray', 'Ribbon Cable Clip', 'Heat Sink Retainer'] },
    { prefix: 'MED', category: 'Medical', parts: ['Syringe Barrel', 'Catheter Hub', 'Inhaler Body', 'Petri Dish Lid', 'Test Tube Cap', 'IV Connector', 'Blood Vial Cap', 'Pipette Tip', 'Specimen Cup', 'Trocar Handle', 'Wound Clip', 'Drug Delivery Cap', 'Diagnostic Strip Holder', 'Nebulizer Mask Frame', 'Lancet Housing', 'Oxygen Mask Clip'] },
    { prefix: 'PKG', category: 'Packaging', parts: ['Bottle Cap 28mm', 'Bottle Cap 38mm', 'Container Lid', 'Flip-Top Cap', 'Spout Insert', 'Tamper Ring', 'Dosing Cup', 'Jar Closure', 'Sprayer Actuator', 'Dispensing Nozzle', 'Overcap Shell', 'Trigger Sprayer Body', 'Pump Housing', 'Dip Tube Adapter', 'Child-Proof Cap', 'Sport Cap Nozzle', 'Cosmetic Jar Lid'] },
    { prefix: 'CON', category: 'Consumer', parts: ['Toothbrush Handle', 'Razor Cartridge Frame', 'Pen Barrel', 'Pen Cap', 'Toy Wheel', 'Action Figure Arm', 'Comb Body', 'Kitchen Tool Handle', 'Hanger Hook', 'Storage Box Latch', 'Drawer Slide', 'Shelf Bracket', 'Remote Body', 'Clock Frame', 'Sunglasses Temple', 'Bottle Opener Handle', 'Key Tag Body'] },
    { prefix: 'IND', category: 'Industrial', parts: ['Pipe Fitting 1in', 'Pipe Fitting 2in', 'Valve Body', 'Gear 32T', 'Gear 48T', 'Bearing Cage', 'Impeller Blade', 'Nozzle Adapter', 'Coupling Half', 'Bushing Sleeve', 'Cable Tie 200mm', 'Cable Tie 300mm', 'Panel Fastener', 'Anchor Plug', 'Dowel Pin Cap', 'Conveyor Roller End', 'Sprocket Guard Clip'] },
    { prefix: 'APL', category: 'Appliance', parts: ['Washer Knob', 'Dryer Lint Trap', 'Fridge Shelf Clip', 'Oven Handle End', 'Dishwasher Spray Arm', 'AC Vent Louver', 'Microwave Door Latch', 'Vacuum Nozzle', 'Blender Collar', 'Coffee Pod Holder', 'Iron Steam Plate', 'Mixer Knob', 'Fan Blade Hub', 'Water Dispenser Lever', 'Ice Maker Tray Frame'] },
    { prefix: 'BLD', category: 'Construction', parts: ['Wall Plug 8mm', 'Wall Plug 10mm', 'Cable Channel Clip', 'Conduit Connector', 'Junction Box Cover', 'Pipe Saddle Clamp', 'Tile Spacer 2mm', 'Tile Spacer 3mm', 'Door Stopper Bumper', 'Window Sash Clip', 'Corner Bracket Cap', 'Duct Grille Blade', 'Socket Faceplate', 'Ceiling Rose Base', 'Gutter Bracket End'] },
];

function generateProducts() {
    const products = [];
    let id = 1;
    
    PRODUCT_CATEGORIES.forEach(cat => {
        cat.parts.forEach((part, idx) => {
            // Generate 1-2 variants per part, targeting ~225 total products
            const variants = (idx % 3 === 2) ? 1 : 2;
            for (let v = 0; v < variants; v++) {
                const suffix = variants > 1 ? `-V${v + 1}` : '';
                const tonnageReq = cat.category === 'Automotive' ? rng.nextInt(200, 1300) :
                                   cat.category === 'Industrial' ? rng.nextInt(150, 800) :
                                   cat.category === 'Appliance' ? rng.nextInt(150, 650) :
                                   cat.category === 'Medical' ? rng.nextInt(80, 320) :
                                   cat.category === 'Packaging' ? rng.nextInt(80, 500) :
                                   rng.nextInt(80, 450);
                
                const cycleTime = tonnageReq < 200 ? rng.nextFloat(8, 25) :
                                  tonnageReq < 500 ? rng.nextFloat(15, 45) :
                                  rng.nextFloat(30, 90);
                
                const cavities = tonnageReq < 200 ? rng.pick([2, 4, 8, 16]) :
                                 tonnageReq < 500 ? rng.pick([1, 2, 4, 8]) :
                                 rng.pick([1, 2, 4]);
                
                const targetPerHour = Math.floor((3600 / cycleTime) * cavities * 0.9);
                
                products.push({
                    id: `${cat.prefix}-${String(id).padStart(3, '0')}${suffix}`,
                    name: `${part}${suffix}`,
                    category: cat.category,
                    moldId: `MLD-${String(rng.nextInt(1000, 9999))}`,
                    cycleTimeSec: Math.round(cycleTime * 10) / 10,
                    cavities: cavities,
                    targetPerHour: targetPerHour,
                    tonnageRequired: tonnageReq,
                    material: rng.pick(['PP', 'ABS', 'PA6', 'PC', 'POM', 'HDPE', 'LDPE', 'PET', 'TPE', 'Nylon 66', 'PS', 'PMMA']),
                    weight_g: Math.round(rng.nextFloat(0.5, 850) * 10) / 10,
                    color: rng.pick(['Natural', 'Black', 'White', 'Blue', 'Red', 'Grey', 'Green', 'Yellow', 'Orange', 'Clear']),
                });
                id++;
            }
        });
    });
    return products;
}

const PRODUCTS = generateProducts();

// ============================================================
// 3. DOWNTIME CATEGORIES & REASONS
// ============================================================
const DOWNTIME_CATEGORIES = {
    'Mold Change': {
        department: 'Production',
        reasons: ['Scheduled mold change', 'Product changeover', 'Mold preventive maintenance', 'Mold damage - swap required', 'Color change with mold swap'],
        avgDuration: [25, 45, 60, 90, 35],
        frequency: 0.25  // Most common
    },
    'Mechanical Failure': {
        department: 'Maintenance',
        reasons: ['Hydraulic oil leak', 'Clamping unit fault', 'Ejector pin broken', 'Nozzle blockage', 'Toggle mechanism wear', 'Barrel heater failure'],
        avgDuration: [30, 45, 20, 15, 60, 40],
        frequency: 0.15
    },
    'Electrical Fault': {
        department: 'Maintenance',
        reasons: ['PLC communication error', 'Servo motor fault', 'Temperature controller malfunction', 'Safety interlock triggered', 'Power supply fluctuation'],
        avgDuration: [20, 35, 25, 10, 15],
        frequency: 0.10
    },
    'Material Issue': {
        department: 'Production',
        reasons: ['Material shortage at hopper', 'Wrong material loaded', 'Material contamination', 'Moisture content high', 'Color masterbatch issue'],
        avgDuration: [15, 30, 45, 60, 20],
        frequency: 0.12
    },
    'Quality Hold': {
        department: 'Quality',
        reasons: ['Dimensional out of spec', 'Surface defect - sink marks', 'Flash on parts', 'Short shot detected', 'Weld line defect', 'Burn marks observed'],
        avgDuration: [20, 15, 25, 10, 30, 20],
        frequency: 0.13
    },
    'Process Setup': {
        department: 'Production',
        reasons: ['Parameter optimization', 'Startup scrap reduction', 'Cooling time adjustment', 'Injection pressure tuning', 'Robot teaching/adjustment'],
        avgDuration: [15, 20, 10, 15, 25],
        frequency: 0.10
    },
    'Planned Maintenance': {
        department: 'Maintenance',
        reasons: ['Scheduled PM - weekly', 'Lubrication cycle', 'Filter replacement', 'Calibration check', 'Safety inspection'],
        avgDuration: [60, 15, 20, 30, 25],
        frequency: 0.08
    },
    'Utility Failure': {
        department: 'Maintenance',
        reasons: ['Chiller malfunction', 'Compressed air drop', 'Cooling tower issue', 'Water supply interruption'],
        avgDuration: [30, 20, 45, 25],
        frequency: 0.07
    },
};

// ============================================================
// 4. CORRECTIVE ACTIONS TEMPLATES
// ============================================================
const CORRECTIVE_ACTIONS_TEMPLATES = {
    'Maintenance': [
        { action: 'Emergency Repair', descriptions: ['Replaced faulty component', 'Repaired hydraulic line', 'Fixed electrical connection', 'Replaced worn bearing', 'Repaired cooling line leak'] },
        { action: 'Preventive Fix', descriptions: ['Applied preventive lubrication', 'Tightened loose connections', 'Replaced filter element', 'Calibrated sensors', 'Cleaned cooling channels'] },
        { action: 'Root Cause Analysis', descriptions: ['Identified root cause of recurring fault', 'Documented failure mode for FMEA update', 'Created work order for permanent fix'] },
        { action: 'Spare Part Replacement', descriptions: ['Installed new heater band', 'Replaced servo drive unit', 'Swapped defective valve', 'Installed new thermocouple'] },
    ],
    'Production': [
        { action: 'Process Adjustment', descriptions: ['Optimized injection parameters', 'Adjusted cooling time', 'Modified hold pressure profile', 'Tuned back pressure setting'] },
        { action: 'Mold Change Executed', descriptions: ['Completed mold swap in target time', 'Performed SMED changeover', 'Aligned mold and verified clamping'] },
        { action: 'Material Correction', descriptions: ['Loaded correct material grade', 'Dried material to specification', 'Purged contaminated material', 'Adjusted color ratio'] },
        { action: 'Operator Intervention', descriptions: ['Cleared part jam in robot arm', 'Reset cycle after alarm', 'Adjusted conveyor belt speed', 'Restarted auto-cycle'] },
    ],
    'Quality': [
        { action: 'Inspection & Disposition', descriptions: ['Performed dimensional check - parts within spec', 'Sorted suspect parts - quarantined rejects', 'Visual inspection passed after adjustment'] },
        { action: 'Process Validation', descriptions: ['Validated first-off parts after changeover', 'Confirmed SPC data within control limits', 'Approved process parameters for production'] },
        { action: 'Defect Containment', descriptions: ['Isolated defective batch for rework', 'Implemented 100% inspection for suspect lot', 'Tagged and segregated non-conforming parts'] },
        { action: 'CAPA Initiated', descriptions: ['Raised CAPA for recurring quality issue', 'Updated inspection checklist', 'Revised control plan for affected dimension'] },
    ],
};

// ============================================================
// 5. SHIFT DEFINITIONS
// ============================================================
const SHIFTS = [
    { name: 'Shift A (Night)',   start: 0,  end: 7,  label: '00:00 - 07:59' },
    { name: 'Shift B (Morning)', start: 8,  end: 15, label: '08:00 - 15:59' },
    { name: 'Shift C (Evening)', start: 16, end: 23, label: '16:00 - 23:59' },
];

function getShift(hour) {
    return SHIFTS.find(s => hour >= s.start && hour <= s.end);
}

// ============================================================
// 6. GENERATE PRODUCTION DATA — ON-DEMAND PER DATE
// ============================================================
function getYesterdayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

function getDateSixMonthsAgo() {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
}

const REPORT_DATE = getYesterdayDate();
const MIN_DATE = getDateSixMonthsAgo();

// Cache for generated day-data (keyed by date string)
const _dataCache = {};

function getOrGenerateDataForDate(dateStr) {
    if (_dataCache[dateStr]) return _dataCache[dateStr];
    const dayData = generateHourlyDataForDate(dateStr);
    _dataCache[dateStr] = dayData;
    return dayData;
}

function assignProductsToMachines() {
    // Each machine gets 2-4 products in a day (mold changes between them)
    const assignments = {};
    
    MACHINES.forEach(machine => {
        const compatibleProducts = PRODUCTS.filter(p => p.tonnageRequired <= machine.tonnage * 1.1 && p.tonnageRequired >= machine.tonnage * 0.3);
        const numProducts = rng.nextInt(2, 4);
        const selected = rng.shuffle(compatibleProducts).slice(0, numProducts);
        
        if (selected.length === 0) {
            // Fallback: pick any product
            const fallback = rng.shuffle(PRODUCTS).slice(0, 2);
            assignments[machine.id] = fallback;
        } else {
            assignments[machine.id] = selected;
        }
    });
    return assignments;
}

function generateHourlyDataForDate(dateStr) {
    // Use a different seed per date for variety
    const dateSeed = dateStr.split('-').reduce((s, p) => s + parseInt(p), 0);
    const dateRng = new SeededRandom(dateSeed * 137 + 2026);
    const machineProducts = assignProductsToMachines();
    const productionPlan = [];
    const productionActual = [];
    const downtimeLog = [];
    const correctiveActions = [];
    const oeeHourly = [];
    
    let planId = 1;
    let recordId = 1;
    let downtimeId = 1;
    let actionId = 1;
    
    MACHINES.forEach(machine => {
        const products = machineProducts[machine.id];
        const numProducts = products.length;
        
        // Determine mold change hours (when product switches)
        const hoursPerProduct = Math.floor(24 / numProducts);
        const moldChangeHours = [];
        for (let i = 1; i < numProducts; i++) {
            moldChangeHours.push(i * hoursPerProduct);
        }
        
        // Machine reliability factor (older machines have more issues)
        const age = 2026 - machine.year;
        const reliabilityFactor = Math.max(0.7, 1 - (age * 0.03));
        
        for (let hour = 0; hour < 24; hour++) {
            const productIndex = Math.min(Math.floor(hour / hoursPerProduct), numProducts - 1);
            const product = products[productIndex];
            const shift = getShift(hour);
            
            // Planned production
            const plannedQty = product.targetPerHour;
            productionPlan.push({
                planId: `PLN-${String(planId++).padStart(5, '0')}`,
                date: dateStr,
                machineId: machine.id,
                machineName: machine.name,
                hour: hour,
                hourLabel: `${String(hour).padStart(2, '0')}:00`,
                shift: shift.name,
                productId: product.id,
                productName: product.name,
                category: product.category,
                moldId: product.moldId,
                plannedQty: plannedQty,
                cycleTimeSec: product.cycleTimeSec,
                cavities: product.cavities,
            });
            
            // Determine downtimes for this hour
            let totalDowntimeMin = 0;
            const hourDowntimes = [];
            
            // Mold change downtime
            if (moldChangeHours.includes(hour)) {
                const cat = 'Mold Change';
                const catData = DOWNTIME_CATEGORIES[cat];
                const reasonIdx = dateRng.nextInt(0, catData.reasons.length - 1);
                const duration = catData.avgDuration[reasonIdx] + dateRng.nextInt(-5, 15);
                const dtDuration = Math.min(duration, 55); // Cap at 55 min to leave some production
                
                hourDowntimes.push({
                    category: cat,
                    reason: catData.reasons[reasonIdx],
                    department: catData.department,
                    duration: dtDuration,
                });
                totalDowntimeMin += dtDuration;
            }
            
            // Random downtimes based on reliability and category frequency
            Object.entries(DOWNTIME_CATEGORIES).forEach(([cat, catData]) => {
                if (cat === 'Mold Change') return; // Already handled
                
                const threshold = catData.frequency * reliabilityFactor;
                if (dateRng.next() < threshold && totalDowntimeMin < 45) {
                    const reasonIdx = dateRng.nextInt(0, catData.reasons.length - 1);
                    let duration = catData.avgDuration[reasonIdx] + dateRng.nextInt(-8, 10);
                    duration = Math.max(5, Math.min(duration, 50 - totalDowntimeMin));
                    
                    if (duration > 0 && totalDowntimeMin + duration <= 55) {
                        hourDowntimes.push({
                            category: cat,
                            reason: catData.reasons[reasonIdx],
                            department: catData.department,
                            duration: duration,
                        });
                        totalDowntimeMin += duration;
                    }
                }
            });
            
            // Record downtimes
            const hourDowntimeIds = [];
            hourDowntimes.forEach(dt => {
                const dtId = `DT-${dateStr}-${String(downtimeId++).padStart(5, '0')}`;
                hourDowntimeIds.push(dtId);
                
                const startMin = dateRng.nextInt(0, Math.max(0, 59 - dt.duration));
                const endMin = Math.min(startMin + dt.duration, 59);
                
                downtimeLog.push({
                    downtimeId: dtId,
                    date: dateStr,
                    machineId: machine.id,
                    machineName: machine.name,
                    hour: hour,
                    hourLabel: `${String(hour).padStart(2, '0')}:00`,
                    shift: shift.name,
                    startTime: `${String(hour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
                    endTime: `${String(hour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
                    durationMin: dt.duration,
                    category: dt.category,
                    reason: dt.reason,
                    department: dt.department,
                    productId: product.id,
                    productName: product.name,
                });
                
                // Generate corrective action for this downtime
                const deptActions = CORRECTIVE_ACTIONS_TEMPLATES[dt.department];
                const actionTemplate = dateRng.pick(deptActions);
                const description = dateRng.pick(actionTemplate.descriptions);
                const resolutionTime = dt.duration + dateRng.nextInt(-5, 10);
                
                correctiveActions.push({
                    actionId: `ACT-${dateStr}-${String(actionId++).padStart(5, '0')}`,
                    downtimeId: dtId,
                    date: dateStr,
                    machineId: machine.id,
                    machineName: machine.name,
                    hour: hour,
                    hourLabel: `${String(hour).padStart(2, '0')}:00`,
                    shift: shift.name,
                    department: dt.department,
                    category: dt.category,
                    reason: dt.reason,
                    actionTaken: actionTemplate.action,
                    description: description,
                    resolutionMin: Math.max(5, resolutionTime),
                    status: dateRng.next() > 0.1 ? 'Resolved' : 'Pending',
                });
            });
            
            // Calculate OEE components
            const availableTime = 60; // minutes per hour
            const runningTime = availableTime - totalDowntimeMin;
            const availability = (runningTime / availableTime) * 100;
            
            // Performance: actual vs theoretical output during running time
            const theoreticalOutput = Math.floor((runningTime / 60) * product.targetPerHour);
            const performanceFactor = dateRng.nextFloat(0.80, 0.98) * reliabilityFactor;
            const actualQty = Math.max(0, Math.floor(theoreticalOutput * performanceFactor));
            const performance = theoreticalOutput > 0 ? (actualQty / theoreticalOutput) * 100 : 0;
            
            // Quality: good parts vs total
            const rejectRate = dateRng.nextFloat(0.005, 0.04);
            const rejectedQty = Math.floor(actualQty * rejectRate);
            const goodQty = actualQty - rejectedQty;
            const quality = actualQty > 0 ? (goodQty / actualQty) * 100 : 0;
            
            // OEE = Availability × Performance × Quality
            const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
            
            // Production actual record
            productionActual.push({
                recordId: `REC-${dateStr}-${String(recordId++).padStart(5, '0')}`,
                date: dateStr,
                machineId: machine.id,
                machineName: machine.name,
                hour: hour,
                hourLabel: `${String(hour).padStart(2, '0')}:00`,
                shift: shift.name,
                productId: product.id,
                productName: product.name,
                category: product.category,
                plannedQty: plannedQty,
                actualQty: actualQty,
                goodQty: goodQty,
                rejectedQty: rejectedQty,
                availableTimeMin: availableTime,
                runningTimeMin: runningTime,
                downtimeMin: totalDowntimeMin,
                plannedCycleTimeSec: product.cycleTimeSec,
                actualCycleTimeSec: runningTime > 0 ? Math.round(((runningTime * 60) / Math.max(1, actualQty / product.cavities)) * 10) / 10 : 0,
            });
            
            // OEE hourly record
            oeeHourly.push({
                date: dateStr,
                machineId: machine.id,
                machineName: machine.name,
                hour: hour,
                hourLabel: `${String(hour).padStart(2, '0')}:00`,
                shift: shift.name,
                availability: Math.round(availability * 100) / 100,
                performance: Math.round(performance * 100) / 100,
                quality: Math.round(quality * 100) / 100,
                oee: Math.round(oee * 100) / 100,
                plannedQty: plannedQty,
                actualQty: actualQty,
                goodQty: goodQty,
                rejectedQty: rejectedQty,
                downtimeMin: totalDowntimeMin,
                runningTimeMin: runningTime,
                downtimeCategories: hourDowntimes.map(d => d.category).join('; ') || 'None',
                downtimeReasons: hourDowntimes.map(d => d.reason).join('; ') || 'None',
                productId: product.id,
                productName: product.name,
            });
        }
    });
    
    return { productionPlan, productionActual, downtimeLog, correctiveActions, oeeHourly };
}

// ============================================================
// 7. AGGREGATE / SUMMARY FUNCTIONS
// ============================================================
function calculateOverallOEE(oeeData) {
    const totalAvail = oeeData.reduce((s, r) => s + r.availability, 0) / oeeData.length;
    const totalPerf = oeeData.reduce((s, r) => s + r.performance, 0) / oeeData.length;
    const totalQual = oeeData.reduce((s, r) => s + r.quality, 0) / oeeData.length;
    const totalOEE = (totalAvail / 100) * (totalPerf / 100) * (totalQual / 100) * 100;
    
    return {
        availability: Math.round(totalAvail * 100) / 100,
        performance: Math.round(totalPerf * 100) / 100,
        quality: Math.round(totalQual * 100) / 100,
        oee: Math.round(totalOEE * 100) / 100,
    };
}

function getMachineSummary(oeeData) {
    const machines = {};
    oeeData.forEach(r => {
        if (!machines[r.machineId]) {
            machines[r.machineId] = {
                machineId: r.machineId,
                machineName: r.machineName,
                records: [],
            };
        }
        machines[r.machineId].records.push(r);
    });
    
    return Object.values(machines).map(m => {
        const avail = m.records.reduce((s, r) => s + r.availability, 0) / m.records.length;
        const perf = m.records.reduce((s, r) => s + r.performance, 0) / m.records.length;
        const qual = m.records.reduce((s, r) => s + r.quality, 0) / m.records.length;
        const oee = (avail / 100) * (perf / 100) * (qual / 100) * 100;
        const totalDt = m.records.reduce((s, r) => s + r.downtimeMin, 0);
        const totalPlanned = m.records.reduce((s, r) => s + r.plannedQty, 0);
        const totalActual = m.records.reduce((s, r) => s + r.actualQty, 0);
        const totalGood = m.records.reduce((s, r) => s + r.goodQty, 0);
        const totalRejected = m.records.reduce((s, r) => s + r.rejectedQty, 0);
        
        return {
            machineId: m.machineId,
            machineName: m.machineName,
            availability: Math.round(avail * 100) / 100,
            performance: Math.round(perf * 100) / 100,
            quality: Math.round(qual * 100) / 100,
            oee: Math.round(oee * 100) / 100,
            totalDowntimeMin: totalDt,
            totalPlanned: totalPlanned,
            totalActual: totalActual,
            totalGood: totalGood,
            totalRejected: totalRejected,
            hoursRun: 24,
        };
    }).sort((a, b) => b.oee - a.oee);
}

function getDowntimePareto(downtimeData) {
    const categories = {};
    downtimeData.forEach(d => {
        if (!categories[d.category]) {
            categories[d.category] = { category: d.category, totalMin: 0, count: 0, department: d.department };
        }
        categories[d.category].totalMin += d.durationMin;
        categories[d.category].count++;
    });
    
    return Object.values(categories).sort((a, b) => b.totalMin - a.totalMin);
}

function getDepartmentSummary(downtimeData) {
    const depts = {};
    downtimeData.forEach(d => {
        if (!depts[d.department]) {
            depts[d.department] = { department: d.department, totalMin: 0, count: 0, categories: {} };
        }
        depts[d.department].totalMin += d.durationMin;
        depts[d.department].count++;
        if (!depts[d.department].categories[d.category]) {
            depts[d.department].categories[d.category] = 0;
        }
        depts[d.department].categories[d.category] += d.durationMin;
    });
    return Object.values(depts).sort((a, b) => b.totalMin - a.totalMin);
}

function getHourlyTrend(oeeData) {
    const hourly = {};
    for (let h = 0; h < 24; h++) {
        hourly[h] = { hour: h, label: `${String(h).padStart(2, '0')}:00`, records: [] };
    }
    oeeData.forEach(r => hourly[r.hour].records.push(r));
    
    return Object.values(hourly).map(h => ({
        hour: h.hour,
        label: h.label,
        avgOEE: h.records.length > 0 ? Math.round(h.records.reduce((s, r) => s + r.oee, 0) / h.records.length * 100) / 100 : 0,
        avgAvailability: h.records.length > 0 ? Math.round(h.records.reduce((s, r) => s + r.availability, 0) / h.records.length * 100) / 100 : 0,
        avgPerformance: h.records.length > 0 ? Math.round(h.records.reduce((s, r) => s + r.performance, 0) / h.records.length * 100) / 100 : 0,
        avgQuality: h.records.length > 0 ? Math.round(h.records.reduce((s, r) => s + r.quality, 0) / h.records.length * 100) / 100 : 0,
        totalDowntime: h.records.reduce((s, r) => s + r.downtimeMin, 0),
    }));
}

// ============================================================
// 8. BUILD DASHBOARD DATA (ON-DEMAND PER DATE)
// ============================================================

// Generate yesterday's data to boot the dashboard
const _initialData = getOrGenerateDataForDate(REPORT_DATE);

const DashboardData = {
    reportDate: REPORT_DATE,
    minDate: MIN_DATE,
    machines: MACHINES,
    products: PRODUCTS,
    shifts: SHIFTS,

    // Active filter state
    activeDate: REPORT_DATE,
    activeMachineId: 'all',

    // Filtered views (will be set by applyFilters)
    productionPlan: [],
    productionActual: [],
    downtimeLog: [],
    correctiveActions: [],
    oeeHourly: [],

    // Pre-calculated summaries
    overallOEE: null,
    machineSummary: null,
    downtimePareto: null,
    departmentSummary: null,
    hourlyTrend: null,

    // Apply filters: generates data on-demand for the selected date
    applyFilters: function(date, machineId) {
        this.activeDate = date || this.activeDate;
        this.activeMachineId = machineId || this.activeMachineId;
        this.reportDate = this.activeDate;

        // Generate (or retrieve from cache) data for this date
        const dayData = getOrGenerateDataForDate(this.activeDate);

        let oee = dayData.oeeHourly;
        let prod = dayData.productionActual;
        let dt = dayData.downtimeLog;
        let ca = dayData.correctiveActions;
        let pp = dayData.productionPlan;

        // Filter by machine if not 'all'
        if (this.activeMachineId !== 'all') {
            oee = oee.filter(r => r.machineId === this.activeMachineId);
            prod = prod.filter(r => r.machineId === this.activeMachineId);
            dt = dt.filter(r => r.machineId === this.activeMachineId);
            ca = ca.filter(r => r.machineId === this.activeMachineId);
            pp = pp.filter(r => r.machineId === this.activeMachineId);
        }

        this.oeeHourly = oee;
        this.productionActual = prod;
        this.downtimeLog = dt;
        this.correctiveActions = ca;
        this.productionPlan = pp;

        // Recalculate summaries
        this.overallOEE = oee.length > 0 ? calculateOverallOEE(oee) : { availability: 0, performance: 0, quality: 0, oee: 0 };
        this.machineSummary = getMachineSummary(oee);
        this.downtimePareto = getDowntimePareto(dt);
        this.departmentSummary = getDepartmentSummary(dt);
        this.hourlyTrend = getHourlyTrend(oee);
    },

    // Helper functions
    getShift: getShift,
    getMachineHourlyOEE: function(machineId) {
        return this.oeeHourly.filter(r => r.machineId === machineId);
    },
    getMachineDowntimes: function(machineId) {
        return this.downtimeLog.filter(r => r.machineId === machineId);
    },
    getMachineActions: function(machineId) {
        return this.correctiveActions.filter(r => r.machineId === machineId);
    },
    getHourData: function(hour) {
        return this.oeeHourly.filter(r => r.hour === hour);
    },
};

// Initialize with yesterday's data
DashboardData.applyFilters(REPORT_DATE, 'all');

// CSV Export helper
function toCSV(data, columns) {
    const header = columns.join(',');
    const rows = data.map(row => columns.map(col => {
        let val = row[col];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
            val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    }).join(','));
    return [header, ...rows].join('\n');
}

DashboardData.exportCSV = {
    machines: () => toCSV(MACHINES, ['id', 'name', 'tonnage', 'location', 'type', 'year']),
    products: () => toCSV(PRODUCTS, ['id', 'name', 'category', 'moldId', 'cycleTimeSec', 'cavities', 'targetPerHour', 'tonnageRequired', 'material', 'weight_g', 'color']),
    productionPlan: () => toCSV(DashboardData.productionPlan, ['planId', 'date', 'machineId', 'machineName', 'hour', 'hourLabel', 'shift', 'productId', 'productName', 'category', 'moldId', 'plannedQty', 'cycleTimeSec', 'cavities']),
    productionActual: () => toCSV(DashboardData.productionActual, ['recordId', 'date', 'machineId', 'machineName', 'hour', 'hourLabel', 'shift', 'productId', 'productName', 'category', 'plannedQty', 'actualQty', 'goodQty', 'rejectedQty', 'availableTimeMin', 'runningTimeMin', 'downtimeMin', 'plannedCycleTimeSec', 'actualCycleTimeSec']),
    downtimeLog: () => toCSV(DashboardData.downtimeLog, ['downtimeId', 'date', 'machineId', 'machineName', 'hour', 'hourLabel', 'shift', 'startTime', 'endTime', 'durationMin', 'category', 'reason', 'department', 'productId', 'productName']),
    correctiveActions: () => toCSV(DashboardData.correctiveActions, ['actionId', 'downtimeId', 'date', 'machineId', 'machineName', 'hour', 'hourLabel', 'shift', 'department', 'category', 'reason', 'actionTaken', 'description', 'resolutionMin', 'status']),
    oeeHourly: () => toCSV(DashboardData.oeeHourly, ['date', 'machineId', 'machineName', 'hour', 'hourLabel', 'shift', 'availability', 'performance', 'quality', 'oee', 'plannedQty', 'actualQty', 'goodQty', 'rejectedQty', 'downtimeMin', 'runningTimeMin', 'downtimeCategories', 'downtimeReasons', 'productId', 'productName']),
};
