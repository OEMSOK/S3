// State Management
let state = {
    invoices: [],
    exchangeRate: 4100,
    theme: {
        mode: 'dark',
        primaryColor: '#6366f1'
    }
};

// DOM Elements & Selectors
const DOM = {
    // Navigation
    menuItems: document.querySelectorAll('.menu-item'),
    views: document.querySelectorAll('.app-view'),
    menuToggle: document.getElementById('menu-toggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarExchangeRate: document.getElementById('sidebar-exchange-rate'),

    // Dashboard
    dashCustomers: document.getElementById('dash-customers'),
    dashTotalUsd: document.getElementById('dash-total-usd'),
    dashTotalRiel: document.getElementById('dash-total-riel'),
    recentSalesList: document.getElementById('recent-sales-list'),
    chartContainer: document.getElementById('dashboard-chart'),

    // New Sale Form
    custName: document.getElementById('cust-name'),
    custPhone: document.getElementById('cust-phone'),
    saleDate: document.getElementById('sale-date'),
    salesRowsContainer: document.getElementById('sales-rows-container'),
    totalUsd: document.getElementById('total-usd'),
    totalRiel: document.getElementById('total-riel'),
    btnResetSale: document.getElementById('btn-reset-sale'),
    btnSaveSale: document.getElementById('btn-save-sale'),
    btnAddRow: document.getElementById('btn-add-row'),

    // Reports & Filters
    filterType: document.getElementById('filter-type'),
    groupFilterDay: document.getElementById('group-filter-day'),
    groupFilterMonth: document.getElementById('group-filter-month'),
    groupFilterYear: document.getElementById('group-filter-year'),
    filterDayVal: document.getElementById('filter-day-val'),
    filterMonthVal: document.getElementById('filter-month-val'),
    filterYearVal: document.getElementById('filter-year-val'),
    searchInput: document.getElementById('search-input'),
    btnClearFilters: document.getElementById('btn-clear-filters'),
    reportTableBody: document.getElementById('report-table-body'),

    // Settings
    btnThemeDark: document.getElementById('btn-theme-dark'),
    btnThemeLight: document.getElementById('btn-theme-light'),
    primaryColorPicker: document.getElementById('primary-color-picker'),
    colorHexLabel: document.getElementById('color-hex-label'),
    presetDots: document.querySelectorAll('.preset-dot'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    importCsvInput: document.getElementById('import-csv-input'),
    configExchangeRate: document.getElementById('config-exchange-rate'),
    btnSaveExchangeRate: document.getElementById('btn-save-exchange-rate'),
    btnClearDatabase: document.getElementById('btn-clear-database'),

    // Modals
    editModal: document.getElementById('edit-modal'),
    closeEditModal: document.getElementById('close-edit-modal'),
    editInvoiceId: document.getElementById('edit-invoice-id'),
    editCustName: document.getElementById('edit-cust-name'),
    editCustPhone: document.getElementById('edit-cust-phone'),
    editSaleDate: document.getElementById('edit-sale-date'),
    editSalesRowsContainer: document.getElementById('edit-sales-rows-container'),
    editTotalUsd: document.getElementById('edit-total-usd'),
    editTotalRiel: document.getElementById('edit-total-riel'),
    btnCancelEdit: document.getElementById('btn-cancel-edit'),
    btnSaveEdit: document.getElementById('btn-save-edit'),
    btnEditAddRow: document.getElementById('btn-edit-add-row'),

    receiptModal: document.getElementById('receipt-modal'),
    closeReceiptModal: document.getElementById('close-receipt-modal'),
    receiptPreviewContent: document.getElementById('receipt-preview-content'),
    btnTriggerPrint: document.getElementById('btn-trigger-print'),
    btnCloseReceiptPreview: document.getElementById('btn-close-receipt-preview'),
    printReceiptSection: document.getElementById('print-receipt-section'),

    toastContainer: document.getElementById('toast-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadInvoices();
    setupNavigation();
    setupSalesGrid();
    setupEventListeners();
    refreshUI();
});

// Load Settings from LocalStorage
function loadSettings() {
    const savedTheme = localStorage.getItem('sales_theme');
    if (savedTheme) {
        state.theme = JSON.parse(savedTheme);
    }
    
    const savedRate = localStorage.getItem('sales_exchange_rate');
    if (savedRate) {
        state.exchangeRate = parseInt(savedRate) || 4100;
    }
    
    // Apply theme settings
    applyThemeMode(state.theme.mode);
    applyPrimaryColor(state.theme.primaryColor);
    
    // Sync Settings form values
    DOM.configExchangeRate.value = state.exchangeRate;
    DOM.sidebarExchangeRate.innerText = formatNumber(state.exchangeRate);
    DOM.primaryColorPicker.value = state.theme.primaryColor;
    DOM.colorHexLabel.innerText = state.theme.primaryColor.toUpperCase();
    
    // Set color picker preset dots active state
    DOM.presetDots.forEach(dot => {
        if (dot.getAttribute('data-color') === state.theme.primaryColor) {
            dot.classList.add('active-preset');
        } else {
            dot.classList.remove('active-preset');
        }
    });
}

// Load Invoices from LocalStorage
function loadInvoices() {
    const savedInvoices = localStorage.getItem('sales_invoices');
    if (savedInvoices) {
        state.invoices = JSON.parse(savedInvoices);
    } else {
        // Sample data for premium demo
        state.invoices = getSampleInvoices();
        localStorage.setItem('sales_invoices', JSON.stringify(state.invoices));
    }
}

// Save Invoices & State to LocalStorage
function saveInvoices() {
    localStorage.setItem('sales_invoices', JSON.stringify(state.invoices));
    refreshUI();
}

// Initialize Sales Table with initially only 1 row
function setupSalesGrid() {
    DOM.salesRowsContainer.innerHTML = '';
    DOM.salesRowsContainer.appendChild(createRowElement(1, false));
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    DOM.saleDate.value = today;
}

// Create single row element
function createRowElement(index, isEdit = false) {
    const tr = document.createElement('tr');
    tr.className = `sales-row ${isEdit ? 'edit-row' : 'new-row'}`;
    tr.dataset.index = index;
    
    tr.innerHTML = `
        <td class="row-index">${index}</td>
        <td>
            <input type="text" class="grid-input item-name" list="items-list" placeholder="ជ្រើសរើស ឬវាយឈ្មោះទំនិញ...">
        </td>
        <td>
            <div class="price-input-wrapper">
                <input type="number" step="any" min="0" class="grid-input item-price" placeholder="0">
                <select class="currency-select item-currency">
                    <option value="KHR">៛</option>
                    <option value="USD">$</option>
                </select>
            </div>
        </td>
        <td>
            <input type="number" min="1" class="grid-input item-quantity" value="1" placeholder="1">
        </td>
        <td>
            <span class="grid-total-display item-total-display">0 ៛</span>
        </td>
        <td style="width: 50px; text-align: center;">
            <button type="button" class="btn-remove-row" title="លុបជួរនេះ"><i class="fa-solid fa-trash-can"></i></button>
        </td>
    `;
    return tr;
}

// Dynamic Row Helper Functions
function isRowFilled(row) {
    const nameVal = row.querySelector('.item-name').value.trim();
    const priceVal = row.querySelector('.item-price').value.trim();
    return nameVal !== '' && priceVal !== '';
}

function isRowPartiallyFilled(row) {
    const nameVal = row.querySelector('.item-name').value.trim();
    const priceVal = row.querySelector('.item-price').value.trim();
    return nameVal !== '' || priceVal !== '';
}

function updateRowIndices(tableBody) {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, idx) => {
        row.dataset.index = idx + 1;
        const indexCell = row.querySelector('.row-index');
        if (indexCell) {
            indexCell.innerText = idx + 1;
        }
    });
}

