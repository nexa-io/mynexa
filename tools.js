// Initialize Lucide icons
lucide.createIcons();

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
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Search functionality
const toolSearch = document.getElementById('toolSearch');
const toolsGrid = document.getElementById('toolsGrid');
const toolCards = toolsGrid.querySelectorAll('.tool-card');

toolSearch.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    toolCards.forEach(card => {
        const searchData = card.getAttribute('data-search').toLowerCase();
        const toolName = card.querySelector('h3').textContent.toLowerCase();
        
        if (searchTerm === '' || 
            searchData.includes(searchTerm) || 
            toolName.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// Category filtering
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        
        if (!category) return; // For "coming soon" cards
        
        toolCards.forEach(toolCard => {
            const toolCategory = toolCard.getAttribute('data-category');
            
            if (category === 'all' || toolCategory === category) {
                toolCard.style.display = 'flex';
            } else {
                toolCard.style.display = 'none';
            }
        });
        
        // Update search input
        toolSearch.value = '';
        
        // Scroll to tools
        const toolsSection = document.getElementById('all-tools');
        const headerHeight = document.getElementById('header').offsetHeight;
        window.scrollTo({
            top: toolsSection.offsetTop - headerHeight - 20,
            behavior: 'smooth'
        });
    });
});

// Tool count update
function updateToolCount() {
    const visibleTools = Array.from(toolCards).filter(card => 
        card.style.display !== 'none'
    ).length;
    
    document.getElementById('toolCount').textContent = visibleTools;
}

// Add click listeners to tool cards to update filter on category tag click
toolCards.forEach(card => {
    const categoryTags = card.querySelectorAll('.tool-tag');
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.stopPropagation();
            const category = this.textContent.toLowerCase();
            
            // Filter by this category
            toolCards.forEach(toolCard => {
                const toolCategory = toolCard.getAttribute('data-category');
                if (toolCategory === category) {
                    toolCard.style.display = 'flex';
                } else {
                    toolCard.style.display = 'none';
                }
            });
            
            // Update search input
            toolSearch.value = '';
            updateToolCount();
        });
    });
});

// Initialize tool count
updateToolCount();

// Add hover effects
document.querySelectorAll('.tool-card, .category-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Clear search when clicking escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        toolSearch.value = '';
        toolCards.forEach(card => {
            card.style.display = 'flex';
        });
        updateToolCount();
    }
});

// Add "View All" functionality
const viewAllButton = document.createElement('button');
viewAllButton.textContent = 'View All Tools';
viewAllButton.className = 'btn btn-secondary';
viewAllButton.style.margin = '2rem auto 0';
viewAllButton.style.display = 'block';

viewAllButton.addEventListener('click', function() {
    toolCards.forEach(card => {
        card.style.display = 'flex';
    });
    toolSearch.value = '';
    updateToolCount();
});

// Insert view all button after tools grid
toolsGrid.parentNode.insertBefore(viewAllButton, toolsGrid.nextSibling);
