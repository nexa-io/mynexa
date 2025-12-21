// Initialize Lucide icons
lucide.createIcons();

// Gas fee data structure for supported blockchains
const blockchainData = {
    'Ethereum': {
        color: '#627eea',
        icon: 'ethereum',
        explorer: 'https://etherscan.io',
        nativeToken: 'ETH'
    },
    'Base': {
        color: '#0052ff',
        icon: 'layers',
        explorer: 'https://basescan.org',
        nativeToken: 'ETH'
    },
    'Polygon': {
        color: '#8247e5',
        icon: 'hexagon',
        explorer: 'https://polygonscan.com',
        nativeToken: 'MATIC'
    },
    'Arbitrum': {
        color: '#28a0f0',
        icon: 'circle',
        explorer: 'https://arbiscan.io',
        nativeToken: 'ETH'
    },
    'Optimism': {
        color: '#ff0420',
        icon: 'zap',
        explorer: 'https://optimistic.etherscan.io',
        nativeToken: 'ETH'
    },
    'BSC': {
        color: '#f0b90b',
        icon: 'dollar-sign',
        explorer: 'https://bscscan.com',
        nativeToken: 'BNB'
    }
};

// Current gas fee data (simulated - in a real app, this would come from APIs)
let gasData = {
    'Ethereum': { slow: 15, standard: 25, fast: 40, instant: 60, status: 'medium', lastUpdated: Date.now() },
    'Base': { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5, status: 'low', lastUpdated: Date.now() },
    'Polygon': { slow: 30, standard: 50, fast: 80, instant: 120, status: 'low', lastUpdated: Date.now() },
    'Arbitrum': { slow: 0.05, standard: 0.1, fast: 0.2, instant: 0.3, status: 'low', lastUpdated: Date.now() },
    'Optimism': { slow: 0.1, standard: 0.2, fast: 0.3, instant: 0.5, status: 'low', lastUpdated: Date.now() },
    'BSC': { slow: 3, standard: 5, fast: 8, instant: 12, status: 'low', lastUpdated: Date.now() }
};

// Track auto-refresh state
let autoRefresh = true;
let refreshInterval;
let lastUpdateTime = Date.now();
let updateCounter = 0;

// DOM elements
const gasTableBody = document.getElementById('gasTableBody');
const statsContainer = document.getElementById('statsContainer');
const quickGasView = document.getElementById('quickGasView');
const blockchainsGrid = document.getElementById('blockchainsGrid');
const updateTimeElement = document.getElementById('updateTime');
const lastUpdatedElement = document.getElementById('lastUpdated');
const lowestGasElement = document.getElementById('lowestGas');
const lowestChainElement = document.getElementById('lowestChain');
const autoRefreshToggle = document.getElementById('autoRefreshToggle');
const refreshButton = document.getElementById('refreshButton');
const refreshButtonMobile = document.getElementById('refreshButtonMobile');
const recommendButton = document.getElementById('recommendButton');
const bookmarkButton = document.getElementById('bookmarkButton');
const subscribeButton = document.getElementById('subscribeButton');
const subscribeButtonMobile = document.getElementById('subscribeButtonMobile');

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    
    // Toggle icon
    const icon = mobileMenuBtn.querySelector('i');
    if (mobileMenu.classList.contains('active')) {
        icon.setAttribute('data-lucide', 'x');
        document.body.style.overflow = 'hidden';
    } else {
        icon.setAttribute('data-lucide', 'menu');
        document.body.style.overflow = '';
    }
    lucide.createIcons();
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking on a link
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
        document.body.style.overflow = '';
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Calculate USD cost for a standard ERC-20 transfer
function calculateUSDCost(gasPrice, blockchain) {
    // Simplified calculation - in real app, use actual gas limit and token price
    const gasLimit = 65000; // Average for ERC-20 transfer
    let tokenPrice = 1; // Default
    
    // Very simplified token prices (in reality, fetch from API)
    if (blockchain === 'Ethereum' || blockchain === 'Base' || blockchain === 'Arbitrum' || blockchain === 'Optimism') {
        tokenPrice = 3500; // ETH price
    } else if (blockchain === 'Polygon') {
        tokenPrice = 0.8; // MATIC price
    } else if (blockchain === 'BSC') {
        tokenPrice = 600; // BNB price
    }
    
    // Convert from Gwei to ETH/Token
    const gasInToken = (gasPrice * gasLimit) / 1e9;
    const usdCost = gasInToken * tokenPrice;
    
    return usdCost.toFixed(2);
}