// Manage dynamic rows:
// 1. Shows 1 row initially.
// 2. Automatically reveals / appends next row as soon as the current row is completed.
// 3. Prunes unnecessary empty trailing rows if user erases an item.
function checkAndManageRows(tableBody, isEdit = false, isChangeEvent = false) {
    let rows = Array.from(tableBody.querySelectorAll('tr'));
    if (rows.length === 0) {
        tableBody.appendChild(createRowElement(1, isEdit));
        return;
    }

    const lastRow = rows[rows.length - 1];
    const lastName = lastRow.querySelector('.item-name').value.trim();
    const lastPrice = lastRow.querySelector('.item-price').value.trim();

    // Condition to add the next row:
    // When last row has both name and price filled, OR on change (select/blur) and item name is provided
    const shouldAddRow = (lastName !== '' && lastPrice !== '') || (isChangeEvent && lastName !== '');

    if (shouldAddRow) {
        const nextIndex = rows.length + 1;
        const newRow = createRowElement(nextIndex, isEdit);
        tableBody.appendChild(newRow);
        newRow.classList.add('row-fade-in');
    } else {
        // Prune extra empty trailing rows if there are multiple, leaving at most 1 empty row at the end
        while (rows.length > 1) {
            const currentLast = rows[rows.length - 1];
            const prevRow = rows[rows.length - 2];
            const currentFilled = isRowPartiallyFilled(currentLast);
            const prevFilled = isRowPartiallyFilled(prevRow);

            if (!currentFilled && !prevFilled) {
                currentLast.remove();
                rows.pop();
            } else {
                break;
            }
        }
    }

    updateRowIndices(tableBody);
}

// Setup full event lifecycle for dynamic table rows (inputs, change, keyboard navigation, delete button)
function setupTableListeners(tableBody, totalUsdLabel, totalRielLabel, isEdit = false) {
    // Dynamic row addition and calculation while typing
    tableBody.addEventListener('input', () => {
        checkAndManageRows(tableBody, isEdit, false);
        handleRowCalculations(tableBody, totalUsdLabel, totalRielLabel);
    });

    // Dynamic row addition on select from datalist or focus lost
    tableBody.addEventListener('change', () => {
        checkAndManageRows(tableBody, isEdit, true);
        handleRowCalculations(tableBody, totalUsdLabel, totalRielLabel);
    });

    // Enter key smart navigation
    tableBody.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;

            e.preventDefault();

            const nameInput = row.querySelector('.item-name');
            const priceInput = row.querySelector('.item-price');
            const qtyInput = row.querySelector('.item-quantity');

            if (target === nameInput) {
                priceInput.focus();
                priceInput.select();
            } else if (target === priceInput || target === qtyInput) {
                const rows = Array.from(tableBody.querySelectorAll('tr'));
                const isLast = row === rows[rows.length - 1];
                if (isLast) {
                    checkAndManageRows(tableBody, isEdit, true);
                    const updatedRows = Array.from(tableBody.querySelectorAll('tr'));
                    const nextRow = updatedRows[updatedRows.length - 1];
                    if (nextRow && nextRow !== row) {
                        nextRow.querySelector('.item-name').focus();
                    }
                } else {
                    const nextRow = row.nextElementSibling;
                    if (nextRow) nextRow.querySelector('.item-name').focus();
                }
                handleRowCalculations(tableBody, totalUsdLabel, totalRielLabel);
            }
        }
    });

    // Delete row button click
    tableBody.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove-row');
        if (!removeBtn) return;

        const row = removeBtn.closest('tr');
        if (!row) return;

        const allRows = tableBody.querySelectorAll('tr');
        if (allRows.length <= 1) {
            // Reset the only remaining row instead of removing it
            row.querySelector('.item-name').value = '';
            row.querySelector('.item-price').value = '';
            row.querySelector('.item-quantity').value = '1';
            row.querySelector('.item-currency').value = 'KHR';
            row.querySelector('.item-total-display').innerText = '0 ៛';
        } else {
            row.remove();
        }

        checkAndManageRows(tableBody, isEdit, false);
        updateRowIndices(tableBody);
        handleRowCalculations(tableBody, totalUsdLabel, totalRielLabel);
    });
}

// Refresh Dashboard, Reports and UI Widgets
function refreshUI() {
    renderDashboard();
    renderReports();
    populateYearFilter();
}

