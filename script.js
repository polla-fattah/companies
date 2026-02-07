// Animation on page load
document.addEventListener('DOMContentLoaded', function () {
    // Check if we are on the company detail page
    if (window.location.pathname.includes('company.html')) {
        loadCompanyDetails();
        return; // specific logic for company page
    }

    // Logo fade-in animation after 3 seconds
    setTimeout(() => {
        const heroShape = document.querySelector('.hero-shape');
        const logoContainer = document.querySelector('.logo-container');
        const logoText = document.querySelector('.logo-text');

        // Animate shapes sliding out
        if (heroShape) {
            heroShape.classList.add('animate');
        }

        // Fade in logo after shapes start animating (slight delay for smooth transition)
        setTimeout(() => {
            if (logoContainer) {
                logoContainer.classList.add('fade-in');
            }
            if (logoText) {
                logoText.classList.add('fade-in');
            }
        }, 400);
    }, 3000);

    // Scroll fade-in animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in sections
    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    // Load companies (only on index page)
    const famousContainer = document.getElementById('famous-companies');
    if (famousContainer) {
        loadFamousCompanies();
        loadRecentCompanies();
    }
});

// Load company details
function loadCompanyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    if (!companyId) {
        window.location.href = 'index.html';
        return;
    }

    let company = null;

    // Check static data
    if (typeof COMPANIES_DATA !== 'undefined' && COMPANIES_DATA[companyId]) {
        company = COMPANIES_DATA[companyId];
    }
    // Fallback: Check LocalStorage
    else {
        try {
            const localData = localStorage.getItem('custom_companies');
            if (localData) {
                const companies = JSON.parse(localData);
                company = companies.find(c => c.id === companyId);
            }
        } catch (e) {
            console.error('Error reading local storage', e);
        }
    }

    if (company) {
        updateCompanyPage(company);
    } else {
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center flex-col gap-4">
                <h1 class="text-2xl font-bold text-gray-800">Company Not Found</h1>
                <p class="text-gray-500">The requested company could not be found.</p>
                <a href="index.html" class="text-blue-600 hover:underline">Go Home</a>
            </div>
        `;
    }
}

function updateCompanyPage(company) {
    // Update title
    document.title = `${company.name} - findycod.`;

    // Header section
    const headerContainer = document.getElementById('company-header');
    const iconColorClass = company.iconColor || 'bg-blue-500';
    // Extract base color name (e.g., 'pink' from 'bg-pink-500') for other variations
    // This assumes standard tailwind class format 'bg-{color}-{shade}'
    let themeColor = 'blue';
    if (iconColorClass.startsWith('bg-')) {
        const parts = iconColorClass.split('-');
        if (parts.length >= 2) themeColor = parts[1];
    }

    const logoHtml = company.logo
        ? `<div class="w-32 h-32 rounded-3xl bg-white shadow-md p-4 flex items-center justify-center border border-slate-100 flex-shrink-0">
             <img src="${company.logo}" alt="${company.name}" class="w-full h-full object-contain" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';" />
           </div>`
        : '';

    const iconHtml = company.logo
        ? `<div class="company-icon ${iconColorClass} w-32 h-32 rounded-3xl shadow-md text-4xl text-white flex items-center justify-center flex-shrink-0" style="display: none;">
             ${company.icon || company.name.charAt(0)}
           </div>`
        : `<div class="company-icon ${iconColorClass} w-32 h-32 rounded-3xl shadow-md text-4xl text-white flex items-center justify-center flex-shrink-0">
             ${company.icon || company.name.charAt(0)}
           </div>`;

    headerContainer.className = "flex flex-col md:flex-row items-center md:items-start gap-8 fade-in-up";
    headerContainer.innerHTML = `
        ${logoHtml}
        ${iconHtml}
        <div class="flex-1 text-center md:text-left pt-2">
            <h1 class="text-4xl md:text-6xl font-bold text-slate-900 mb-2 tracking-tight">${company.name}</h1>
            <div class="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium tracking-wide uppercase text-sm">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>${company.location || 'Remote'}</span>
            </div>
        </div>
    `;

    // Description
    document.getElementById('company-description').textContent = company.description;

    // Sidebar Info
    document.getElementById('company-founded').textContent = company.founded || '-';
    document.getElementById('company-employees').textContent = company.employees || '-';

    const websiteLink = document.getElementById('company-website');
    if (company.website) {
        websiteLink.href = company.website;
        try {
            websiteLink.textContent = new URL(company.website).hostname;
        } catch {
            websiteLink.textContent = company.website;
        }
        // Use theme color for link
        websiteLink.className = `text-${themeColor}-600 hover:text-${themeColor}-800 hover:underline transition-colors`;
    } else {
        websiteLink.textContent = '-';
        websiteLink.removeAttribute('href');
        websiteLink.className = 'text-gray-500';
    }

    // Tags
    const tagsContainer = document.getElementById('company-tags');
    tagsContainer.innerHTML = (company.tags || []).map(tag =>
        `<span class="tag bg-${themeColor}-100 text-${themeColor}-700 px-3 py-1 rounded-full text-sm font-medium border border-${themeColor}-200">${tag}</span>`
    ).join('');

    // Open Positions
    const positionsContainer = document.getElementById('open-positions');
    if (company.openPositions && company.openPositions.length > 0) {
        positionsContainer.innerHTML = company.openPositions.map(pos => `
            <div class="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 class="font-bold text-lg text-gray-900 group-hover:text-${themeColor}-600 transition-colors">${pos.title}</h3>
                        <div class="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                ${pos.department}
                            </span>
                            <span>•</span>
                            <span class="bg-gray-100 px-2 py-0.5 rounded text-xs">${pos.type}</span>
                            <span>•</span>
                            <span>${pos.location}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        positionsContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                No positions found
            </div>
        `;
    }

    // Force visibility of fade-in sections
    setTimeout(() => {
        document.querySelectorAll('.fade-in-section').forEach(el => {
            el.classList.add('visible');
            el.style.opacity = '1';
        });
    }, 100);
}

// Load famous companies
function loadFamousCompanies() {
    const famousIds = ['infor', 'gigant', 'awro', 'techcorp'];
    const container = document.getElementById('famous-companies');

    if (!container) return;

    container.innerHTML = '';

    if (typeof COMPANIES_DATA === 'undefined') {
        container.innerHTML = '<div class="col-span-2 md:col-span-4 text-center text-red-500">Error: COMPANIES_DATA not loaded.</div>';
        return;
    }

    famousIds.forEach(id => {
        if (COMPANIES_DATA[id]) {
            const card = createRecentCard(COMPANIES_DATA[id]);
            container.appendChild(card);
        }
    });

    if (container.children.length === 0) {
        container.innerHTML = '<div class="col-span-2 md:col-span-4 text-center text-gray-500">No famous companies found.</div>';
    }
}

// Load recent companies
function loadRecentCompanies() {
    const recentIds = ['gigant', 'infor', 'awro', 'techcorp'];
    const container = document.getElementById('recent-companies');

    if (!container) return;

    container.innerHTML = '';
    let loadedCount = 0;

    if (typeof COMPANIES_DATA !== 'undefined') {
        // 1. Load Standard Companies
        recentIds.forEach(id => {
            if (COMPANIES_DATA[id]) {
                const card = createRecentCard(COMPANIES_DATA[id]);
                container.appendChild(card);
                loadedCount++;
            }
        });
    }

    // 2. Load Custom Companies (LocalStorage)
    try {
        const localData = localStorage.getItem('custom_companies');
        if (localData) {
            const customCompanies = JSON.parse(localData);
            customCompanies.forEach(company => {
                const card = createRecentCard(company);
                container.appendChild(card);
                loadedCount++;
            });
        }
    } catch (e) {
        console.error('Error loading local companies:', e);
    }

    if (loadedCount === 0) {
        container.innerHTML = '<div class="text-center text-red-500 py-8">No companies found.</div>';
    }
}

// Update recent card creator for modern design
function createRecentCard(company) {
    const card = document.createElement('div');
    card.className = 'company-card group relative p-6 transition-all duration-500 fade-in-section';
    card.onclick = () => window.location.href = `company.html?id=${company.id}`;

    const iconColor = company.iconColor || 'bg-indigo-500';
    const tags = company.tags || [];
    const positions = company.openPositions || [];

    // Standardized Logo/Icon Area
    const logoHtml = company.logo
        ? `<div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-sm p-3 flex items-center justify-center border border-slate-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
             <img src="${company.logo}" alt="${company.name}" class="w-full h-full object-contain" onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';" />
           </div>`
        : '';

    const iconHtml = company.logo
        ? `<div class="company-icon ${iconColor} w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-sm text-xl text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500" style="display: none;">
             ${company.icon || company.name.charAt(0)}
           </div>`
        : `<div class="company-icon ${iconColor} w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-sm text-xl text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
             ${company.icon || company.name.charAt(0)}
           </div>`;

    card.innerHTML = `
        <div class="flex items-start md:items-center space-x-6">
            ${logoHtml}
            ${iconHtml}
            
            <div class="flex-1 min-w-0">
                <div class="flex flex-col mb-1">
                    <h3 class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">${company.name}</h3>
                    <div class="flex flex-wrap gap-2 mt-1">
                         ${tags.slice(0, 3).map(tag => `<span class="tag bg-slate-100 text-slate-600 border-none group-hover:bg-indigo-50 group-hover:text-indigo-600">${tag}</span>`).join('')}
                    </div>
                </div>
                
                <p class="text-slate-500 text-sm mb-3 line-clamp-1 md:line-clamp-2">${company.description || 'No description available.'}</p>
                
                <div class="flex items-center space-x-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <div class="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-md" title="Available positions">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span>${positions.length} POSITIONS</span>
                    </div>
                </div>
            </div>
            
            <div class="hidden md:flex flex-col justify-center pl-4 h-16">
                 <div class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transform group-hover:translate-x-1 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                 </div>
            </div>
        </div>
    `;

    // Observe this card for fade-in
    setTimeout(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        observer.observe(card);
    }, 100);

    return card;
}
