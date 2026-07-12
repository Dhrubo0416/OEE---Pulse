// ============================================================
// OEE DASHBOARD - Application Logic
// Chart rendering, interactivity, data visualization
// ============================================================

// Wait for DOM and data to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure data.js has fully executed
    setTimeout(() => {
        initDashboard();
    }, 100);
});

function initDashboard() {
    initSlicers();
    updateHeader();
    renderKPICards();
    renderOEEHeatmap();
    renderHourlyOEETrend();
    renderDowntimePareto();
    renderDepartmentBreakdown();
    renderMachinePerformanceTable();
    renderCorrectiveActionsTable();
    renderActionsTimeline();
    initShiftTabs();
    initExportButtons();
    hideLoading();
    startClock();
}

// ============================================================
// SLICERS (Date + Machine)
// ============================================================
function initSlicers() {
    const dateSlicer = document.getElementById('date-slicer');
    const machineSlicer = document.getElementById('machine-slicer');
    const resetBtn = document.getElementById('slicer-reset');

    if (!dateSlicer || !machineSlicer) return;

    // Populate date slicer with last 7 days
    DashboardData.allDates.forEach((dateStr, i) => {
        const opt = document.createElement('option');
        opt.value = dateStr;
        const dateObj = new Date(dateStr + 'T00:00:00');
        const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        opt.textContent = i === 0 ? `${dayLabel} (Yesterday)` : dayLabel;
        if (dateStr === DashboardData.activeDate) opt.selected = true;
        dateSlicer.appendChild(opt);
    });

    // Populate machine slicer
    DashboardData.machines.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.id} — ${m.name}`;
        machineSlicer.appendChild(opt);
    });

    // Date change handler
    dateSlicer.addEventListener('change', () => {
        DashboardData.applyFilters(dateSlicer.value, DashboardData.activeMachineId);
        refreshDashboard();
    });

    // Machine change handler
    machineSlicer.addEventListener('change', () => {
        DashboardData.applyFilters(DashboardData.activeDate, machineSlicer.value);
        refreshDashboard();
    });

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            dateSlicer.value = DashboardData.allDates[0]; // Yesterday
            machineSlicer.value = 'all';
            DashboardData.applyFilters(DashboardData.allDates[0], 'all');
            refreshDashboard();
        });
    }
}

function refreshDashboard() {
    // Get current active shift tab
    const activeShiftTab = document.querySelector('.shift-tab.active');
    const activeShift = activeShiftTab ? activeShiftTab.dataset.shift : 'all';

    // Get current active department filter
    const activeDeptBtn = document.querySelector('.dept-filter-btn.active');
    const activeDept = activeDeptBtn ? activeDeptBtn.dataset.dept : 'all';

    updateHeader();
    updateLiveIndicator();
    renderKPICards();
    renderOEEHeatmap(activeShift);
    renderHourlyOEETrend(activeShift);
    renderDowntimePareto();
    renderDepartmentBreakdown();
    renderMachinePerformanceTable();
    renderCorrectiveActionsTable(activeDept);
    renderActionsTimeline();
}

function updateLiveIndicator() {
    const indicator = document.getElementById('live-indicator-text');
    if (!indicator) return;

    const yesterday = DashboardData.allDates[0];
    if (DashboardData.activeDate === yesterday) {
        indicator.textContent = 'Yesterday';
    } else {
        const dateObj = new Date(DashboardData.activeDate + 'T00:00:00');
        indicator.textContent = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}

// ============================================================
// HEADER
// ============================================================
function updateHeader() {
    const dateEl = document.getElementById('report-date');
    const dateObj = new Date(DashboardData.reportDate + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = dateObj.toLocaleDateString('en-US', options);

    const machineCount = DashboardData.activeMachineId === 'all'
        ? DashboardData.machines.length
        : 1;
    document.getElementById('machine-count').textContent = machineCount;
    document.getElementById('product-count').textContent = DashboardData.products.length;
}

function startClock() {
    const clockEl = document.getElementById('live-clock');
    function update() {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
    update();
    setInterval(update, 1000);
}

// ============================================================
// KPI CARDS
// ============================================================
function renderKPICards() {
    const data = DashboardData.overallOEE;
    const totalDowntime = DashboardData.downtimeLog.reduce((s, d) => s + d.durationMin, 0);
    const totalPlanned = DashboardData.productionActual.reduce((s, r) => s + r.plannedQty, 0);
    const totalActual = DashboardData.productionActual.reduce((s, r) => s + r.actualQty, 0);
    const totalGood = DashboardData.productionActual.reduce((s, r) => s + r.goodQty, 0);
    const totalRejected = DashboardData.productionActual.reduce((s, r) => s + r.rejectedQty, 0);

    // OEE
    animateCounter('kpi-oee', data.oee, '%');
    setKPIColor('kpi-oee-card', data.oee);

    // Availability
    animateCounter('kpi-availability', data.availability, '%');

    // Performance
    animateCounter('kpi-performance', data.performance, '%');

    // Quality
    animateCounter('kpi-quality', data.quality, '%');

    // Total Downtime
    const dtHours = Math.floor(totalDowntime / 60);
    const dtMins = totalDowntime % 60;
    document.getElementById('kpi-downtime').innerHTML = `${dtHours}<span class="unit">h</span> ${dtMins}<span class="unit">m</span>`;

    // Total Production
    document.getElementById('kpi-production').textContent = totalGood.toLocaleString();
    document.getElementById('kpi-rejected').textContent = totalRejected.toLocaleString();
    document.getElementById('kpi-planned').textContent = totalPlanned.toLocaleString();

    // Target badge
    const targetBadge = document.getElementById('kpi-target-badge');
    if (targetBadge) {
        const overallTarget = 75.0;
        const variance = (data.oee - overallTarget).toFixed(1);
        const sign = variance >= 0 ? '+' : '';
        targetBadge.textContent = `${sign}${variance}% vs Target (75%)`;
        targetBadge.className = `kpi-change ${variance >= 0 ? 'positive' : 'negative'}`;
    }
}

function animateCounter(elementId, targetValue, suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;

    let current = 0;
    const increment = targetValue / 40;
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        el.innerHTML = `${current.toFixed(1)}<span class="unit">${suffix}</span>`;
    }, 25);
}

function setKPIColor(cardId, value) {
    const card = document.getElementById(cardId);
    if (!card) return;
    if (value >= 75) card.querySelector('.kpi-value').classList.add('green');
    else if (value >= 60) card.querySelector('.kpi-value').classList.add('yellow');
    else card.querySelector('.kpi-value').classList.add('red');
}

// ============================================================
// OEE COLOR HELPERS
// ============================================================
function getOEEClass(value) {
    if (value >= 80) return 'excellent';
    if (value >= 65) return 'good';
    if (value >= 50) return 'fair';
    if (value >= 35) return 'poor';
    return 'critical';
}

function getOEEColor(value) {
    if (value >= 80) return '#00ff88';
    if (value >= 65) return '#88cc44';
    if (value >= 50) return '#ffaa00';
    if (value >= 35) return '#ff6600';
    return '#ff3344';
}

function getOEEColorRGBA(value, alpha = 1) {
    if (value >= 80) return `rgba(0, 255, 136, ${alpha})`;
    if (value >= 65) return `rgba(136, 204, 68, ${alpha})`;
    if (value >= 50) return `rgba(255, 170, 0, ${alpha})`;
    if (value >= 35) return `rgba(255, 102, 0, ${alpha})`;
    return `rgba(255, 51, 68, ${alpha})`;
}

// ============================================================
// OEE HEATMAP (13 machines × 24 hours)
// ============================================================
function renderOEEHeatmap(filterShift = 'all') {
    const container = document.getElementById('heatmap-body');
    if (!container) return;
    container.innerHTML = '';

    // Respect machine slicer
    let machines = DashboardData.machines;
    if (DashboardData.activeMachineId !== 'all') {
        machines = machines.filter(m => m.id === DashboardData.activeMachineId);
    }
    const oeeData = DashboardData.oeeHourly;

    let hours = [];
    for (let h = 0; h < 24; h++) hours.push(h);

    if (filterShift !== 'all') {
        const shift = DashboardData.shifts.find(s => s.name.includes(filterShift));
        if (shift) {
            hours = [];
            for (let h = shift.start; h <= shift.end; h++) hours.push(h);
        }
    }

    machines.forEach(machine => {
        const row = document.createElement('tr');

        // Machine name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'heatmap-machine-name';
        nameCell.innerHTML = `<span class="machine-id">${machine.id}</span> ${machine.name.split(' ').slice(0, -1).join(' ')}`;
        nameCell.addEventListener('click', () => openMachineModal(machine.id));
        row.appendChild(nameCell);

        // Hour cells
        let totalOEE = 0;
        let count = 0;

        hours.forEach(h => {
            const record = oeeData.find(r => r.machineId === machine.id && r.hour === h);
            const cell = document.createElement('td');

            if (record) {
                const oee = record.oee;
                cell.className = `heatmap-cell ${getOEEClass(oee)}`;
                cell.textContent = Math.round(oee);
                cell.setAttribute('data-machine', machine.id);
                cell.setAttribute('data-hour', h);
                totalOEE += oee;
                count++;

                // Hover tooltip
                cell.addEventListener('mouseenter', (e) => showHeatmapTooltip(e, record));
                cell.addEventListener('mouseleave', hideTooltip);
                cell.addEventListener('click', () => openMachineModal(machine.id, h));
            } else {
                cell.className = 'heatmap-cell';
                cell.textContent = '-';
                cell.style.color = 'var(--text-disabled)';
            }

            row.appendChild(cell);
        });

        // Average cell
        const avgCell = document.createElement('td');
        const avg = count > 0 ? totalOEE / count : 0;
        avgCell.className = `heatmap-avg ${getOEEClass(avg)}`;
        avgCell.style.color = getOEEColor(avg);
        avgCell.textContent = avg.toFixed(1) + '%';
        row.appendChild(avgCell);

        container.appendChild(row);
    });

    // Update hour headers
    const headerRow = document.getElementById('heatmap-hours');
    if (headerRow) {
        headerRow.innerHTML = '<th class="machine-header">Machine</th>';
        hours.forEach(h => {
            const th = document.createElement('th');
            th.className = 'hour-header';
            th.textContent = String(h).padStart(2, '0');

            // Add shift boundary markers
            if (h === 8 || h === 16) {
                th.style.borderLeft = '2px solid var(--border-strong)';
            }

            headerRow.appendChild(th);
        });
        const avgTh = document.createElement('th');
        avgTh.className = 'hour-header';
        avgTh.textContent = 'AVG';
        avgTh.style.borderLeft = '2px solid var(--border-strong)';
        headerRow.appendChild(avgTh);
    }
}

// ============================================================
// HEATMAP TOOLTIP
// ============================================================
function showHeatmapTooltip(event, record) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;

    tooltip.innerHTML = `
        <div class="tooltip-header">${record.machineName} — ${record.hourLabel}</div>
        <div class="tooltip-row">
            <span class="tooltip-label">OEE</span>
            <span class="tooltip-value" style="color:${getOEEColor(record.oee)}">${record.oee.toFixed(1)}%</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">Availability</span>
            <span class="tooltip-value">${record.availability.toFixed(1)}%</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">Performance</span>
            <span class="tooltip-value">${record.performance.toFixed(1)}%</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">Quality</span>
            <span class="tooltip-value">${record.quality.toFixed(1)}%</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">Downtime</span>
            <span class="tooltip-value num-red">${record.downtimeMin} min</span>
        </div>
        <div class="tooltip-row">
            <span class="tooltip-label">Product</span>
            <span class="tooltip-value">${record.productName}</span>
        </div>
        ${record.downtimeCategories !== 'None' ? `
        <div class="tooltip-row">
            <span class="tooltip-label">Issue</span>
            <span class="tooltip-value num-yellow">${record.downtimeCategories}</span>
        </div>` : ''}
    `;

    tooltip.classList.add('visible');
    positionTooltip(event, tooltip);
}

function positionTooltip(event, tooltip) {
    const rect = tooltip.getBoundingClientRect();
    let x = event.clientX + 15;
    let y = event.clientY + 15;

    if (x + 320 > window.innerWidth) x = event.clientX - 325;
    if (y + rect.height > window.innerHeight) y = event.clientY - rect.height - 15;

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) tooltip.classList.remove('visible');
}

// ============================================================
// HOURLY OEE TREND CHART
// ============================================================
function renderHourlyOEETrend(filterShift = 'all') {
    const ctx = document.getElementById('oee-trend-chart');
    if (!ctx) return;

    const trendData = DashboardData.hourlyTrend;
    let filtered = trendData;

    if (filterShift !== 'all') {
        const shift = DashboardData.shifts.find(s => s.name.includes(filterShift));
        if (shift) {
            filtered = trendData.filter(t => t.hour >= shift.start && t.hour <= shift.end);
        }
    }

    const labels = filtered.map(t => t.label);

    // Destroy existing chart
    if (window.oeeTrendChart) window.oeeTrendChart.destroy();

    window.oeeTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'OEE %',
                    data: filtered.map(t => t.avgOEE),
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.08)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointBackgroundColor: filtered.map(t => getOEEColor(t.avgOEE)),
                    pointBorderColor: '#0a0a0a',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                },
                {
                    label: 'Availability %',
                    data: filtered.map(t => t.avgAvailability),
                    borderColor: '#ffaa00',
                    borderDash: [5, 3],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.4,
                },
                {
                    label: 'Performance %',
                    data: filtered.map(t => t.avgPerformance),
                    borderColor: '#4488ff',
                    borderDash: [5, 3],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.4,
                },
                {
                    label: 'Quality %',
                    data: filtered.map(t => t.avgQuality),
                    borderColor: '#00ccff',
                    borderDash: [5, 3],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.4,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: '#999',
                        font: { family: 'Inter', size: 11 },
                        boxWidth: 14,
                        boxHeight: 2,
                        padding: 15,
                        useBorderRadius: true,
                        borderRadius: 1,
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#00ff88',
                    bodyColor: '#ccc',
                    borderColor: '#333',
                    borderWidth: 1,
                    titleFont: { family: 'Inter', weight: '600' },
                    bodyFont: { family: 'JetBrains Mono', size: 12 },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.04)',
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#666',
                        font: { family: 'JetBrains Mono', size: 10 },
                    },
                    border: { display: false },
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(255,255,255,0.04)',
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#666',
                        font: { family: 'JetBrains Mono', size: 10 },
                        callback: v => v + '%',
                        stepSize: 20,
                    },
                    border: { display: false },
                },
            },
            elements: {
                line: { borderJoinStyle: 'round' },
            },
        }
    });

    // Add shift boundary annotations
    if (filterShift === 'all') {
        addShiftBoundaries(window.oeeTrendChart);
    }
}

function addShiftBoundaries(chart) {
    // Will add vertical lines at shift changes using the annotation plugin if available
    // For now, shift boundaries are visible in the heatmap via border styling
}

// ============================================================
// DOWNTIME PARETO CHART
// ============================================================
function renderDowntimePareto() {
    const container = document.getElementById('downtime-pareto');
    if (!container) return;
    container.innerHTML = '';

    const paretoData = DashboardData.downtimePareto;
    const maxMin = Math.max(...paretoData.map(d => d.totalMin));

    paretoData.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'downtime-bar-row';
        row.style.opacity = '0';
        row.style.animation = `fadeInUp 0.4s ease ${i * 0.06}s forwards`;

        const pct = (item.totalMin / maxMin) * 100;
        const barColor = item.category === 'Mold Change' ? 'red' :
                         item.department === 'Maintenance' ? 'yellow' : 'green';

        row.innerHTML = `
            <span class="downtime-label">${item.category}</span>
            <div class="downtime-bar-track">
                <div class="downtime-bar-fill ${barColor}" style="width: 0%;" data-target="${pct}"></div>
            </div>
            <span class="downtime-value">${item.totalMin}<span style="color:var(--text-muted);font-size:0.65rem">min</span></span>
        `;
        container.appendChild(row);
    });

    // Animate bars
    setTimeout(() => {
        container.querySelectorAll('.downtime-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.target + '%';
        });
    }, 300);
}

// ============================================================
// DEPARTMENT BREAKDOWN (Donut Chart)
// ============================================================
function renderDepartmentBreakdown() {
    const ctx = document.getElementById('dept-donut-chart');
    if (!ctx) return;

    const deptData = DashboardData.departmentSummary;
    const totalMin = deptData.reduce((s, d) => s + d.totalMin, 0);

    const colors = {
        'Production': '#00ff88',
        'Maintenance': '#ffaa00',
        'Quality': '#4488ff',
    };

    if (window.deptDonutChart) window.deptDonutChart.destroy();

    window.deptDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: deptData.map(d => d.department),
            datasets: [{
                data: deptData.map(d => d.totalMin),
                backgroundColor: deptData.map(d => colors[d.department] || '#666'),
                borderColor: '#0f0f0f',
                borderWidth: 3,
                hoverBorderColor: '#222',
                hoverBorderWidth: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    borderColor: '#333',
                    borderWidth: 1,
                    bodyFont: { family: 'JetBrains Mono', size: 12 },
                    callbacks: {
                        label: function(context) {
                            const pct = ((context.parsed / totalMin) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed}min (${pct}%)`;
                        }
                    }
                }
            },
        }
    });

    // Update center text
    const centerEl = document.getElementById('donut-center-value');
    if (centerEl) centerEl.textContent = totalMin;
    const centerLabel = document.getElementById('donut-center-label');
    if (centerLabel) centerLabel.textContent = 'TOTAL MIN';

    // Update legend
    const legendContainer = document.getElementById('dept-legend');
    if (legendContainer) {
        legendContainer.innerHTML = '';
        deptData.forEach(d => {
            const pct = ((d.totalMin / totalMin) * 100).toFixed(1);
            legendContainer.innerHTML += `
                <div class="donut-legend-item">
                    <span class="donut-legend-dot" style="background:${colors[d.department]}"></span>
                    <span>${d.department}</span>
                    <span class="donut-legend-value">${d.totalMin}min (${pct}%)</span>
                </div>
            `;
        });
    }
}

