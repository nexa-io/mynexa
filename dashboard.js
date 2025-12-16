// dashboard.js - Wallet Explorer (Client-Side Only)

// Configuration - Using faster RPC endpoints
const NETWORKS = {
    ethereum: {
        name: 'Ethereum',
        symbol: 'ETH',
        rpc: 'https://ethereum.publicnode.com',
        chainId: 1,
        color: '#627eea',
        icon: '⧫'
    },
    arbitrum: {
        name: 'Arbitrum',
        symbol: 'ETH',
        rpc: 'https://arb1.arbitrum.io/rpc',
        chainId: 42161,
        color: '#28a0f0',
        icon: '🔷'
    },
    base: {
        name: 'Base',
        symbol: 'ETH',
        rpc: 'https://mainnet.base.org',
        chainId: 8453,
        color: '#0052ff',
        icon: '🔵'
    },
    bsc: {
        name: 'BSC',
        symbol: 'BNB',
        rpc: 'https://bsc-dataseed.binance.org',
        chainId: 56,
        color: '#f3ba2f',
        icon: '🟡'
    },
    polygon: {
        name: 'Polygon',
        symbol: 'MATIC',
        rpc: 'https://polygon-rpc.com',
        chainId: 137,
        color: '#8247e5',
        icon: '🟣'
    },
    optimism: {
        name: 'Optimism',
        symbol: 'ETH',
        rpc: 'https://mainnet.optimism.io',
        chainId: 10,
        color: '#ff0420',
        icon: '🔴'
    }
};

// Default tokens
const DEFAULT_TOKENS = {
    usdt: {
        name: 'Tether USD',
        symbol: 'USDT',
        icon: '$',
        decimals: 6,
        contracts: {
            ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            base: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
            bsc: '0x55d398326f99059fF775485246999027B3197955',
            polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
        }
    },
    usdc: {
        name: 'USD Coin',
        symbol: 'USDC',
        icon: 'ⓤ',
        decimals: 6,
        contracts: {
            ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            arbitrum: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
            base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            optimism: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'
        }
    }
};

// Mock prices for USD conversion
const MOCK_PRICES = {
    ETH: 3500,
    BNB: 600,
    MATIC: 0.8,
    USDT: 1,
    USDC: 1,
    ARB: 1.2,
    OP: 2.5
};

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const connectBtn = document.getElementById('connectBtn');
const connectFromEmpty = document.getElementById('connectFromEmpty');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const connectWalletBtn = document.getElementById('connectWalletBtn');
const useExampleBtn = document.getElementById('useExampleBtn');
const pasteBtn = document.getElementById('pasteBtn');
const walletAddressInput = document.getElementById('walletAddress');
const walletInfoBar = document.getElementById('walletInfoBar');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const loadingProgress = document.getElementById('loadingProgress');
const dashboardSections = document.getElementById('dashboardSections');
const connectedAddress = document.getElementById('connectedAddress');
const copyAddressBtn = document.getElementById('copyAddressBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const changeWalletBtn = document.getElementById('changeWalletBtn');
const connectedWalletText = document.getElementById('connectedWalletText');
const refreshAllBtn = document.getElementById('refreshAllBtn');
const blockchainGrid = document.getElementById('blockchainGrid');
const tokensGrid = document.getElementById('tokensGrid');
const noBlockchains = document.getElementById('noBlockchains');
const noTokens = document.getElementById('noTokens');
const activeNetworks = document.getElementById('activeNetworks');
const totalTokens = document.getElementById('totalTokens');
const lastUpdated = document.getElementById('lastUpdated');
const totalBalance = document.getElementById('totalBalance');
const nativeTotal = document.getElementById('nativeTotal');
const tokenTotal = document.getElementById('tokenTotal');
const balanceVisibility = document.getElementById('balanceVisibility');
const addTokenBtnHeader = document.getElementById('addTokenBtnHeader');
const addTokenModal = document.getElementById('addTokenModal');
const closeTokenModal = document.getElementById('closeTokenModal');
const addTokenBtn = document.getElementById('addTokenBtn');
const cancelTokenBtn = document.getElementById('cancelTokenBtn');
const tokenAddressInput = document.getElementById('tokenAddress');
const tokenSymbolInput = document.getElementById('tokenSymbol');
const tokenDecimalsInput = document.getElementById('tokenDecimals');
const tokenNetworkSelect = document.getElementById('tokenNetwork');

// State
let currentWalletAddress = null;
let isBalanceHidden = false;
let customTokens = [];
let networkStatus = {};

// Example wallet addresses for demo
const EXAMPLE_WALLETS = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    '0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6', // Random wallet
    '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD'  // Another wallet
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard initialized');
    loadCustomTokens();
    checkStoredWallet();
    setupEventListeners();
});