// Get status badge class based on gas price
function getStatusClass(gasPrice, blockchain) {
    // Different thresholds for different chains
    let thresholds = {
        'Ethereum': { low: 20, medium: 40, high: 60 },
        'Base': { low: 0.3, medium: 0.5, high: 1 },
        'Polygon': { low: 50, medium: 100, high: 150 },
        'Arbitrum': { low: 0.1, medium: 0.3, high: 0.5 },
        'Optimism': { low: 0.2, medium: 0.4, high: 0.8 },
        'BSC': { low: 5, medium: 10, high: 15 }
    };
    
    const threshold = thresholds[blockchain];
    const standardGas = gasData[blockchain].standard;
    
    if (standardGas < threshold.low) return 'status-low';
    if (standardGas < threshold.medium) return 'status-medium';
    if (standardGas < threshold.high) return 'status-high';
    return 'status-very-high';
}

// Generate random fluctuation in gas prices (simulates real-time changes)
function fluctuateGasPrices() {
    for (const blockchain in gasData) {
        const fluctuation = (Math.random() - 0.5) * 0.2; // +/- 10%
        const current = gasData[blockchain];
        
        // Apply different fluctuation based on blockchain
        let multiplier = 1;
        if (blockchain === 'Ethereum') multiplier = 25;
        if (blockchain === 'Polygon') multiplier = 50;
        if (blockchain === 'BSC') multiplier = 5;
        
        gasData[blockchain] = {
            slow: Math.max(0.01, current.slow * (1 + fluctuation)),
            standard: Math.max(0.01, current.standard * (1 + fluctuation)),
            fast: Math.max(0.01, current.fast * (1 + fluctuation)),
            instant: Math.max(0.01, current.instant * (1 + fluctuation)),
            status: current.status,
            lastUpdated: Date.now()
        };
    }
}