// Navigation Controls
function setupNavigation() {
    DOM.menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.getAttribute('data-view');
            switchView(viewName);
            
            // Close mobile menu if open
            DOM.sidebar.classList.remove('sidebar-open');
        });
    });

    DOM.menuToggle.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('sidebar-open');
    });

    // Handle initial hash load
    const hash = window.location.hash.substring(1);
    if (['dashboard', 'sales', 'reports', 'settings'].includes(hash)) {
        switchView(hash);
    }
}

function switchView(viewName) {
    DOM.menuItems.forEach(i => {
        if (i.getAttribute('data-view') === viewName) {
            i.classList.add('active');
        } else {
            i.classList.remove('active');
        }
    });

    DOM.views.forEach(view => {
        if (view.id === `${viewName}-view`) {
            view.classList.add('active-view');
        } else {
            view.classList.remove('active-view');
        }
    });
    
    // Trigger chart animation if dashboard is active
    if (viewName === 'dashboard') {
        setTimeout(animateChart, 100);
    }
}

// Helper to Format Currency Numbers
function formatCurrency(val, currency) {
    if (currency === 'USD') {
        return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        return formatNumber(Math.round(val)) + ' ៛';
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Dynamic Calculations on Form Changes
function handleRowCalculations(tableBody, totalUsdLabel, totalRielLabel) {
    const rows = tableBody.querySelectorAll('tr');
    let grandTotalUsd = 0;
    let grandTotalRiel = 0;

    rows.forEach(row => {
        const nameInput = row.querySelector('.item-name');
        const priceInput = row.querySelector('.item-price');
        const currencySelect = row.querySelector('.item-currency');
        const qtyInput = row.querySelector('.item-quantity');
        const totalDisplay = row.querySelector('.item-total-display');

        const rawPrice = priceInput.value.trim();
        const price = rawPrice === '' ? 0 : (parseFloat(rawPrice) || 0);
        const qty = parseInt(qtyInput.value) || 1;
        const currency = currencySelect.value;
        
        const rowTotal = price * qty;
        totalDisplay.innerText = rowTotal > 0 ? formatCurrency(rowTotal, currency) : (currency === 'USD' ? '$0.00' : '0 ៛');

        // Accumulate totals by base currency
        if (nameInput.value.trim() !== '') {
            if (currency === 'USD') {
                grandTotalUsd += rowTotal;
                grandTotalRiel += rowTotal * state.exchangeRate;
            } else {
                grandTotalRiel += rowTotal;
                grandTotalUsd += rowTotal / state.exchangeRate;
            }
        }
    });

    totalUsdLabel.innerText = formatCurrency(grandTotalUsd, 'USD');
    totalRielLabel.innerText = formatCurrency(grandTotalRiel, 'KHR');
}

// Setup Event Listeners
function setupEventListeners() {
    // Dynamic table row listeners (auto add next row, enter key nav, remove row)
    setupTableListeners(DOM.salesRowsContainer, DOM.totalUsd, DOM.totalRiel, false);
    setupTableListeners(DOM.editSalesRowsContainer, DOM.editTotalUsd, DOM.editTotalRiel, true);

    // Manual Add Row button listeners
    if (DOM.btnAddRow) {
        DOM.btnAddRow.addEventListener('click', () => {
            const rows = DOM.salesRowsContainer.querySelectorAll('tr');
            const nextIndex = rows.length + 1;
            const newRow = createRowElement(nextIndex, false);
            DOM.salesRowsContainer.appendChild(newRow);
            newRow.classList.add('row-fade-in');
            updateRowIndices(DOM.salesRowsContainer);
            newRow.querySelector('.item-name').focus();
        });
    }

    if (DOM.btnEditAddRow) {
        DOM.btnEditAddRow.addEventListener('click', () => {
            const rows = DOM.editSalesRowsContainer.querySelectorAll('tr');
            const nextIndex = rows.length + 1;
            const newRow = createRowElement(nextIndex, true);
            DOM.editSalesRowsContainer.appendChild(newRow);
            newRow.classList.add('row-fade-in');
            updateRowIndices(DOM.editSalesRowsContainer);
            newRow.querySelector('.item-name').focus();
        });
    }

    // Reset Sales button
    DOM.btnResetSale.addEventListener('click', () => {
        if (confirm('តើអ្នកពិតជាចង់សម្អាតការលក់បច្ចុប្បន្នមែនទេ?')) {
            setupSalesGrid();
            handleRowCalculations(DOM.salesRowsContainer, DOM.totalUsd, DOM.totalRiel);
            showToast('ទម្រង់ត្រូវបានសម្អាតរួចរាល់', 'success');
        }
    });

    // Save Sale button
    DOM.btnSaveSale.addEventListener('click', saveNewInvoice);

    // Filter controls change listeners
    DOM.filterType.addEventListener('change', () => {
        const type = DOM.filterType.value;
        DOM.groupFilterDay.style.display = type === 'day' ? 'flex' : 'none';
        DOM.groupFilterMonth.style.display = type === 'month' ? 'flex' : 'none';
        DOM.groupFilterYear.style.display = type === 'year' ? 'flex' : 'none';
        renderReports();
    });

    DOM.filterDayVal.addEventListener('change', renderReports);
    DOM.filterMonthVal.addEventListener('change', renderReports);
    DOM.filterYearVal.addEventListener('change', renderReports);
    DOM.searchInput.addEventListener('input', renderReports);
    
    DOM.btnClearFilters.addEventListener('click', () => {
        DOM.filterType.value = 'all';
        DOM.filterDayVal.value = '';
        DOM.filterMonthVal.value = '';
        DOM.filterYearVal.value = '';
        DOM.searchInput.value = '';
        
        DOM.groupFilterDay.style.display = 'none';
        DOM.groupFilterMonth.style.display = 'none';
        DOM.groupFilterYear.style.display = 'none';
        
        renderReports();
        showToast('បានសម្អាតតម្រងស្វែងរក', 'success');
    });

    // Theme Config listeners
    DOM.btnThemeDark.addEventListener('click', () => {
        applyThemeMode('dark');
        saveThemeSettings();
    });

    DOM.btnThemeLight.addEventListener('click', () => {
        applyThemeMode('light');
        saveThemeSettings();
    });

    DOM.primaryColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        DOM.colorHexLabel.innerText = color.toUpperCase();
        applyPrimaryColor(color);
        
        // Remove active theme class from presets
        DOM.presetDots.forEach(dot => dot.classList.remove('active-preset'));
    });

    DOM.primaryColorPicker.addEventListener('change', () => {
        saveThemeSettings();
    });

    DOM.presetDots.forEach(dot => {
        dot.addEventListener('click', () => {
            DOM.presetDots.forEach(d => d.classList.remove('active-preset'));
            dot.classList.add('active-preset');
            
            const color = dot.getAttribute('data-color');
            DOM.primaryColorPicker.value = color;
            DOM.colorHexLabel.innerText = color.toUpperCase();
            applyPrimaryColor(color);
            saveThemeSettings();
        });
    });

    // Exchange Rate config
    DOM.btnSaveExchangeRate.addEventListener('click', () => {
        const rate = parseInt(DOM.configExchangeRate.value);
        if (rate && rate > 0) {
            state.exchangeRate = rate;
            localStorage.setItem('sales_exchange_rate', rate);
            DOM.sidebarExchangeRate.innerText = formatNumber(rate);
            
            // Recalculate everything and reload
            refreshUI();
            showToast('អត្រាប្តូរប្រាក់ថ្មីត្រូវបានរក្សាទុក', 'success');
        } else {
            showToast('សូមបញ្ចូលអត្រាប្តូរប្រាក់ត្រឹមត្រូវ', 'error');
        }
    });

    // Clear DB
    DOM.btnClearDatabase.addEventListener('click', () => {
        if (confirm('ការប្រុងប្រយ័ត្ន៖ តើអ្នកពិតជាចង់លុបរាល់ប្រតិបត្តិការលក់ទាំងអស់មែនទេ? ទិន្នន័យនឹងមិនអាចយកមកវិញបានឡើយ។')) {
            state.invoices = [];
            localStorage.removeItem('sales_invoices');
            refreshUI();
            showToast('ទិន្នន័យលក់ទាំងអស់ត្រូវបានលុបចោល!', 'error');
        }
    });

    // CSV Download
    DOM.btnExportCsv.addEventListener('click', exportCSV);

    // CSV Upload File input
    DOM.importCsvInput.addEventListener('change', importCSV);

    // Modals events
    DOM.closeEditModal.addEventListener('click', () => DOM.editModal.classList.remove('active-modal'));
    DOM.btnCancelEdit.addEventListener('click', () => DOM.editModal.classList.remove('active-modal'));
    DOM.btnSaveEdit.addEventListener('click', saveEditedInvoice);

    DOM.closeReceiptModal.addEventListener('click', () => DOM.receiptModal.classList.remove('active-modal'));
    DOM.btnCloseReceiptPreview.addEventListener('click', () => DOM.receiptModal.classList.remove('active-modal'));
    DOM.btnTriggerPrint.addEventListener('click', () => {
        window.print();
    });
}

