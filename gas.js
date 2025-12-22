// Initialize icons
lucide.createIcons();

// Simple blockchain data
const networks = {
    'ethereum': {
        name: 'Ethereum',
        color: '#627eea',
        emoji: 'Ξ',
        explorer: 'https://etherscan.io',
        token: 'ETH'
    },
    'base': {
        name: 'Base',
        color: '#0052ff',
        emoji: '🟦',
        explorer: 'https://basescan.org',
        token: 'ETH'
    },
    'polygon': {
        name: 'Polygon',
        color: '#8247e5',
        emoji: '⬢',
        explorer: 'https://polygonscan.com',
        token: 'MATIC'
    },
    'arbitrum': {
        name: 'Arbitrum',
        color: '#28a0f0',
        emoji: '↻',
        explorer: 'https://arbiscan.io',
        token: 'ETH'
    },
    'optimism': {
        name: 'Optimism',
        color: '#ff0420',
        emoji: '⚡',
        explorer: 'https://optimistic.etherscan.io',
        token: 'ETH'
    },
    'bsc': {
        name: 'BSC',
        color: '#f3ba2f',
        emoji: 'B',
        explorer: 'https://bscscan.com',
        token: 'BNB'
    }
};

// Current gas prices (starting values)
let gasPrices = {};
let lastUpdate = Date.now();
let updateCount = 0;
let currentFilter = 'all';