// Update the gas table
function updateGasTable() {
    gasTableBody.innerHTML = '';
    
    for (const blockchain in gasData) {
        const data = gasData[blockchain];
        const blockchainInfo = blockchainData[blockchain];
        const statusClass = getStatusClass(data.standard, blockchain);
        
        // Get status text
        let statusText = 'Low';
        if (statusClass === 'status-medium') statusText = 'Medium';
        if (statusClass === 'status-high') statusText = 'High';
        if (statusClass === 'status-very-high') statusText = 'Very High';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${blockchainInfo.color}; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="${blockchainInfo.icon}" style="width: 14px; height: 14px; color: white;"></i>
                    </div>
                    <div>
                        <div style="font-weight: 600;">${blockchain}</div>
                        <div style="font-size: 0.75rem; color: var(--color-neutral-500);">${blockchainInfo.nativeToken}</div>
                    </div>
                </div>
            </td>
            <td><div class="gas-price slow">${data.slow.toFixed(2)}</div></td>
            <td><div class="gas-price standard">${data.standard.toFixed(2)}</div></td>
            <td><div class="gas-price fast">${data.fast.toFixed(2)}</div></td>
            <td><div class="gas-price instant">${data.instant.toFixed(2)}</div></td>
            <td>
                <div class="usd-cost">$${calculateUSDCost(data.standard, blockchain)}</div>
                <div style="font-size: 0.75rem; color: var(--color-neutral-500);">Standard transfer</div>
            </td>
            <td>
                <div class="status-badge ${statusClass}">
                    <i data-lucide="${statusText === 'Low' ? 'trending-down' : statusText === 'High' ? 'trending-up' : 'minus'}" style="width: 12px; height: 12px;"></i>
                    ${statusText}
                </div>
            </td>
            <td>
                <button class="btn" style="padding: 0.375rem 0.75rem; font-size: 0.875rem; background: rgba(124, 58, 237, 0.1); color: var(--color-primary);" onclick="window.open('${blockchainInfo.explorer}/gastracker', '_blank')">
                    Explorer
                </button>
            </td>
        `;
        
        gasTableBody.appendChild(row);
    }
    
    // Re-initialize icons in the new rows
    lucide.createIcons();
}

// Update stats section
function updateStats() {
    statsContainer.innerHTML = '';
    
    // Find lowest gas
    let lowestGas = Infinity;
    let lowestGasChain = '';
    
    for (const blockchain in gasData) {
        if (gasData[blockchain].standard < lowestGas) {
            lowestGas = gasData[blockchain].standard;
            lowestGasChain = blockchain;
        }
    }
    
    // Calculate average gas
    let totalGas = 0;
    let chainCount = 0;
    
    for (const blockchain in gasData) {
        totalGas += gasData[blockchain].standard;
        chainCount++;
    }
    
    const averageGas = totalGas / chainCount;
    
    // Find highest gas
    let highestGas = 0;
    let highestGasChain = '';
    
    for (const blockchain in gasData) {
        if (gasData[blockchain].standard > highestGas) {
            highestGas = gasData[blockchain].standard;
            highestGasChain = blockchain;
        }
    }
    
    // Count chains with low gas
    let lowGasChains = 0;
    for (const blockchain in gasData) {
        if (getStatusClass(gasData[blockchain].standard, blockchain) === 'status-low') {
            lowGasChains++;
        }
    }
    
    const stats = [
        { value: lowestGas.toFixed(2), label: 'Lowest Gas', unit: 'Gwei', sublabel: lowestGasChain },
        { value: averageGas.toFixed(2), label: 'Average Gas', unit: 'Gwei', sublabel: 'Across all chains' },
        { value: highestGas.toFixed(2), label: 'Highest Gas', unit: 'Gwei', sublabel: highestGasChain },
        { value: lowGasChains, label: 'Chains with Low Gas', unit: '/6', sublabel: 'Good for transactions' }
    ];
    
    stats.forEach((stat, index) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.style.animationDelay = `${0.1 * (index + 1)}s`;
        statItem.innerHTML = `
            <div class="stat-item-value">${stat.value}<span style="font-size: 1rem; color: var(--color-neutral-500);">${stat.unit}</span></div>
            <div class="stat-item-label">${stat.label}</div>
            <div style="font-size: 0.75rem; color: var(--color-neutral-500); margin-top: 0.25rem;">${stat.sublabel}</div>
        `;
        statsContainer.appendChild(statItem);
    });
    
    // Update lowest gas in hero
    lowestGasElement.textContent = `${lowestGas.toFixed(2)} Gwei`;
    lowestChainElement.textContent = lowestGasChain;
}

// Update quick gas view in hero
function updateQuickGasView() {
    quickGasView.innerHTML = '';
    
    const chains = Object.keys(gasData).slice(0, 6);
    
    chains.forEach(chain => {
        const badge = document.createElement('div');
        badge.className = 'blockchain-badge';
        badge.innerHTML = `
            <div style="font-weight: 700;">${chain.substring(0, 3)}</div>
            <div style="font-size: 0.75rem; opacity: 0.8;">${gasData[chain].standard.toFixed(2)}</div>
        `;
        quickGasView.appendChild(badge);
    });
}

// Update blockchains grid
function updateBlockchainsGrid() {
    blockchainsGrid.innerHTML = '';
    
    Object.entries(blockchainData).forEach(([name, info], index) => {
        const card = document.createElement('div');
        card.className = 'security-card';
        card.style.animationDelay = `${0.1 * (index + 1)}s`;
        
        const gasInfo = gasData[name];
        const statusClass = getStatusClass(gasInfo.standard, name);
        const statusText = statusClass === 'status-low' ? 'Low' : 
                          statusClass === 'status-medium' ? 'Medium' : 
                          statusClass === 'status-high' ? 'High' : 'Very High';
        
        card.innerHTML = `
            <div class="security-card-icon" style="background: ${info.color}20;">
                <i data-lucide="${info.icon}" style="color: ${info.color};"></i>
            </div>
            <h4>${name}</h4>
            <p style="margin-bottom: 0.75rem; font-size: 0.875rem;">Native token: ${info.nativeToken}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 0.875rem; color: var(--color-neutral-300);">Current Gas</div>
                    <div style="font-size: 1.25rem; font-weight: 700;">${gasInfo.standard.toFixed(2)} Gwei</div>
                </div>
                <div class="status-badge ${statusClass}" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">
                    ${statusText}
                </div>
            </div>
        `;
        
        blockchainsGrid.appendChild(card);
    });
    
    lucide.createIcons();
}

// Update the "last updated" counter
function updateLastUpdated() {
    const now = Date.now();
    const secondsAgo = Math.floor((now - lastUpdateTime) / 1000);
    
    updateTimeElement.textContent = secondsAgo.toString().padStart(2, '0');
    
    // Update block height (simulated)
    const blockHeight = 18456789 + updateCounter * 3;
    document.getElementById('blockHeight').textContent = (blockHeight / 1000000).toFixed(2) + 'M';
}

// Refresh all gas data
function refreshGasData() {
    updateCounter++;
    lastUpdateTime = Date.now();
    
    // Simulate gas price fluctuations
    fluctuateGasPrices();
    
    // Update all UI components
    updateGasTable();
    updateStats();
    updateQuickGasView();
    updateBlockchainsGrid();
    updateLastUpdated();
    
    // Show refresh notification
    showNotification('Gas data updated successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" style="width: 20px; height: 20px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Toggle auto-refresh
function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    
    if (autoRefresh) {
        autoRefreshToggle.innerHTML = `
            <span>Auto-Refresh: ON</span>
            <i data-lucide="rotate-cw" style="width: 20px; height: 20px; margin-left: 0.5rem;"></i>
        `;
        autoRefreshToggle.classList.add('btn-primary');
        autoRefreshToggle.classList.remove('btn-secondary');
        
        // Start auto-refresh interval
        refreshInterval = setInterval(refreshGasData, 30000); // 30 seconds
        
        showNotification('Auto-refresh enabled (30s interval)', 'success');
    } else {
        autoRefreshToggle.innerHTML = `
            <span>Auto-Refresh: OFF</span>
            <i data-lucide="pause" style="width: 20px; height: 20px; margin-left: 0.5rem;"></i>
        `;
        autoRefreshToggle.classList.remove('btn-primary');
        autoRefreshToggle.classList.add('btn-secondary');
        
        // Clear auto-refresh interval
        clearInterval(refreshInterval);
        
        showNotification('Auto-refresh disabled', 'info');
    }
    
    lucide.createIcons();
}

// Find best chain for transactions
function recommendBestChain() {
    let bestChain = '';
    let lowestGas = Infinity;
    
    for (const blockchain in gasData) {
        if (gasData[blockchain].standard < lowestGas) {
            lowestGas = gasData[blockchain].standard;
            bestChain = blockchain;
        }
    }
    
    showNotification(`Best chain right now: ${bestChain} (${lowestGas.toFixed(2)} Gwei)`, 'success');
}

// Bookmark page
function bookmarkPage() {
    if (window.sidebar && window.sidebar.addPanel) {
        // Firefox
        window.sidebar.addPanel(document.title, window.location.href, "");
    } else if (window.external && ('AddFavorite' in window.external)) {
        // IE
        window.external.AddFavorite(window.location.href, document.title);
    } else if (window.opera && window.print) {
        // Opera
        const elem = document.createElement('a');
        elem.setAttribute('href', window.location.href);
        elem.setAttribute('title', document.title);
        elem.setAttribute('rel', 'sidebar');
        elem.click();
    } else {
        // Other browsers
        alert(`Press ${navigator.userAgent.toLowerCase().indexOf('mac') !== -1 ? 'Cmd+D' : 'Ctrl+D'} to bookmark this page.`);
    }
}

// Subscribe to alerts
function subscribeToAlerts() {
    const email = prompt('Enter your email to receive gas fee alerts:');
    if (email && email.includes('@')) {
        showNotification('Subscription confirmed! You\'ll receive gas fee alerts.', 'success');
    } else if (email) {
        showNotification('Please enter a valid email address.', 'error');
    }
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(gasData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `gas-fees-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Gas fee data exported successfully!', 'success');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initial data load
    refreshGasData();
    
    // Start auto-refresh interval
    refreshInterval = setInterval(refreshGasData, 30000); // 30 seconds
    
    // Update last updated counter every second
    setInterval(updateLastUpdated, 1000);
    
    // Add CSS for notification animations
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
    `;
    document.head.appendChild(style);
    
    // Event listeners
    autoRefreshToggle.addEventListener('click', toggleAutoRefresh);
    refreshButton.addEventListener('click', refreshGasData);
    refreshButtonMobile.addEventListener('click', refreshGasData);
    recommendButton.addEventListener('click', recommendBestChain);
    bookmarkButton.addEventListener('click', bookmarkPage);
    subscribeButton.addEventListener('click', subscribeToAlerts);
    subscribeButtonMobile.addEventListener('click', subscribeToAlerts);
    
    // Footer links
    document.getElementById('exportData').addEventListener('click', (e) => {
        e.preventDefault();
        exportData();
    });
    
    document.getElementById('setAlert').addEventListener('click', (e) => {
        e.preventDefault();
        subscribeToAlerts();
    });
    
    document.getElementById('apiLink').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('API access coming soon!', 'info');
    });
    
    document.getElementById('widgetLink').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Embeddable widget coming soon!', 'info');
    });
    
    document.getElementById('githubLink').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('Open source version coming soon!', 'info');
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.feature-card, .step-card, .security-card, .warning-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});