// ============================================================
// MACHINE PERFORMANCE TABLE
// ============================================================
function renderMachinePerformanceTable(sortBy = 'oee', ascending = false) {
    const tbody = document.getElementById('machine-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let machines = [...DashboardData.machineSummary];

    // Sort
    machines.sort((a, b) => {
        const diff = a[sortBy] - b[sortBy];
        return ascending ? diff : -diff;
    });

    machines.forEach((m, i) => {
        const oeeClass = getOEEClass(m.oee);
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.animation = `fadeInUp 0.3s ease ${i * 0.04}s forwards`;
        row.addEventListener('click', () => openMachineModal(m.machineId));

        const fulfillment = m.totalPlanned > 0 ? ((m.totalActual / m.totalPlanned) * 100).toFixed(1) : 0;

        row.innerHTML = `
            <td>
                <span class="machine-name-cell">${m.machineName}</span>
                <span class="machine-id-label">${m.machineId}</span>
            </td>
            <td>
                <div class="oee-bar-container">
                    <div class="oee-bar">
                        <div class="oee-bar-fill ${oeeClass}" style="width: ${Math.min(m.oee, 100)}%"></div>
                    </div>
                    <span class="oee-value ${oeeClass}">${m.oee.toFixed(1)}%</span>
                </div>
            </td>
            <td class="font-mono text-right nowrap" style="color:${getOEEColor(m.availability)}">${m.availability.toFixed(1)}%</td>
            <td class="font-mono text-right nowrap" style="color:${getOEEColor(m.performance)}">${m.performance.toFixed(1)}%</td>
            <td class="font-mono text-right nowrap" style="color:${getOEEColor(m.quality)}">${m.quality.toFixed(1)}%</td>
            <td class="font-mono text-right nowrap num-red">${m.totalDowntimeMin}m</td>
            <td class="font-mono text-right nowrap">${m.totalGood.toLocaleString()}</td>
            <td class="font-mono text-right nowrap num-${parseFloat(fulfillment) >= 85 ? 'green' : 'red'}">${fulfillment}%</td>
        `;

        tbody.appendChild(row);
    });

    // Setup sort headers
    document.querySelectorAll('#machine-perf-table thead th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const sort = th.dataset.sort;
            const asc = th.classList.contains('sorted') && !th.classList.contains('asc');
            document.querySelectorAll('#machine-perf-table thead th').forEach(t => {
                t.classList.remove('sorted', 'asc');
            });
            th.classList.add('sorted');
            if (asc) th.classList.add('asc');
            renderMachinePerformanceTable(sort, asc);
        });
    });
}

