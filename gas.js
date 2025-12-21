// Initialize Lucide icons
lucide.createIcons();

// Gas fee data structure
const blockchainData = {
    'ethereum': {
        name: 'Ethereum',
        color: '#627eea',
        icon: 'ethereum',
        explorer: 'https://etherscan.io/gastracker',
        symbol: 'ETH',
        baseFee: true
    },
    'base': {
        name: 'Base',
        color: '#0052ff',
        icon: 'layers',
        explorer: 'https://basescan.org/gastracker',
        symbol: 'ETH',
        baseFee: true
    },
    'polygon': {
        name: 'Polygon',
        color: '#8247e5',
        icon: 'hexagon',
        explorer: 'https://polygonscan.com/gastracker',
        symbol: 'MATIC',
        baseFee: false
    },
    'arbitrum': {
        name: 'Arbitrum',
        color: '#28a0f0',
        icon: 'circle',
        explorer: 'https://arbiscan.io/gastracker',
        symbol: 'ETH',
        baseFee: true
    },
    'optimism': {
        name: 'Optimism',
        color: '#ff0420',
        icon: 'zap',
        explorer: 'https://optimistic.etherscan.io/gastracker',
        symbol: 'ETH',
        baseFee: true
    },
    'bsc': {
        name: 'BSC',
        color: '#f3ba2f',
        icon: 'dollar-sign',
        explorer: 'https://bscscan.com/gastracker',
        symbol: 'BNB',
        baseFee: false
    }
};

// Current gas fee data
let gasData = {};
let updateCounter = 0;
let lastUpdateTime = Date.now();
let autoRefresh = true;
let refreshInterval;
let currentView = 'table';
let alerts = [];