// Apply theme settings classes/vars
function applyThemeMode(mode) {
    state.theme.mode = mode;
    if (mode === 'light') {
        document.body.classList.add('light-theme');
        DOM.btnThemeLight.classList.add('btn-primary');
        DOM.btnThemeLight.classList.remove('btn-secondary');
        DOM.btnThemeDark.classList.add('btn-secondary');
        DOM.btnThemeDark.classList.remove('btn-primary');
    } else {
        document.body.classList.remove('light-theme');
        DOM.btnThemeDark.classList.add('btn-primary');
        DOM.btnThemeDark.classList.remove('btn-secondary');
        DOM.btnThemeLight.classList.add('btn-secondary');
        DOM.btnThemeLight.classList.remove('btn-primary');
    }
}

function applyPrimaryColor(color) {
    state.theme.primaryColor = color;
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Calculate hover color (darken it slightly for active state interactions)
    const hoverColor = darkenColor(color, 15);
    document.documentElement.style.setProperty('--primary-hover', hoverColor);
    
    // Calculate light opacity color (primary light background)
    const rgbaLight = hexToRgba(color, 0.15);
    document.documentElement.style.setProperty('--primary-light', rgbaLight);
}

function saveThemeSettings() {
    localStorage.setItem('sales_theme', JSON.stringify(state.theme));
}

// Helpers for color dynamic mapping
function darkenColor(hex, percent) {
    let num = parseInt(hex.replace("#",""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<0?0:R>255?255:R)*0x10000 + (G<0?0:G>255?255:G)*0x100 + (B<0?0:B>255?255:B)).toString(16).slice(1);
}

function hexToRgba(hex, alpha) {
    let num = parseInt(hex.replace("#",""), 16),
        r = (num >> 16),
        g = (num >> 8 & 0x00FF),
        b = (num & 0x0000FF);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Render Dashboard statistics and weekly trend graph
function renderDashboard() {
    // Stat Metrics calculation
    const customersCount = new Set(state.invoices.map(inv => (inv.customerName || '').trim() || inv.id)).size;
    DOM.dashCustomers.innerText = formatNumber(customersCount);

    let totalUsdSum = 0;
    let totalRielSum = 0;
    state.invoices.forEach(inv => {
        totalUsdSum += inv.totalUSD;
        totalRielSum += inv.totalRiel;
    });

    DOM.dashTotalUsd.innerText = formatCurrency(totalUsdSum, 'USD');
    DOM.dashTotalRiel.innerText = formatCurrency(totalRielSum, 'KHR');

    // Recent Operations List
    DOM.recentSalesList.innerHTML = '';
    const sorted = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 5);

    if (recent.length === 0) {
        DOM.recentSalesList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; margin-top: 100px;">មិនទាន់មានប្រតិបត្តិការទេ</p>`;
    } else {
        recent.forEach(inv => {
            const dateStr = formatDateKhmer(inv.date);
            const item = document.createElement('div');
            item.style = 'background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;';
            item.innerHTML = `
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${inv.customerName || 'អតិថិជនទូទៅ'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${dateStr} • ID: ${inv.id}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-family: var(--font-number); font-weight: 700; color: var(--primary-color); font-size: 0.95rem;">${formatCurrency(inv.totalUSD, 'USD')}</div>
                    <div style="font-family: var(--font-number); font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${formatCurrency(inv.totalRiel, 'KHR')}</div>
                </div>
            `;
            DOM.recentSalesList.appendChild(item);
        });
    }

    // Weekly Graph Setup (in USD)
    setupWeeklyChart();
}