// DOM Elements
const updateSeconds = document.getElementById('updateSeconds');
const bestDealCard = document.getElementById('bestDealCard');
const bestNetwork = document.getElementById('bestNetwork');
const bestGwei = document.getElementById('bestGwei');
const bestUSD = document.getElementById('bestUSD');
const priceCardsGrid = document.getElementById('priceCardsGrid');
const comparisonBars = document.getElementById('comparisonBars');
const navItems = document.querySelectorAll('.nav-item');
const refreshBtn = document.getElementById('refreshBtn');
const useBestBtn = document.getElementById('useBestBtn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Initialize with realistic prices
function initializePrices() {
    const basePrices = {
        'ethereum': 25,
        'base': 0.2,
        'polygon': 50,
        'arbitrum': 0.1,
        'optimism': 0.2,
        'bsc': 5
    };
    
    Object.keys(basePrices).forEach(chain => {
        // Add some random variation
        const variation = (Math.random() - 0.5) * 0.2; // ±10%
        gasPrices[chain] = {
            current: basePrices[chain] * (1 + variation),
            slow: basePrices[chain] * (1 + variation) * 0.6,
            fast: basePrices[chain] * (1 + variation) * 1.6,
            instant: basePrices[chain] * (1 + variation) * 2.4,
            updated: Date.now()
        };
    });
}

// Calculate USD cost for a standard transfer
function calculateUSDCost(gwei, chain) {
    const gasLimit = 65000; // Standard transfer
    let tokenPrice = 1;
    
    // Simple token prices
    if (['ethereum', 'base', 'arbitrum', 'optimism'].includes(chain)) {
        tokenPrice = 3500; // ETH price
    } else if (chain === 'polygon') {
        tokenPrice = 0.8; // MATIC price
    } else if (chain === 'bsc') {
        tokenPrice = 600; // BNB price
    }
    
    const costInToken = (gwei * gasLimit) / 1000000000;
    return (costInToken * tokenPrice).toFixed(2);
}

// Get price status (cheap, average, expensive)
function getPriceStatus(gwei, chain) {
    if (chain === 'ethereum') {
        if (gwei < 20) return 'cheap';
        if (gwei < 40) return 'average';
        return 'expensive';
    } else if (['base', 'arbitrum', 'optimism'].includes(chain)) {
        if (gwei < 0.2) return 'cheap';
        if (gwei < 0.4) return 'average';
        return 'expensive';
    } else if (chain === 'polygon') {
        if (gwei < 50) return 'cheap';
        if (gwei < 100) return 'average';
        return 'expensive';
    } else if (chain === 'bsc') {
        if (gwei < 5) return 'cheap';
        if (gwei < 10) return 'average';
        return 'expensive';
    }
    return 'average';
}

// Update prices with some variation
function updateAllPrices() {
    updateCount++;
    lastUpdate = Date.now();
    
    Object.keys(gasPrices).forEach(chain => {
        const current = gasPrices[chain].current;
        const variation = (Math.random() - 0.5) * 0.1; // ±5%
        
        const newPrice = Math.max(0.01, current * (1 + variation));
        
        gasPrices[chain] = {
            current: newPrice,
            slow: newPrice * 0.6,
            fast: newPrice * 1.6,
            instant: newPrice * 2.4,
            updated: Date.now()
        };
    });
    
    updateUI();
    showNotification('Prices updated!');
}

// Update the best deal card
function updateBestDeal() {
    let cheapestChain = '';
    let cheapestPrice = Infinity;
    
    Object.keys(gasPrices).forEach(chain => {
        if (currentFilter !== 'all' && chain !== currentFilter) return;
        
        const price = gasPrices[chain].current;
        if (price < cheapestPrice) {
            cheapestPrice = price;
            cheapestChain = chain;
        }
    });
    
    if (cheapestChain) {
        const network = networks[cheapestChain];
        bestNetwork.textContent = network.name;
        bestGwei.textContent = `${cheapestPrice.toFixed(2)} Gwei`;
        bestUSD.textContent = `$${calculateUSDCost(cheapestPrice, cheapestChain)}`;
        
        // Update card color based on price status
        const status = getPriceStatus(cheapestPrice, cheapestChain);
        bestDealCard.style.background = status === 'cheap' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                      status === 'average' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                      'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))';
    }
}

// Update price cards
function updatePriceCards() {
    priceCardsGrid.innerHTML = '';
    
    Object.entries(networks).forEach(([id, network]) => {
        if (currentFilter !== 'all' && id !== currentFilter) return;
        if (!gasPrices[id]) return;
        
        const price = gasPrices[id];
        const status = getPriceStatus(price.current, id);
        const usdCost = calculateUSDCost(price.current, id);
        
        const card = document.createElement('div');
        card.className = 'price-card';
        card.innerHTML = `
            <div class="price-card-header">
                <div class="price-card-chain">
                    <div class="chain-logo" style="background: ${network.color}">
                        ${network.emoji}
                    </div>
                    <div class="chain-info">
                        <div class="chain-name">${network.name}</div>
                        <div class="chain-token">${network.token}</div>
                    </div>
                </div>
                <div class="price-status ${status}">
                    ${status.toUpperCase()}
                </div>
            </div>
            
            <div class="price-card-prices">
                <div class="price-tier">
                    <div class="tier-label">Slow</div>
                    <div class="tier-price">${price.slow.toFixed(2)}</div>
                    <div class="tier-usd">$${calculateUSDCost(price.slow, id)}</div>
                </div>
                <div class="price-tier">
                    <div class="tier-label">Standard</div>
                    <div class="tier-price">${price.current.toFixed(2)}</div>
                    <div class="tier-usd">$${usdCost}</div>
                </div>
                <div class="price-tier">
                    <div class="tier-label">Fast</div>
                    <div class="tier-price">${price.fast.toFixed(2)}</div>
                    <div class="tier-usd">$${calculateUSDCost(price.fast, id)}</div>
                </div>
                <div class="price-tier">
                    <div class="tier-label">Instant</div>
                    <div class="tier-price">${price.instant.toFixed(2)}</div>
                    <div class="tier-usd">$${calculateUSDCost(price.instant, id)}</div>
                </div>
            </div>
            
            <div class="price-card-action">
                <button class="simple-btn secondary" onclick="useNetwork('${id}')">
                    <i data-lucide="send"></i>
                    Use ${network.name}
                </button>
            </div>
        `;
        
        priceCardsGrid.appendChild(card);
    });
    
    lucide.createIcons();
}

// Update comparison bars
function updateComparisonBars() {
    comparisonBars.innerHTML = '';
    
    // Find max price for scaling
    let maxPrice = 0;
    Object.keys(gasPrices).forEach(chain => {
        if (currentFilter !== 'all' && chain !== currentFilter) return;
        maxPrice = Math.max(maxPrice, gasPrices[chain].current);
    });
    
    Object.entries(networks).forEach(([id, network]) => {
        if (currentFilter !== 'all' && id !== currentFilter) return;
        if (!gasPrices[id]) return;
        
        const price = gasPrices[id].current;
        const height = (price / maxPrice) * 100;
        const status = getPriceStatus(price, id);
        
        const bar = document.createElement('div');
        bar.className = 'comparison-bar';
        bar.style.height = `${Math.max(10, height)}%`;
        bar.style.background = status === 'cheap' ? '#10b981' :
                              status === 'average' ? '#f59e0b' : '#ef4444';
        
        bar.innerHTML = `
            <div class="comparison-bar-price">${price.toFixed(2)}</div>
            <div class="comparison-bar-label">${network.name}</div>
        `;
        
        comparisonBars.appendChild(bar);
    });
}

// Update last updated time
function updateLastUpdated() {
    const now = Date.now();
    const secondsAgo = Math.floor((now - lastUpdate) / 1000);
    updateSeconds.textContent = secondsAgo;
}

// Show notification
function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Use a network
function useNetwork(networkId) {
    const network = networks[networkId];
    const price = gasPrices[networkId].current;
    const usdCost = calculateUSDCost(price, networkId);
    
    showNotification(`Using ${network.name} (${price.toFixed(2)} Gwei, $${usdCost})`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Use best network
function useBestNetwork() {
    let bestChain = '';
    let bestPrice = Infinity;
    
    Object.keys(gasPrices).forEach(chain => {
        const price = gasPrices[chain].current;
        if (price < bestPrice) {
            bestPrice = price;
            bestChain = chain;
        }
    });
    
    if (bestChain) {
        useNetwork(bestChain);
    }
}

// Filter networks
function filterNetworks(filter) {
    currentFilter = filter;
    
    // Update active nav item
    navItems.forEach(item => {
        if (item.dataset.chain === filter) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update UI
    updateUI();
}

// Update all UI
function updateUI() {
    updateBestDeal();
    updatePriceCards();
    updateComparisonBars();
    updateLastUpdated();
}

// Initialize the app
function init() {
    // Load data
    initializePrices();
    updateUI();
    
    // Auto-update every 30 seconds
    setInterval(updateAllPrices, 30000);
    
    // Update last updated time every second
    setInterval(updateLastUpdated, 1000);
    
    // Event listeners
    refreshBtn.addEventListener('click', () => {
        updateAllPrices();
        showNotification('Refreshing prices...');
    });
    
    useBestBtn.addEventListener('click', useBestNetwork);
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            filterNetworks(item.dataset.chain);
        });
    });
    
    // Bookmark button
    document.getElementById('bookmarkBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (window.sidebar && window.sidebar.addPanel) {
            window.sidebar.addPanel(document.title, window.location.href, "");
        } else {
            alert('Press Ctrl+D (or Cmd+D on Mac) to bookmark this page!');
        }
    });
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (navigator.share) {
            navigator.share({
                title: 'Gas Fee Checker',
                text: 'Check current crypto transaction fees',
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showNotification('Link copied to clipboard!');
        }
    });
    
    // Initial notification
    setTimeout(() => {
        showNotification('Welcome! Prices auto-update every 30 seconds.');
    }, 1000);
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', init);