// ============================================================
// CORRECTIVE ACTIONS TABLE
// ============================================================
function renderCorrectiveActionsTable(filterDept = 'all') {
    const tbody = document.getElementById('actions-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let actions = [...DashboardData.correctiveActions];

    if (filterDept !== 'all') {
        actions = actions.filter(a => a.department === filterDept);
    }

    // Show top 30 sorted by hour
    actions.sort((a, b) => a.hour - b.hour);
    const display = actions.slice(0, 40);

    display.forEach((a, i) => {
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.animation = `fadeIn 0.3s ease ${i * 0.02}s forwards`;

        const deptClass = a.department.toLowerCase();

        row.innerHTML = `
            <td class="font-mono" style="color:var(--text-muted)">${a.hourLabel}</td>
            <td class="nowrap">${a.machineId}</td>
            <td><span class="dept-badge ${deptClass}">${a.department}</span></td>
            <td style="color:var(--accent-yellow)">${a.category}</td>
            <td style="color:var(--text-secondary);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${a.reason}">${a.reason}</td>
            <td style="font-weight:600">${a.actionTaken}</td>
            <td style="color:var(--text-secondary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${a.description}">${a.description}</td>
            <td class="font-mono text-right">${a.resolutionMin}m</td>
            <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
        `;

        tbody.appendChild(row);
    });

    // Count display
    const countEl = document.getElementById('actions-count');
    if (countEl) countEl.textContent = `${display.length} of ${actions.length} actions`;
}

// ============================================================
// ACTIONS TIMELINE
// ============================================================
function renderActionsTimeline() {
    const container = document.getElementById('actions-timeline');
    if (!container) return;
    container.innerHTML = '';

    // Get most impactful actions (longest resolution time)
    const topActions = [...DashboardData.correctiveActions]
        .sort((a, b) => b.resolutionMin - a.resolutionMin)
        .slice(0, 12);

    topActions.sort((a, b) => a.hour - b.hour);

    topActions.forEach(a => {
        const item = document.createElement('div');
        item.className = `timeline-item ${a.department.toLowerCase()}`;

        item.innerHTML = `
            <div class="timeline-time">${a.hourLabel} · ${a.machineId}</div>
            <div class="timeline-action">${a.actionTaken} — <span style="color:var(--accent-yellow)">${a.category}</span></div>
            <div class="timeline-desc">${a.description} (${a.resolutionMin}min)</div>
        `;

        container.appendChild(item);
    });
}

// ============================================================
// SHIFT TABS
// ============================================================
function initShiftTabs() {
    document.querySelectorAll('.shift-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.shift-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const shift = tab.dataset.shift;
            renderOEEHeatmap(shift);
            renderHourlyOEETrend(shift);
        });
    });

    // Department filter buttons
    document.querySelectorAll('.dept-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dept-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCorrectiveActionsTable(btn.dataset.dept);
        });
    });
}