function setupWeeklyChart() {
    // Generate dates for current week (Mon-Sun)
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // calculate offset back to Monday
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const weekdaySums = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    
    state.invoices.forEach(inv => {
        const invDate = new Date(inv.date);
        // difference in days from Monday
        const diffTime = invDate - monday;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
            weekdaySums[diffDays] += inv.totalUSD;
        }
    });

    const maxVal = Math.max(...weekdaySums, 10);
    const bars = DOM.chartContainer.querySelectorAll('.chart-bar-fill');
    
    // Label mid-max dynamic settings
    const maxLabel = DOM.chartContainer.querySelector('.chart-y-axis span:nth-child(1)');
    const midLabel = DOM.chartContainer.querySelector('.chart-y-axis span:nth-child(2)');
    maxLabel.innerText = '$' + Math.ceil(maxVal);
    midLabel.innerText = '$' + Math.ceil(maxVal / 2);

    bars.forEach((bar, index) => {
        const sum = weekdaySums[index];
        const pct = (sum / maxVal) * 100;
        bar.dataset.heightPct = pct; // save for lazy animation
        bar.style.height = '0%'; // reset for animation trigger
        
        const tooltip = bar.querySelector('.chart-tooltip');
        tooltip.innerText = formatCurrency(sum, 'USD');
    });
}

function animateChart() {
    const bars = DOM.chartContainer.querySelectorAll('.chart-bar-fill');
    bars.forEach(bar => {
        const pct = bar.dataset.heightPct || '0';
        bar.style.height = pct + '%';
    });
}

// Generate dropdown filters dynamically for reports
function populateYearFilter() {
    const years = new Set(state.invoices.map(inv => inv.date.split('-')[0]));
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);
    
    const sortedYears = Array.from(years).sort((a,b) => b - a);
    
    DOM.filterYearVal.innerHTML = '';
    sortedYears.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.innerText = y + ' ឆ្នាំ';
        DOM.filterYearVal.appendChild(opt);
    });
}

// Render Reports Table based on chosen filters
function renderReports() {
    const filterType = DOM.filterType.value;
    const search = DOM.searchInput.value.toLowerCase().trim();
    
    let filtered = state.invoices;

    // Filter by type
    if (filterType === 'day') {
        const dayVal = DOM.filterDayVal.value; // YYYY-MM-DD
        if (dayVal) {
            filtered = filtered.filter(inv => inv.date === dayVal);
        }
    } else if (filterType === 'month') {
        const monthVal = DOM.filterMonthVal.value; // YYYY-MM
        if (monthVal) {
            filtered = filtered.filter(inv => inv.date.startsWith(monthVal));
        }
    } else if (filterType === 'year') {
        const yearVal = DOM.filterYearVal.value; // YYYY
        if (yearVal) {
            filtered = filtered.filter(inv => inv.date.startsWith(yearVal));
        }
    }

    // Filter by name/phone query search
    if (search !== '') {
        filtered = filtered.filter(inv => {
            const name = (inv.customerName || '').toLowerCase();
            const phone = (inv.customerPhone || '').toLowerCase();
            return name.includes(search) || phone.includes(search);
        });
    }

    // Sort by newest date
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    DOM.reportTableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        DOM.reportTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px 0;">
                    <i class="fa-regular fa-folder-open" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                    មិនឃើញមានទិន្នន័យលក់ត្រូវនឹងការស្វែងរករបស់អ្នកឡើយ
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family: var(--font-number); font-weight: bold; color: var(--primary-color);">${inv.id}</td>
            <td>${formatDateKhmer(inv.date)}</td>
            <td style="font-family: var(--font-number); font-weight: bold;">${formatCurrency(inv.totalUSD, 'USD')}</td>
            <td style="font-family: var(--font-number); font-weight: bold;">${formatCurrency(inv.totalRiel, 'KHR')}</td>
            <td>
                <div class="report-table-actions">
                    <button class="btn btn-secondary btn-sm btn-action-print" data-id="${inv.id}"><i class="fa-solid fa-print"></i> ព្រីន</button>
                    <button class="btn btn-warning btn-sm btn-action-edit" data-id="${inv.id}"><i class="fa-solid fa-pen-to-square"></i> កែ</button>
                    <button class="btn btn-danger btn-sm btn-action-delete" data-id="${inv.id}"><i class="fa-solid fa-trash-can"></i> លុប</button>
                </div>
            </td>
        `;
        DOM.reportTableBody.appendChild(tr);
    });

    // Action buttons inside reports
    DOM.reportTableBody.querySelectorAll('.btn-action-print').forEach(btn => {
        btn.addEventListener('click', () => previewReceipt(btn.dataset.id));
    });
    DOM.reportTableBody.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    DOM.reportTableBody.querySelectorAll('.btn-action-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteInvoice(btn.dataset.id));
    });
}

// Convert date to Khmer Format (e.g. 13-កក្កដា-2026)
function formatDateKhmer(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    const year = parts[0];
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    const khmerMonths = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    
    return `${day}-${khmerMonths[month - 1]}-${year}`;
}

// Generate New Invoice
function saveNewInvoice() {
    const custName = DOM.custName.value.trim();
    const custPhone = DOM.custPhone.value.trim();
    const date = DOM.saleDate.value;
    
    if (!date) {
        showToast('សូមជ្រើសរើសថ្ងៃខែឆ្នាំទិញអីវ៉ាន់', 'error');
        return;
    }

    // Collect valid items
    const items = [];
    const rows = DOM.salesRowsContainer.querySelectorAll('tr');
    
    rows.forEach(row => {
        const nameVal = row.querySelector('.item-name').value.trim();
        const rawPrice = row.querySelector('.item-price').value.trim();
        const priceVal = rawPrice === '' ? 0 : parseFloat(rawPrice);
        const currVal = row.querySelector('.item-currency').value;
        const qtyVal = parseInt(row.querySelector('.item-quantity').value) || 1;

        if (nameVal !== '' && !isNaN(priceVal)) {
            items.push({
                name: nameVal,
                price: priceVal,
                currency: currVal,
                quantity: qtyVal,
                total: priceVal * qtyVal
            });
        }
    });

    if (items.length === 0) {
        showToast('សូមបញ្ចូលមុខទំនិញយ៉ាងហោចណាស់ ១ ក្នុងតារាង', 'error');
        return;
    }

    // Grand totals
    let invoiceUSD = 0;
    let invoiceRiel = 0;
    
    items.forEach(it => {
        if (it.currency === 'USD') {
            invoiceUSD += it.total;
            invoiceRiel += it.total * state.exchangeRate;
        } else {
            invoiceRiel += it.total;
            invoiceUSD += it.total / state.exchangeRate;
        }
    });

    const dateParts = date.split('-');
    const formattedDate = `${dateParts[2]}${dateParts[1]}${dateParts[0]}`;
    const invoiceId = `SN-${formattedDate}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = {
        id: invoiceId,
        customerName: custName,
        customerPhone: custPhone,
        date: date,
        items: items,
        totalUSD: invoiceUSD,
        totalRiel: invoiceRiel
    };

    state.invoices.push(newInvoice);
    saveInvoices();
    
    // Clear sales entry grid
    setupSalesGrid();
    handleRowCalculations(DOM.salesRowsContainer, DOM.totalUsd, DOM.totalRiel);

    showToast('ការលក់ថ្មីត្រូវបានរក្សាទុកដោយជោគជ័យ', 'success');
    
    // Automatically open receipt preview for instant printing/invoice issuance
    previewReceipt(invoiceId);
}