// Load custom tokens from localStorage
function loadCustomTokens() {
    const stored = localStorage.getItem('nexapay_custom_tokens');
    if (stored) {
        try {
            customTokens = JSON.parse(stored);
            console.log(`Loaded ${customTokens.length} custom tokens`);
        } catch (e) {
            console.error('Error loading custom tokens:', e);
            customTokens = [];
        }
    }
}

// Save custom tokens to localStorage
function saveCustomTokens() {
    localStorage.setItem('nexapay_custom_tokens', JSON.stringify(customTokens));
}

// Check if wallet is stored in localStorage
function checkStoredWallet() {
    const storedWallet = localStorage.getItem('nexapay_wallet_address');
    if (storedWallet && isValidAddress(storedWallet)) {
        console.log(`Found stored wallet: ${storedWallet}`);
        connectToWallet(storedWallet);
    } else {
        console.log('No wallet stored in localStorage');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Connect buttons
    connectBtn.addEventListener('click', showModal);
    connectFromEmpty.addEventListener('click', showModal);

    // Modal
    modalClose.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal();
    });

    // Connect wallet
    connectWalletBtn.addEventListener('click', () => {
        const address = walletAddressInput.value.trim();
        if (isValidAddress(address)) {
            console.log(`Connecting to wallet: ${address}`);
            connectToWallet(address);
            hideModal();
        } else {
            showNotification('Invalid Ethereum address. Please enter a valid 0x... address.', 'error');
            walletAddressInput.classList.add('error');
        }
    });

    // Use example wallet
    useExampleBtn.addEventListener('click', () => {
        const randomWallet = EXAMPLE_WALLETS[Math.floor(Math.random() * EXAMPLE_WALLETS.length)];
        walletAddressInput.value = randomWallet;
        console.log(`Loaded example wallet: ${randomWallet}`);
    });

    // Paste from clipboard
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            walletAddressInput.value = text.trim();
            console.log('Pasted address from clipboard');
        } catch (err) {
            showNotification('Unable to paste from clipboard', 'error');
        }
    });

    // Copy address
    copyAddressBtn.addEventListener('click', async () => {
        const address = connectedAddress.textContent;
        try {
            await navigator.clipboard.writeText(address);
            showNotification('Address copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy address', 'error');
        }
    });

    // Disconnect wallet
    disconnectBtn.addEventListener('click', () => {
        localStorage.removeItem('nexapay_wallet_address');
        localStorage.removeItem('nexapay_wallet_data');
        resetDashboard();
        console.log('Wallet disconnected');
    });

    // Change wallet
    changeWalletBtn.addEventListener('click', () => {
        localStorage.removeItem('nexapay_wallet_address');
        resetDashboard();
        showModal();
        console.log('Change wallet requested');
    });

    // Refresh all data
    refreshAllBtn.addEventListener('click', () => {
        if (currentWalletAddress) {
            fetchAllWalletData(currentWalletAddress);
            console.log('Manual refresh requested');
        }
    });

    // Balance visibility toggle
    balanceVisibility.addEventListener('click', toggleBalanceVisibility);

    // Add token button
    addTokenBtnHeader.addEventListener('click', showAddTokenModal);
    closeTokenModal.addEventListener('click', hideAddTokenModal);
    cancelTokenBtn.addEventListener('click', hideAddTokenModal);
    addTokenModal.addEventListener('click', (e) => {
        if (e.target === addTokenModal) hideAddTokenModal();
    });

    // Add token
    addTokenBtn.addEventListener('click', async () => {
        await addCustomToken();
    });

    // Address input validation
    walletAddressInput.addEventListener('input', () => {
        walletAddressInput.classList.remove('error');
    });
}