// ============================================================
// MACHINE DETAIL MODAL
// ============================================================
function openMachineModal(machineId, focusHour = null) {
    const modal = document.getElementById('machine-modal');
    if (!modal) return;

    const machine = DashboardData.machines.find(m => m.id === machineId);
    const hourlyData = DashboardData.getMachineHourlyOEE(machineId);
    const downtimes = DashboardData.getMachineDowntimes(machineId);
    const actions = DashboardData.getMachineActions(machineId);
    const summary = DashboardData.machineSummary.find(m => m.machineId === machineId);

    // Title
    document.getElementById('modal-machine-title').textContent = `${machine.id} — ${machine.name}`;
    document.getElementById('modal-machine-info').textContent = `${machine.tonnage}T · ${machine.type} · ${machine.location} · Year ${machine.year}`;

    // KPIs
    document.getElementById('modal-oee').textContent = summary.oee.toFixed(1) + '%';
    document.getElementById('modal-oee').style.color = getOEEColor(summary.oee);
    document.getElementById('modal-availability').textContent = summary.availability.toFixed(1) + '%';
    document.getElementById('modal-availability').style.color = getOEEColor(summary.availability);
    document.getElementById('modal-performance').textContent = summary.performance.toFixed(1) + '%';
    document.getElementById('modal-performance').style.color = getOEEColor(summary.performance);
    document.getElementById('modal-quality').textContent = summary.quality.toFixed(1) + '%';
    document.getElementById('modal-quality').style.color = getOEEColor(summary.quality);

    // Hourly OEE chart
    renderModalOEEChart(hourlyData);

    // Downtime list
    renderModalDowntimes(downtimes);

    // Actions list
    renderModalActions(actions);

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Close handlers
    document.getElementById('modal-close').onclick = () => closeMachineModal();
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeMachineModal();
    });
}