// Delete Invoice
function deleteInvoice(id) {
    if (confirm(`តើអ្នកពិតជាចង់លុបវិក្កយបត្រ ${id} មែនទេ?`)) {
        state.invoices = state.invoices.filter(inv => inv.id !== id);
        saveInvoices();
        showToast('បានលុបវិក្កយបត្ររួចរាល់', 'success');
    }
}

// Open Edit Invoice modal
function openEditModal(id) {
    const inv = state.invoices.find(invoice => invoice.id === id);
    if (!inv) return;

    DOM.editInvoiceId.value = inv.id;
    DOM.editCustName.value = inv.customerName || '';
    DOM.editCustPhone.value = inv.customerPhone || '';
    DOM.editSaleDate.value = inv.date;

    DOM.editSalesRowsContainer.innerHTML = '';
    
    // Fill in existing items + 1 empty row for subsequent additions
    if (inv.items && inv.items.length > 0) {
        inv.items.forEach((item, index) => {
            const row = createRowElement(index + 1, true);
            row.querySelector('.item-name').value = item.name;
            row.querySelector('.item-price').value = item.price;
            row.querySelector('.item-currency').value = item.currency;
            row.querySelector('.item-quantity').value = item.quantity;
            DOM.editSalesRowsContainer.appendChild(row);
        });
        // Append 1 empty row ready for adding further items
        DOM.editSalesRowsContainer.appendChild(createRowElement(inv.items.length + 1, true));
    } else {
        DOM.editSalesRowsContainer.appendChild(createRowElement(1, true));
    }

    handleRowCalculations(DOM.editSalesRowsContainer, DOM.editTotalUsd, DOM.editTotalRiel);
    
    DOM.editModal.classList.add('active-modal');
}

// Save changes made in edit modal
function saveEditedInvoice() {
    const id = DOM.editInvoiceId.value;
    const name = DOM.editCustName.value.trim();
    const phone = DOM.editCustPhone.value.trim();
    const date = DOM.editSaleDate.value;

    if (!date) {
        showToast('សូមជ្រើសរើសថ្ងៃខែឆ្នាំទិញអីវ៉ាន់', 'error');
        return;
    }

    const items = [];
    const rows = DOM.editSalesRowsContainer.querySelectorAll('tr');
    
    rows.forEach(row => {
        const nameVal = row.querySelector('.item-name').value.trim();
        const rawPrice = row.querySelector('.item-price').value.trim();
        const priceVal = rawPrice === '' ? 0 : parseFloat(rawPrice);
        const currVal = row.querySelector('.item-currency').value;
        const qtyVal = parseInt(row.querySelector('.item-quantity').value) || 1;

        if (nameVal !== '' && !isNaN(priceVal)) {
            items.push({
                name: nameVal,
                price: priceVal,
                currency: currVal,
                quantity: qtyVal,
                total: priceVal * qtyVal
            });
        }
    });

    if (items.length === 0) {
        showToast('សូមបញ្ចូលមុខទំនិញយ៉ាងហោចណាស់ ១ ក្នុងតារាង', 'error');
        return;
    }

    let invoiceUSD = 0;
    let invoiceRiel = 0;
    
    items.forEach(it => {
        if (it.currency === 'USD') {
            invoiceUSD += it.total;
            invoiceRiel += it.total * state.exchangeRate;
        } else {
            invoiceRiel += it.total;
            invoiceUSD += it.total / state.exchangeRate;
        }
    });

    const index = state.invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
        state.invoices[index] = {
            ...state.invoices[index],
            customerName: name,
            customerPhone: phone,
            date: date,
            items: items,
            totalUSD: invoiceUSD,
            totalRiel: invoiceRiel
        };
        
        saveInvoices();
        DOM.editModal.classList.remove('active-modal');
        showToast('វិក្កយបត្រត្រូវបានកែប្រែដោយជោគជ័យ', 'success');
    }
}