// Show modal
function showModal() {
    modalOverlay.classList.add('active');
    walletAddressInput.focus();
}

// Hide modal
function hideModal() {
    modalOverlay.classList.remove('active');
}

// Show add token modal
function showAddTokenModal() {
    addTokenModal.classList.add('active');
    tokenAddressInput.focus();
}

// Hide add token modal
function hideAddTokenModal() {
    addTokenModal.classList.remove('active');
    tokenAddressInput.value = '';
    tokenSymbolInput.value = '';
    tokenDecimalsInput.value = '18';
}

// Add custom token
async function addCustomToken() {
    const address = tokenAddressInput.value.trim();
    const symbol = tokenSymbolInput.value.trim().toUpperCase();
    const decimals = parseInt(tokenDecimalsInput.value) || 18;
    const network = tokenNetworkSelect.value;
    
    if (!isValidAddress(address)) {
        showNotification('Invalid token contract address', 'error');
        return;
    }
    
    if (!symbol) {
        showNotification('Please enter a token symbol', 'error');
        return;
    }
    
    try {
        loadingProgress.textContent = 'Validating token contract...';
        
        // Quick validation by fetching token info
        const tokenInfo = await fetchTokenInfo(address, network);
        if (!tokenInfo) {
            showNotification('Invalid token contract or network', 'error');
            return;
        }
        
        const token = {
            address,
            symbol,
            name: tokenInfo.name || symbol,
            decimals: tokenInfo.decimals || decimals,
            network,
            icon: '★',
            isCustom: true
        };
        
        // Check if token already exists
        const exists = customTokens.some(t => 
            t.address.toLowerCase() === address.toLowerCase() && 
            t.network === network
        );
        
        if (exists) {
            showNotification('Token already added', 'warning');
            return;
        }
        
        customTokens.push(token);
        saveCustomTokens();
        
        showNotification(`${symbol} added successfully!`, 'success');
        hideAddTokenModal();
        
        // Refresh token display if wallet is connected
        if (currentWalletAddress) {
            fetchTokenBalances(currentWalletAddress);
        }
        
    } catch (error) {
        console.error('Error adding token:', error);
        showNotification('Failed to add token: ' + error.message, 'error');
    }
}

// Fetch token info
async function fetchTokenInfo(address, network) {
    try {
        const config = NETWORKS[network];
        if (!config) return null;
        
        // Simple balance check to validate contract
        const response = await fetch(config.rpc, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getCode',
                params: [address, 'latest'],
                id: 1
            })
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        
        if (data.error || !data.result || data.result === '0x') {
            return null;
        }
        
        return {
            name: 'Custom Token',
            decimals: 18
        };
        
    } catch (error) {
        console.error('Token validation error:', error);
        return null;
    }
}

// Remove custom token
function removeCustomToken(address, network) {
    customTokens = customTokens.filter(t => 
        !(t.address.toLowerCase() === address.toLowerCase() && t.network === network)
    );
    saveCustomTokens();
    showNotification('Token removed', 'success');
    
    // Refresh display
    if (currentWalletAddress) {
        fetchTokenBalances(currentWalletAddress);
    }
}

// Validate Ethereum address
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Connect to wallet
function connectToWallet(address) {
    // Store in localStorage
    localStorage.setItem('nexapay_wallet_address', address);
    currentWalletAddress = address;
    
    // Update UI
    updateWalletDisplay(address);
    
    // Show loading state
    emptyState.style.display = 'none';
    loadingState.classList.add('active');
    dashboardSections.classList.remove('active');
    
    // Fetch wallet data
    fetchAllWalletData(address);
}

// Update wallet display
function updateWalletDisplay(address) {
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    // Update header display
    connectedWalletText.textContent = truncated;
    
    // Update wallet info bar
    connectedAddress.textContent = address;
    walletInfoBar.classList.add('active');
}