function closeMachineModal() {
    const modal = document.getElementById('machine-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (window.modalOEEChart) window.modalOEEChart.destroy();
}

function renderModalOEEChart(hourlyData) {
    const ctx = document.getElementById('modal-oee-chart');
    if (!ctx) return;

    if (window.modalOEEChart) window.modalOEEChart.destroy();

    window.modalOEEChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hourlyData.map(d => d.hourLabel),
            datasets: [
                {
                    label: 'OEE %',
                    data: hourlyData.map(d => d.oee),
                    backgroundColor: hourlyData.map(d => getOEEColorRGBA(d.oee, 0.6)),
                    borderColor: hourlyData.map(d => getOEEColor(d.oee)),
                    borderWidth: 1,
                    borderRadius: 3,
                },
                {
                    label: 'Downtime (min)',
                    data: hourlyData.map(d => d.downtimeMin),
                    type: 'line',
                    borderColor: '#ff3344',
                    backgroundColor: 'rgba(255, 51, 68, 0.1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#ff3344',
                    fill: true,
                    yAxisID: 'y1',
                    tension: 0.3,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: {
                        color: '#999',
                        font: { family: 'Inter', size: 11 },
                        boxWidth: 14,
                        boxHeight: 2,
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#00ff88',
                    bodyColor: '#ccc',
                    borderColor: '#333',
                    borderWidth: 1,
                    bodyFont: { family: 'JetBrains Mono', size: 12 },
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                    ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 } },
                    border: { display: false },
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                    ticks: { color: '#666', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + '%' },
                    border: { display: false },
                },
                y1: {
                    position: 'right',
                    min: 0,
                    max: 60,
                    grid: { display: false },
                    ticks: { color: '#ff3344', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + 'm' },
                    border: { display: false },
                },
            }
        }
    });
}