// Build standard receipt markup for modal viewing and print preview
function previewReceipt(id) {
    const inv = state.invoices.find(invoice => invoice.id === id);
    if (!inv) return;

    let itemsHtml = '';
    inv.items.forEach((item, index) => {
        itemsHtml += `
            <tr>
                <td style="padding: 4px 0; vertical-align: top;">${index + 1}. ${item.name}</td>
                <td style="padding: 4px 0; text-align: center; font-family: var(--font-number);">${item.quantity}</td>
                <td style="padding: 4px 0; text-align: right; font-family: var(--font-number);">${formatCurrency(item.price, item.currency)}</td>
                <td style="padding: 4px 0; text-align: right; font-family: var(--font-number);">${formatCurrency(item.total, item.currency)}</td>
            </tr>
        `;
    });

    const receiptMarkup = `
        <div class="print-header">
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: bold; text-transform: uppercase;">សុខ ស៊ីណេត</h2>
            <p style="margin: 4px 0 0; font-size: 0.8rem; color: #444; font-weight: 500;">ផ្សារព្រៃម្នាស់.ស្វាយរៀង • ទូរស័ព្ទ៖ 0975003993</p>
        </div>
        
        <table class="print-meta-table" style="width: 100%; font-size: 0.75rem; border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin: 12px 0; padding: 6px 0;">
            <tr>
                <td><strong>លេខវិក្កយបត្រ (Inv ID):</strong></td>
                <td style="text-align: right; font-family: var(--font-number); font-weight: bold;">${inv.id}</td>
            </tr>
            <tr>
                <td><strong>កាលបរិច្ឆេទ (Date):</strong></td>
                <td style="text-align: right; font-family: var(--font-number);">${formatDateKhmer(inv.date)}</td>
            </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; margin-bottom: 12px;">
            <thead>
                <tr style="border-bottom: 1px solid #000;">
                    <th style="text-align: left; padding-bottom: 5px;">មុខទំនិញ</th>
                    <th style="text-align: center; padding-bottom: 5px; width: 40px;">ចំនួន</th>
                    <th style="text-align: right; padding-bottom: 5px; width: 70px;">តម្លៃ</th>
                    <th style="text-align: right; padding-bottom: 5px; width: 85px;">សរុប</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <table class="print-totals" style="width: 100%; font-size: 0.8rem; border-top: 1px dashed #000; padding-top: 8px;">
            <tr style="font-weight: bold;">
                <td style="padding: 2px 0;">សរុបរួមជា ដុល្លារ (Total USD):</td>
                <td style="text-align: right; font-family: var(--font-number); font-size: 0.9rem;">${formatCurrency(inv.totalUSD, 'USD')}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="padding: 2px 0;">សរុបរួមជា រៀល (Total Riel):</td>
                <td style="text-align: right; font-family: var(--font-number); font-size: 0.9rem; color: #111;">${formatCurrency(inv.totalRiel, 'KHR')}</td>
            </tr>
        </table>

        <div style="font-size: 0.7rem; color: #333; margin-top: 8px; font-style: italic; border-top: 1px solid #ddd; padding-top: 4px;">
            * អត្រាប្តូរប្រាក់ (Ex Rate): 1 USD = ${formatNumber(state.exchangeRate)} ៛
        </div>
        
        <div class="print-footer" style="text-align: center; margin-top: 25px; padding-top: 10px; border-top: 1px solid #000; font-size: 0.75rem;">
            <p style="margin: 0; font-weight: bold;">សូមអរគុណ សូមអញ្ជើញមកម្តងទៀត!</p>
            <p style="margin: 3px 0 0; color: #555;">Thank You! Please Come Again.</p>
        </div>
    `;

    DOM.receiptPreviewContent.innerHTML = receiptMarkup;
    DOM.printReceiptSection.innerHTML = receiptMarkup; // set hidden section contents for actual physical page print
    DOM.receiptModal.classList.add('active-modal');
}

// Backup database as CSV
function exportCSV() {
    if (state.invoices.length === 0) {
        showToast('មិនមានទិន្នន័យលក់សម្រាប់ទាញយកឡើយ', 'error');
        return;
    }

    let csvContent = 'InvoiceID,Date,CustomerName,Phone,ItemNo,ItemName,Price,Currency,Quantity,ItemTotal\r\n';
    
    state.invoices.forEach(inv => {
        const name = escapeCSVField(inv.customerName || '');
        const phone = escapeCSVField(inv.customerPhone || '');
        
        inv.items.forEach((item, index) => {
            const itemName = escapeCSVField(item.name);
            const line = [
                inv.id,
                inv.date,
                name,
                phone,
                index + 1,
                itemName,
                item.price,
                item.currency,
                item.quantity,
                item.total
            ].join(',');
            csvContent += line + '\r\n';
        });
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Database_Backup_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('ឯកសារ CSV ត្រូវបានទាញយកដោយជោគជ័យ', 'success');
}

function escapeCSVField(field) {
    if (typeof field !== 'string') return field;
    if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
        return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
}

// Restore database from uploaded CSV
function importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            let text = evt.target.result;
            // Strip BOM if present
            if (text.charCodeAt(0) === 0xFEFF) {
                text = text.substring(1);
            }
            const parsedRows = csvToArray(text);
            
            if (parsedRows.length <= 1) {
                showToast('ឯកសារ CSV ទទេ ឬមិនមានទិន្នន័យ', 'error');
                return;
            }

            // Read header to verify format
            const header = parsedRows[0];
            const requiredHeaders = ['InvoiceID', 'Date', 'CustomerName', 'Phone', 'ItemNo', 'ItemName', 'Price', 'Currency', 'Quantity', 'ItemTotal'];
            const isValidHeader = requiredHeaders.every(h => header.includes(h));
            
            if (!isValidHeader) {
                showToast('ឯកសារ CSV មិនត្រឹមត្រូវតាមទម្រង់ដែលប្រព័ន្ធទាមទារ', 'error');
                return;
            }

            // Map columns
            const colMap = {};
            header.forEach((h, idx) => {
                colMap[h.trim()] = idx;
            });

            // Group transactions by InvoiceID
            const invoiceMap = {};

            for (let i = 1; i < parsedRows.length; i++) {
                const row = parsedRows[i];
                if (row.length < 5 || row.every(cell => cell === '')) continue; // Skip empty rows

                const id = row[colMap['InvoiceID']].trim();
                const date = row[colMap['Date']].trim();
                const custName = row[colMap['CustomerName']].trim();
                const phone = row[colMap['Phone']].trim();
                
                const itemName = row[colMap['ItemName']].trim();
                const price = parseFloat(row[colMap['Price']]) || 0;
                const currency = row[colMap['Currency']].trim();
                const qty = parseInt(row[colMap['Quantity']]) || 1;
                const total = parseFloat(row[colMap['ItemTotal']]) || (price * qty);

                if (!id || !date || !itemName) continue; // Skip incomplete items

                if (!invoiceMap[id]) {
                    invoiceMap[id] = {
                        id: id,
                        customerName: custName,
                        customerPhone: phone,
                        date: date,
                        items: []
                    };
                }

                invoiceMap[id].items.push({
                    name: itemName,
                    price: price,
                    currency: currency,
                    quantity: qty,
                    total: total
                });
            }

            // Convert to array and calculate overall invoice totals
            const importedInvoices = Object.values(invoiceMap);
            
            importedInvoices.forEach(inv => {
                let invoiceUSD = 0;
                let invoiceRiel = 0;
                
                inv.items.forEach(it => {
                    if (it.currency === 'USD') {
                        invoiceUSD += it.total;
                        invoiceRiel += it.total * state.exchangeRate;
                    } else {
                        invoiceRiel += it.total;
                        invoiceUSD += it.total / state.exchangeRate;
                    }
                });

                inv.totalUSD = invoiceUSD;
                inv.totalRiel = invoiceRiel;
            });

            if (importedInvoices.length === 0) {
                showToast('មិនមានប្រតិបត្តិការលក់ត្រូវបានរកឃើញក្នុងឯកសារ CSV ឡើយ', 'error');
                return;
            }

            // Append or Overwrite? In this case, we overwrite the current state with import data
            if (confirm(`តើអ្នកចង់បញ្ចូលទិន្នន័យវិក្កយបត្រថ្មីចំនួន ${importedInvoices.length} នេះជំនួសទិន្នន័យបច្ចុប្បន្នមែនទេ?`)) {
                state.invoices = importedInvoices;
                saveInvoices();
                showToast(`បានបញ្ចូលទិន្នន័យវិក្កយបត្រចំនួន ${importedInvoices.length} ដោយជោគជ័យ`, 'success');
            }

        } catch (error) {
            console.error(error);
            showToast('មានបញ្ហាក្នុងការអានឯកសារ CSV សូមពិនិត្យឯកសារម្តងទៀត', 'error');
        }
        
        // Reset input value to allow uploading same file again
        DOM.importCsvInput.value = '';
    };

    reader.readAsText(file);
}