// Reset dashboard
function resetDashboard() {
    currentWalletAddress = null;
    walletInfoBar.classList.remove('active');
    emptyState.style.display = 'flex';
    loadingState.classList.remove('active');
    dashboardSections.classList.remove('active');
    connectedWalletText.textContent = 'No wallet connected';
    
    // Clear all data displays
    blockchainGrid.innerHTML = '';
    tokensGrid.innerHTML = '';
    noBlockchains.classList.add('active');
    noTokens.classList.add('active');
    activeNetworks.textContent = '0';
    totalTokens.textContent = '0';
    lastUpdated.textContent = 'Never';
    totalBalance.textContent = '$0.00';
    nativeTotal.textContent = '$0.00';
    tokenTotal.textContent = '$0.00';
    
    isBalanceHidden = false;
    balanceVisibility.innerHTML = '<i class="fas fa-eye"></i>';
}

// Fetch all wallet data
async function fetchAllWalletData(address) {
    console.log(`Starting data fetch for wallet: ${address}`);
    
    try {
        loadingProgress.textContent = 'Fetching native balances...';
        
        // Fetch native balances from all networks (parallel)
        const nativeBalances = await fetchNativeBalances(address);
        
        loadingProgress.textContent = 'Fetching token balances...';
        
        // Fetch token balances
        const tokenBalances = await fetchTokenBalances(address);
        
        // Combine and display data
        displayBlockchainData(nativeBalances);
        displayTokenData(tokenBalances);
        
        // Update totals
        updateTotals(nativeBalances, tokenBalances);
        
        // Update summary
        updateSummary(nativeBalances, tokenBalances);
        
        // Store data in localStorage
        const walletData = {
            nativeBalances,
            tokenBalances,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('nexapay_wallet_data', JSON.stringify(walletData));
        
        // Hide loading, show dashboard
        loadingState.classList.remove('active');
        dashboardSections.classList.add('active');
        
        showNotification('Wallet data loaded successfully!', 'success');
        console.log('All wallet data fetched and displayed');
        
    } catch (error) {
        console.error('Failed to fetch wallet data:', error);
        showNotification(`Failed to load wallet data: ${error.message}`, 'error');
        loadingState.classList.remove('active');
    }
}

// Fetch native balances from all networks
async function fetchNativeBalances(address) {
    const balances = {};
    const promises = [];
    
    for (const [network, config] of Object.entries(NETWORKS)) {
        promises.push(
            fetchNativeBalance(address, network, config)
                .then(balance => {
                    balances[network] = balance;
                })
                .catch(error => {
                    console.error(`Failed to fetch ${network} balance:`, error);
                    balances[network] = {
                        network: config.name,
                        symbol: config.symbol,
                        balance: '0',
                        usdValue: '0',
                        status: 'error'
                    };
                })
        );
    }
    
    await Promise.all(promises);
    return balances;
}

// Fetch native balance for a specific network
async function fetchNativeBalance(address, network, config) {
    try {
        const response = await fetch(config.rpc, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [address, 'latest'],
                id: 1
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        // Convert from wei to ether
        const balanceWei = BigInt(data.result);
        const balance = Number(balanceWei) / 1e18;
        
        // Calculate USD value
        const price = MOCK_PRICES[config.symbol] || 0;
        const usdValue = balance * price;
        
        console.log(`${network}: ${balance.toFixed(6)} ${config.symbol}`);
        
        return {
            network: config.name,
            symbol: config.symbol,
            balance: balance.toFixed(6),
            usdValue: usdValue.toFixed(2),
            icon: config.icon,
            color: config.color,
            status: 'success'
        };
        
    } catch (error) {
        console.error(`${network} balance fetch failed:`, error);
        return {
            network: config.name,
            symbol: config.symbol,
            balance: '0',
            usdValue: '0',
            icon: config.icon,
            color: config.color,
            status: 'error'
        };
    }
}

// Fetch token balances
async function fetchTokenBalances(address) {
    const balances = [];
    
    // Fetch default tokens
    for (const [tokenId, token] of Object.entries(DEFAULT_TOKENS)) {
        for (const [network, contract] of Object.entries(token.contracts)) {
            try {
                const balance = await fetchERC20Balance(
                    address,
                    contract,
                    network,
                    token.symbol,
                    token.decimals,
                    token.name,
                    token.icon
                );
                
                if (balance && parseFloat(balance.balance) > 0) {
                    balances.push(balance);
                }
            } catch (error) {
                console.error(`${token.symbol} on ${network} fetch failed:`, error);
            }
        }
    }
    
    // Fetch custom tokens
    for (const token of customTokens) {
        try {
            const balance = await fetchERC20Balance(
                address,
                token.address,
                token.network,
                token.symbol,
                token.decimals,
                token.name,
                token.icon
            );
            
            if (balance && parseFloat(balance.balance) > 0) {
                balances.push({
                    ...balance,
                    isCustom: true
                });
            }
        } catch (error) {
            console.error(`Custom ${token.symbol} on ${token.network} fetch failed:`, error);
        }
    }
    
    return balances;
}

// Fetch ERC20 token balance
async function fetchERC20Balance(address, contractAddress, network, symbol, decimals, name, icon) {
    const config = NETWORKS[network];
    if (!config) return null;
    
    try {
        const response = await fetch(config.rpc, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                    to: contractAddress,
                    data: `0x70a08231000000000000000000000000${address.slice(2)}`
                }, 'latest'],
                id: 1
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        const balanceWei = BigInt(data.result);
        const balance = Number(balanceWei) / Math.pow(10, decimals);
        
        if (balance > 0) {
            const price = MOCK_PRICES[symbol] || 0;
            const usdValue = balance * price;
            
            console.log(`${symbol} on ${network}: ${balance.toFixed(6)}`);
            
            return {
                name: name || symbol,
                symbol,
                network: config.name,
                networkId: network,
                balance: balance.toFixed(6),
                usdValue: usdValue.toFixed(2),
                icon: icon || '💰',
                contract: contractAddress,
                status: 'success'
            };
        }
        
        return null;
        
    } catch (error) {
        console.error(`${symbol} on ${network} fetch failed:`, error);
        return null;
    }
}

// Display blockchain data
function displayBlockchainData(balances) {
    blockchainGrid.innerHTML = '';
    
    let activeCount = 0;
    
    Object.entries(balances).forEach(([network, data]) => {
        if (parseFloat(data.balance) > 0) {
            activeCount++;
        }
        
        const card = createBlockchainCard(data);
        blockchainGrid.appendChild(card);
    });
    
    if (activeCount === 0) {
        noBlockchains.classList.add('active');
    } else {
        noBlockchains.classList.remove('active');
    }
    
    console.log(`Displayed ${activeCount} blockchain balances`);
}

// Create blockchain card
function createBlockchainCard(data) {
    const card = document.createElement('div');
    card.className = 'blockchain-card';
    
    const hasBalance = parseFloat(data.balance) > 0;
    const balanceClass = isBalanceHidden && hasBalance ? 'balance-hidden' : '';
    
    card.innerHTML = `
        <div class="blockchain-header">
            <div class="blockchain-info">
                <div class="blockchain-icon ${data.network.toLowerCase()}" style="background: ${data.color}">
                    ${data.icon}
                </div>
                <div>
                    <div class="blockchain-name">${data.network}</div>
                    <div class="blockchain-symbol">${data.symbol}</div>
                </div>
            </div>
            <div class="blockchain-status ${data.status === 'success' ? 'status-connected' : 'status-disconnected'}">
                ${data.status === 'success' ? 'Connected' : 'Error'}
            </div>
        </div>
        <div class="blockchain-balance">
            <div class="balance-crypto ${balanceClass}">${hasBalance ? data.balance : '0'} ${data.symbol}</div>
            <div class="balance-usd ${balanceClass}">$${hasBalance ? data.usdValue : '0.00'}</div>
        </div>
        ${hasBalance ? '<div class="balance-indicator">Active Balance</div>' : ''}
    `;
    
    return card;
}

// Display token data
function displayTokenData(tokens) {
    tokensGrid.innerHTML = '';
    
    if (tokens.length === 0) {
        noTokens.classList.add('active');
        console.log('No token holdings found');
        return;
    }
    
    noTokens.classList.remove('active');
    
    tokens.forEach(token => {
        const card = createTokenCard(token);
        tokensGrid.appendChild(card);
    });
    
    console.log(`Displayed ${tokens.length} token holdings`);
}

// Create token card
function createTokenCard(token) {
    const card = document.createElement('div');
    card.className = 'token-card';
    
    const balanceClass = isBalanceHidden ? 'balance-hidden' : '';
    const isCustom = token.isCustom;
    
    card.innerHTML = `
        ${isCustom ? `
            <button class="remove-token" onclick="removeCustomToken('${token.contract}', '${token.networkId}')">
                <i class="fas fa-times"></i>
            </button>
        ` : ''}
        <div class="token-icon" style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary))">
            ${token.icon}
        </div>
        <div class="token-info">
            <div class="token-name">${token.name}</div>
            <div class="token-symbol">${token.symbol}</div>
            <div class="token-balance ${balanceClass}">${token.balance}</div>
            <div class="token-usd ${balanceClass}">$${token.usdValue}</div>
            <div class="token-network">${token.network}</div>
        </div>
    `;
    
    return card;
}

// Update totals
function updateTotals(nativeBalances, tokenBalances) {
    let nativeTotalUsd = 0;
    let tokenTotalUsd = 0;
    
    // Calculate native token total
    Object.values(nativeBalances).forEach(balance => {
        nativeTotalUsd += parseFloat(balance.usdValue) || 0;
    });
    
    // Calculate token total
    tokenBalances.forEach(token => {
        tokenTotalUsd += parseFloat(token.usdValue) || 0;
    });
    
    const totalUsd = nativeTotalUsd + tokenTotalUsd;
    
    // Update display
    totalBalance.textContent = `$${totalUsd.toFixed(2)}`;
    nativeTotal.textContent = `$${nativeTotalUsd.toFixed(2)}`;
    tokenTotal.textContent = `$${tokenTotalUsd.toFixed(2)}`;
    
    // Apply balance hiding
    if (isBalanceHidden) {
        totalBalance.classList.add('balance-hidden');
        nativeTotal.classList.add('balance-hidden');
        tokenTotal.classList.add('balance-hidden');
        
        totalBalance.textContent = '••••••';
        nativeTotal.textContent = '••••••';
        tokenTotal.textContent = '••••••';
    } else {
        totalBalance.classList.remove('balance-hidden');
        nativeTotal.classList.remove('balance-hidden');
        tokenTotal.classList.remove('balance-hidden');
    }
}

// Update summary
function updateSummary(nativeBalances, tokenBalances) {
    // Count active networks
    const activeNetworkCount = Object.values(nativeBalances).filter(
        data => parseFloat(data.balance) > 0
    ).length;
    
    // Count unique tokens
    const uniqueTokens = new Set(tokenBalances.map(token => token.symbol)).size;
    
    activeNetworks.textContent = activeNetworkCount;
    totalTokens.textContent = uniqueTokens;
    lastUpdated.textContent = new Date().toLocaleTimeString();
    
    console.log(`Summary: ${activeNetworkCount} active networks, ${uniqueTokens} unique tokens`);
}

// Toggle balance visibility
function toggleBalanceVisibility() {
    isBalanceHidden = !isBalanceHidden;
    
    // Update eye icon
    balanceVisibility.innerHTML = isBalanceHidden ? 
        '<i class="fas fa-eye-slash"></i>' : 
        '<i class="fas fa-eye"></i>';
    
    // Update all balance displays
    updateTotals({}, []); // Will be updated with actual data in display functions
    
    // Also update blockchain and token cards
    const cryptoBalances = document.querySelectorAll('.balance-crypto, .balance-usd, .token-balance, .token-usd');
    cryptoBalances.forEach(el => {
        if (isBalanceHidden) {
            el.classList.add('balance-hidden');
            if (el.classList.contains('balance-crypto') || el.classList.contains('token-balance')) {
                const original = el.getAttribute('data-original') || el.textContent;
                el.setAttribute('data-original', original);
                el.textContent = '••••••';
            } else if (el.classList.contains('balance-usd') || el.classList.contains('token-usd')) {
                el.textContent = '$••••••';
            }
        } else {
            el.classList.remove('balance-hidden');
            const original = el.getAttribute('data-original');
            if (original) {
                el.textContent = original;
                el.removeAttribute('data-original');
            }
        }
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Make functions available globally for onclick handlers
window.removeCustomToken = removeCustomToken;