function renderModalDowntimes(downtimes) {
    const container = document.getElementById('modal-downtimes');
    if (!container) return;

    if (downtimes.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);padding:var(--gap-md)">No downtime events recorded</p>';
        return;
    }

    let html = '<table class="actions-table"><thead><tr>';
    html += '<th>Time</th><th>Duration</th><th>Category</th><th>Reason</th><th>Dept</th>';
    html += '</tr></thead><tbody>';

    downtimes.sort((a, b) => a.hour - b.hour).forEach(d => {
        const deptClass = d.department.toLowerCase();
        html += `<tr>
            <td class="font-mono" style="color:var(--text-muted)">${d.startTime} - ${d.endTime}</td>
            <td class="font-mono num-red">${d.durationMin}m</td>
            <td style="color:var(--accent-yellow)">${d.category}</td>
            <td style="color:var(--text-secondary)">${d.reason}</td>
            <td><span class="dept-badge ${deptClass}">${d.department}</span></td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderModalActions(actions) {
    const container = document.getElementById('modal-actions');
    if (!container) return;

    if (actions.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);padding:var(--gap-md)">No corrective actions recorded</p>';
        return;
    }

    container.innerHTML = '';
    const timeline = document.createElement('div');
    timeline.className = 'timeline';

    actions.sort((a, b) => a.hour - b.hour).forEach(a => {
        const item = document.createElement('div');
        item.className = `timeline-item ${a.department.toLowerCase()}`;
        item.innerHTML = `
            <div class="timeline-time">${a.hourLabel} · ${a.department}</div>
            <div class="timeline-action">${a.actionTaken} — <span style="color:var(--accent-yellow)">${a.category}</span></div>
            <div class="timeline-desc">${a.description} (${a.resolutionMin}min) · <span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></div>
        `;
        timeline.appendChild(item);
    });

    container.appendChild(timeline);
}

// ============================================================
// CSV EXPORT
// ============================================================
function initExportButtons() {
    document.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.export;
            if (DashboardData.exportCSV[type]) {
                downloadCSV(DashboardData.exportCSV[type](), `${type}_${DashboardData.reportDate}.csv`);
            }
        });
    });
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ============================================================
// LOADING
// ============================================================
function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }, 600);
    }
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMachineModal();
    }
});