// DOM Elements
const updateTimeElement = document.getElementById('updateTime');
const lastUpdatedText = document.getElementById('lastUpdatedText');
const gasTableBody = document.getElementById('gasTableBody');
const gasCardsGrid = document.getElementById('gasCardsGrid');
const tableView = document.getElementById('tableView');
const cardsView = document.getElementById('cardsView');
const viewButtons = document.querySelectorAll('[data-view]');
const lowestGasValue = document.getElementById('lowestGasValue');
const lowestGasChain = document.getElementById('lowestGasChain');
const averageGasValue = document.getElementById('averageGasValue');
const highestGasValue = document.getElementById('highestGasValue');
const highestGasChain = document.getElementById('highestGasChain');
const ethBlockNumber = document.getElementById('ethBlockNumber');
const tableStats = document.getElementById('tableStats');
const comparisonBars = document.getElementById('comparisonBars');
const autoRefreshToggle = document.getElementById('autoRefreshToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const showUSDToggle = document.getElementById('showUSDToggle');
const refreshNowBtn = document.getElementById('refreshNowBtn');
const bestChainBtn = document.getElementById('bestChainBtn');
const addAlertBtn = document.getElementById('addAlertBtn');
const alertModal = document.getElementById('alertModal');
const closeAlertModal = document.getElementById('closeAlertModal');
const saveAlertBtn = document.getElementById('saveAlertBtn');
const cancelAlertBtn = document.getElementById('cancelAlertBtn');
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

// Initialize with realistic gas data
function initializeGasData() {
    const baseValues = {
        'ethereum': { slow: 15, standard: 25, fast: 40, instant: 60 },
        'base': { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5 },
        'polygon': { slow: 30, standard: 50, fast: 80, instant: 120 },
        'arbitrum': { slow: 0.05, standard: 0.1, fast: 0.2, instant: 0.3 },
        'optimism': { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5 },
        'bsc': { slow: 3, standard: 5, fast: 8, instant: 12 }
    };

    for (const chain in baseValues) {
        const base = baseValues[chain];
        const fluctuation = (Math.random() - 0.5) * 0.2; // +/- 10%
        
        gasData[chain] = {
            slow: Math.max(0.01, base.slow * (1 + fluctuation)),
            standard: Math.max(0.01, base.standard * (1 + fluctuation)),
            fast: Math.max(0.01, base.fast * (1 + fluctuation)),
            instant: Math.max(0.01, base.instant * (1 + fluctuation)),
            change24h: (Math.random() - 0.5) * 20, // -10% to +10%
            lastUpdated: Date.now()
        };
    }
}

// Calculate USD cost for standard ERC-20 transfer
function calculateUSDCost(gasPrice, chain) {
    const gasLimit = 65000; // Standard ERC-20 transfer
    let tokenPrice = 1;
    
    // Simplified token prices
    const prices = {
        'ethereum': 3500,
        'base': 3500,
        'arbitrum': 3500,
        'optimism': 3500,
        'polygon': 0.8,
        'bsc': 600
    };
    
    tokenPrice = prices[chain] || 1;
    const gasInToken = (gasPrice * gasLimit) / 1e9;
    return (gasInToken * tokenPrice).toFixed(2);
}

// Get status based on gas price
function getStatus(gasPrice, chain) {
    const thresholds = {
        'ethereum': { low: 20, medium: 40, high: 60 },
        'base': { low: 0.3, medium: 0.5, high: 1 },
        'polygon': { low: 50, medium: 100, high: 150 },
        'arbitrum': { low: 0.1, medium: 0.3, high: 0.5 },
        'optimism': { low: 0.2, medium: 0.4, high: 0.8 },
        'bsc': { low: 5, medium: 10, high: 15 }
    };
    
    const threshold = thresholds[chain];
    if (!threshold) return 'medium';
    
    if (gasPrice < threshold.low) return 'low';
    if (gasPrice < threshold.medium) return 'medium';
    if (gasPrice < threshold.high) return 'high';
    return 'very-high';
}

// Update gas prices with realistic fluctuations
function updateGasPrices() {
    for (const chain in gasData) {
        const current = gasData[chain];
        const fluctuation = (Math.random() - 0.5) * 0.1; // +/- 5%
        
        gasData[chain] = {
            slow: Math.max(0.01, current.slow * (1 + fluctuation)),
            standard: Math.max(0.01, current.standard * (1 + fluctuation)),
            fast: Math.max(0.01, current.fast * (1 + fluctuation)),
            instant: Math.max(0.01, current.instant * (1 + fluctuation)),
            change24h: current.change24h + (Math.random() - 0.5) * 5,
            lastUpdated: Date.now()
        };
    }
}

// Update the gas table
function updateGasTable() {
    gasTableBody.innerHTML = '';
    
    Object.entries(blockchainData).forEach(([id, chain]) => {
        if (!gasData[id]) return;
        
        const data = gasData[id];
        const status = getStatus(data.standard, id);
        const change = data.change24h;
        const usdCost = calculateUSDCost(data.standard, id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="chain-cell">
                    <div class="chain-icon-small" style="background: ${chain.color}">
                        <i data-lucide="${chain.icon}"></i>
                    </div>
                    <div>
                        <div style="font-weight: 600;">${chain.name}</div>
                        <div style="font-size: 0.75rem; color: var(--color-neutral-500);">${chain.symbol}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="gas-price-cell">
                    <div class="gas-price slow">${data.slow.toFixed(2)}</div>
                    <div class="gas-price-usd">$${calculateUSDCost(data.slow, id)}</div>
                </div>
            </td>
            <td>
                <div class="gas-price-cell">
                    <div class="gas-price standard">${data.standard.toFixed(2)}</div>
                    <div class="gas-price-usd">$${usdCost}</div>
                </div>
            </td>
            <td>
                <div class="gas-price-cell">
                    <div class="gas-price fast">${data.fast.toFixed(2)}</div>
                    <div class="gas-price-usd">$${calculateUSDCost(data.fast, id)}</div>
                </div>
            </td>
            <td>
                <div class="gas-price-cell">
                    <div class="gas-price instant">${data.instant.toFixed(2)}</div>
                    <div class="gas-price-usd">$${calculateUSDCost(data.instant, id)}</div>
                </div>
            </td>
            <td>
                <div style="font-weight: 600;">$${usdCost}</div>
                <div style="font-size: 0.75rem; color: var(--color-neutral-500);">Standard transfer</div>
            </td>
            <td>
                <div class="status-badge status-${status}">
                    <i data-lucide="${status === 'low' ? 'trending-down' : status === 'high' ? 'trending-up' : 'minus'}"></i>
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
            </td>
            <td>
                <div class="change-indicator ${change >= 0 ? 'change-up' : 'change-down'}">
                    <i data-lucide="${change >= 0 ? 'trending-up' : 'trending-down'}"></i>
                    ${Math.abs(change).toFixed(1)}%
                </div>
            </td>
        `;
        
        gasTableBody.appendChild(row);
    });
    
    lucide.createIcons();
}

// Update gas cards view
function updateGasCards() {
    gasCardsGrid.innerHTML = '';
    
    Object.entries(blockchainData).forEach(([id, chain]) => {
        if (!gasData[id]) return;
        
        const data = gasData[id];
        const usdCost = calculateUSDCost(data.standard, id);
        
        const card = document.createElement('div');
        card.className = 'gas-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="chain-header">
                    <div class="chain-icon" style="background: ${chain.color}">
                        <i data-lucide="${chain.icon}"></i>
                    </div>
                    <div>
                        <div class="chain-name">${chain.name}</div>
                        <div class="chain-symbol">${chain.symbol}</div>
                    </div>
                </div>
                <div class="status-badge status-${getStatus(data.standard, id)}">
                    ${getStatus(data.standard, id).toUpperCase()}
                </div>
            </div>
            
            <div class="gas-prices">
                <div class="gas-tier">
                    <div class="tier-label">Slow</div>
                    <div class="tier-value slow">${data.slow.toFixed(2)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-neutral-500);">$${calculateUSDCost(data.slow, id)}</div>
                </div>
                <div class="gas-tier">
                    <div class="tier-label">Standard</div>
                    <div class="tier-value standard">${data.standard.toFixed(2)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-neutral-500);">$${usdCost}</div>
                </div>
                <div class="gas-tier">
                    <div class="tier-label">Fast</div>
                    <div class="tier-value fast">${data.fast.toFixed(2)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-neutral-500);">$${calculateUSDCost(data.fast, id)}</div>
                </div>
                <div class="gas-tier">
                    <div class="tier-label">Instant</div>
                    <div class="tier-value instant">${data.instant.toFixed(2)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-neutral-500);">$${calculateUSDCost(data.instant, id)}</div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="usd-estimate">
                    Standard transfer: <strong>$${usdCost}</strong>
                </div>
                <button class="explorer-btn" onclick="window.open('${chain.explorer}', '_blank')">
                    <i data-lucide="external-link"></i>
                    Explorer
                </button>
            </div>
        `;
        
        gasCardsGrid.appendChild(card);
    });
    
    lucide.createIcons();
}

// Update summary statistics
function updateSummaryStats() {
    let totalGas = 0;
    let chainCount = 0;
    let lowestGas = Infinity;
    let lowestGasChainName = '';
    let highestGas = 0;
    let highestGasChainName = '';
    
    Object.entries(blockchainData).forEach(([id, chain]) => {
        if (!gasData[id]) return;
        
        const gas = gasData[id].standard;
        totalGas += gas;
        chainCount++;
        
        if (gas < lowestGas) {
            lowestGas = gas;
            lowestGasChainName = chain.name;
        }
        
        if (gas > highestGas) {
            highestGas = gas;
            highestGasChainName = chain.name;
        }
    });
    
    const averageGas = totalGas / chainCount;
    
    lowestGasValue.textContent = `${lowestGas.toFixed(2)} Gwei`;
    lowestGasChain.textContent = lowestGasChainName;
    averageGasValue.textContent = `${averageGas.toFixed(2)} Gwei`;
    highestGasValue.textContent = `${highestGas.toFixed(2)} Gwei`;
    highestGasChain.textContent = highestGasChainName;
    
    // Update block number
    const baseBlock = 18456789;
    const currentBlock = baseBlock + updateCounter * 12;
    ethBlockNumber.textContent = (currentBlock / 1000000).toFixed(2) + 'M';
    
    // Update table stats
    const lowCount = Object.values(gasData).filter(data => 
        getStatus(data.standard, 'ethereum') === 'low'
    ).length;
    
    tableStats.textContent = `${lowCount}/${chainCount} chains have low gas`;
}

// Update comparison bars
function updateComparisonBars() {
    comparisonBars.innerHTML = '';
    
    Object.entries(blockchainData).forEach(([id, chain]) => {
        if (!gasData[id]) return;
        
        const gas = gasData[id].standard;
        // Scale the bar height (max 100 Gwei for scaling)
        const maxGas = 100;
        const height = Math.min((gas / maxGas) * 100, 100);
        
        const bar = document.createElement('div');
        bar.className = 'comparison-bar';
        bar.style.height = `${height}%`;
        bar.style.background = chain.color;
        
        bar.innerHTML = `
            <div class="comparison-bar-value">${gas.toFixed(2)}</div>
            <div class="comparison-bar-label">${chain.name}</div>
        `;
        
        comparisonBars.appendChild(bar);
    });
}

// Update last updated time
function updateLastUpdated() {
    const now = Date.now();
    const secondsAgo = Math.floor((now - lastUpdateTime) / 1000);
    
    updateTimeElement.textContent = secondsAgo;
    
    if (secondsAgo < 60) {
        lastUpdatedText.querySelector('span').textContent = `Updated ${secondsAgo} seconds ago`;
    } else if (secondsAgo < 3600) {
        const minutes = Math.floor(secondsAgo / 60);
        lastUpdatedText.querySelector('span').textContent = `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
}

// Refresh all data
function refreshAllData() {
    updateCounter++;
    lastUpdateTime = Date.now();
    
    updateGasPrices();
    updateGasTable();
    updateGasCards();
    updateSummaryStats();
    updateComparisonBars();
    updateLastUpdated();
    checkAlerts();
    
    showNotification('Gas data updated', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)'};
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        max-width: 300px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Toggle auto refresh
function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    
    if (autoRefresh) {
        refreshInterval = setInterval(refreshAllData, 30000); // 30 seconds
        showNotification('Auto-refresh enabled (30s interval)', 'success');
    } else {
        clearInterval(refreshInterval);
        showNotification('Auto-refresh disabled', 'info');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Toggle USD display
function toggleUSDDisplay() {
    const showUSD = document.getElementById('showUSDToggle').checked;
    document.body.classList.toggle('show-usd', showUSD);
    localStorage.setItem('showUSD', showUSD);
}

// Switch view between table and cards
function switchView(view) {
    currentView = view;
    
    viewButtons.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (view === 'table') {
        tableView.classList.add('active');
        cardsView.classList.remove('active');
    } else {
        tableView.classList.remove('active');
        cardsView.classList.add('active');
    }
    
    localStorage.setItem('gasView', view);
}

// Find best chain for transactions
function findBestChain() {
    let bestChain = '';
    let lowestGas = Infinity;
    
    Object.entries(blockchainData).forEach(([id, chain]) => {
        if (!gasData[id]) return;
        
        const gas = gasData[id].standard;
        if (gas < lowestGas) {
            lowestGas = gas;
            bestChain = chain.name;
        }
    });
    
    showNotification(`Best chain: ${bestChain} (${lowestGas.toFixed(2)} Gwei)`, 'success');
}

// Add gas alert
function addAlert() {
    alertModal.classList.add('active');
}

// Save alert
function saveAlert() {
    const threshold = document.getElementById('alertThreshold').value;
    const chain = document.getElementById('alertCondition').value;
    
    if (!threshold || isNaN(threshold) || threshold <= 0) {
        showNotification('Please enter a valid gas price', 'error');
        return;
    }
    
    const alert = {
        id: Date.now(),
        threshold: parseFloat(threshold),
        chain: chain,
        condition: document.getElementById('alertCondition').value,
        createdAt: new Date().toISOString()
    };
    
    alerts.push(alert);
    saveAlerts();
    updateAlertsList();
    alertModal.classList.remove('active');
    
    showNotification('Gas alert saved', 'success');
}

// Check alerts
function checkAlerts() {
    alerts.forEach(alert => {
        const chainData = gasData[alert.chain];
        if (!chainData) return;
        
        const currentGas = chainData.standard;
        const shouldAlert = alert.condition === 'below' 
            ? currentGas <= alert.threshold
            : currentGas >= alert.threshold;
        
        if (shouldAlert) {
            showNotification(`${alert.chain.toUpperCase()} gas is ${alert.condition} ${alert.threshold} Gwei (Current: ${currentGas.toFixed(2)} Gwei)`, 'warning');
        }
    });
}

// Update alerts list
function updateAlertsList() {
    const alertsList = document.getElementById('alertsList');
    
    if (alerts.length === 0) {
        alertsList.innerHTML = `
            <div class="empty-alerts">
                <i data-lucide="bell-off"></i>
                <p>No alerts set up yet</p>
            </div>
        `;
        return;
    }
    
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <div class="alert-chain-icon" style="background: ${blockchainData[alert.chain]?.color || '#64748b'}">
                <i data-lucide="${blockchainData[alert.chain]?.icon || 'bell'}"></i>
            </div>
            <div class="alert-info">
                <div class="alert-title">${alert.chain.toUpperCase()} ${alert.condition} ${alert.threshold} Gwei</div>
                <div class="alert-time">Set ${new Date(alert.createdAt).toLocaleTimeString()}</div>
            </div>
            <button class="alert-remove" onclick="removeAlert(${alert.id})">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// Remove alert
function removeAlert(id) {
    alerts = alerts.filter(alert => alert.id !== id);
    saveAlerts();
    updateAlertsList();
    showNotification('Alert removed', 'info');
}

// Save alerts to localStorage
function saveAlerts() {
    localStorage.setItem('gasAlerts', JSON.stringify(alerts));
}

// Load alerts from localStorage
function loadAlerts() {
    const saved = localStorage.getItem('gasAlerts');
    if (saved) {
        alerts = JSON.parse(saved);
        updateAlertsList();
    }
}

// Load settings from localStorage
function loadSettings() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const showUSD = localStorage.getItem('showUSD') !== 'false';
    const savedView = localStorage.getItem('gasView') || 'table';
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
    
    if (showUSD) {
        document.body.classList.add('show-usd');
        document.getElementById('showUSDToggle').checked = true;
    }
    
    switchView(savedView);
}

// Mobile menu toggle
function toggleMobileMenu() {
    sidebar.classList.toggle('active');
}

// Initialize the app
function init() {
    // Load data and settings
    initializeGasData();
    loadSettings();
    loadAlerts();
    
    // Initial render
    refreshAllData();
    
    // Set up auto refresh
    refreshInterval = setInterval(refreshAllData, 30000);
    
    // Update last updated time every second
    setInterval(updateLastUpdated, 1000);
    
    // Event listeners
    autoRefreshToggle.addEventListener('change', toggleAutoRefresh);
    darkModeToggle.addEventListener('change', toggleDarkMode);
    showUSDToggle.addEventListener('change', toggleUSDDisplay);
    refreshNowBtn.addEventListener('click', refreshAllData);
    bestChainBtn.addEventListener('click', findBestChain);
    addAlertBtn.addEventListener('click', addAlert);
    closeAlertModal.addEventListener('click', () => alertModal.classList.remove('active'));
    cancelAlertBtn.addEventListener('click', () => alertModal.classList.remove('active'));
    saveAlertBtn.addEventListener('click', saveAlert);
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // View toggle buttons
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    // Filter changes
    document.getElementById('gasSpeedFilter').addEventListener('change', function() {
        // Implement filtering logic here
    });
    
    document.getElementById('chainFilter').addEventListener('change', function() {
        // Implement filtering logic here
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .dark-mode {
            --color-neutral-50: #0f172a;
            --color-neutral-100: #1e293b;
            --color-neutral-200: #334155;
            --color-neutral-300: #475569;
            --color-neutral-400: #64748b;
            --color-neutral-500: #94a3b8;
            --color-neutral-600: #cbd5e1;
            --color-neutral-700: #e2e8f0;
            --color-neutral-800: #f1f5f9;
            --color-neutral-900: #f8fafc;
            background: var(--color-neutral-50);
            color: var(--color-neutral-800);
        }
        
        .dark-mode .sidebar,
        .dark-mode .section-card,
        .dark-mode .summary-card:not(.primary),
        .dark-mode .gas-card {
            background: var(--color-neutral-100);
            border-color: var(--color-neutral-200);
        }
        
        .dark-mode .gas-table th {
            background: var(--color-neutral-200);
            color: var(--color-neutral-700);
        }
        
        .dark-mode .gas-table tr:hover {
            background: var(--color-neutral-200);
        }
        
        .alert-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--color-neutral-50);
            border-radius: var(--border-radius);
            margin-bottom: 0.75rem;
            border: 1px solid var(--color-neutral-200);
        }
        
        .alert-chain-icon {
            width: 40px;
            height: 40px;
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .alert-info {
            flex: 1;
        }
        
        .alert-title {
            font-weight: 600;
            color: var(--color-neutral-900);
        }
        
        .alert-time {
            font-size: 0.75rem;
            color: var(--color-neutral-500);
        }
        
        .alert-remove {
            width: 32px;
            height: 32px;
            border-radius: var(--border-radius-sm);
            border: 1px solid var(--color-neutral-200);
            background: var(--color-neutral-100);
            color: var(--color-danger);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        
        .alert-remove:hover {
            background: var(--color-neutral-200);
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