// Regex-free CSV parser supporting embedded commas & quotes
function csvToArray(text) {
    let p = '', c = '', r = [];
    let q = false;
    let row = [''];
    for (let i = 0; i < text.length; i++) {
        c = text[i];
        let next = text[i+1];
        if (c === '"') {
            if (q && next === '"') { row[row.length - 1] += '"'; i++; }
            else { q = !q; }
        } else if (c === ',' && !q) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !q) {
            if (c === '\r' && next === '\n') { i++; }
            r.push(row);
            row = [''];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== '') { r.push(row); }
    return r;
}

// Show custom dynamic toaster notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="${icon}" style="font-size: 1.25rem;"></i>
        <div style="font-size: 0.85rem; font-weight: 500;">${message}</div>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    // Auto remove after 3s
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.2s reverse forwards';
        setTimeout(() => {
            toast.remove();
        }, 200);
    }, 3000);
}

// Generate premium mock invoices for demo purposes
function getSampleInvoices() {
    const today = new Date();
    const days = (offset) => {
        const d = new Date(today);
        d.setDate(today.getDate() - offset);
        return d.toISOString().split('T')[0];
    };

    const makeId = (dateStr, suffix) => {
        const parts = dateStr.split('-');
        return `SN-${parts[2]}${parts[1]}${parts[0]}-${suffix}`;
    };

    return [
        {
            id: makeId(days(0), '9821'),
            customerName: 'សុខ គង់',
            customerPhone: '098765432',
            date: days(0),
            items: [
                { name: 'ទឹកដោះគោគោជល់', price: 1.5, currency: 'USD', quantity: 2, total: 3.0 },
                { name: 'សាប៊ូកក់សក់ Clear', price: 12000, currency: 'KHR', quantity: 1, total: 12000 },
                { name: 'ទឹកក្រូច Fanta', price: 0.6, currency: 'USD', quantity: 5, total: 3.0 }
            ],
            totalUSD: 8.92,
            totalRiel: 36600
        },
        {
            id: makeId(days(1), '4212'),
            customerName: 'លីណា ម៉ៅ',
            customerPhone: '087223344',
            date: days(1),
            items: [
                { name: 'ប្រេងឆា កូនកាត់', price: 5.5, currency: 'USD', quantity: 2, total: 11.0 },
                { name: 'អង្ករម្លិះប្រណីត (10kg)', price: 42000, currency: 'KHR', quantity: 1, total: 42000 }
            ],
            totalUSD: 21.24,
            totalRiel: 87100
        },
        {
            id: makeId(days(2), '1310'),
            customerName: 'ចាន់ ធារ៉ា',
            customerPhone: '012998877',
            date: days(2),
            items: [
                { name: 'កាហ្វេ Nescafe 3in1', price: 4.8, currency: 'USD', quantity: 3, total: 14.4 },
                { name: 'ស្ករសស (1kg)', price: 4500, currency: 'KHR', quantity: 2, total: 9000 },
                { name: 'ទឹកត្រីកោះកុង', price: 1.2, currency: 'USD', quantity: 4, total: 4.8 }
            ],
            totalUSD: 21.39,
            totalRiel: 87700
        },
        {
            id: makeId(days(3), '8551'),
            customerName: 'ចិន្តា វង្ស',
            customerPhone: '095667788',
            date: days(3),
            items: [
                { name: 'មីជាតិរសជាតិសាច់ជ្រូក', price: 0.25, currency: 'USD', quantity: 30, total: 7.5 },
                { name: 'ទឹកស៊ីអ៊ីវ ថៃ', price: 6500, currency: 'KHR', quantity: 3, total: 19500 }
            ],
            totalUSD: 12.25,
            totalRiel: 50250
        },
        {
            id: makeId(days(4), '3221'),
            customerName: 'សុផល ហេង',
            customerPhone: '070554433',
            date: days(4),
            items: [
                { name: 'ស្រាបៀរ Anchor (កេស)', price: 12.5, currency: 'USD', quantity: 2, total: 25.0 }
            ],
            totalUSD: 25.0,
            totalRiel: 102500
        }
    ];
}
