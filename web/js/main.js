// ===== DATA MAPPING =====
const SECTIONS = {
    uk: {
        title: '⚖️ Уголовный кодекс',
        data: () => UK_DATA || [],
        type: 'criminal',
        hasFilters: true,
        searchFields: (item) => [item.article, item.name, item.desc, item.fullDesc, item.important]
    },
    'uk-general': {
        title: '📖 Общая часть УК',
        data: () => UK_GENERAL_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    ak: {
        title: '📋 Административный кодекс',
        data: () => AK_DATA || [],
        type: 'admin',
        hasFilters: false,
        searchFields: (item) => [item.article, item.name, item.desc, item.fine]
    },
    dk: {
        title: '🚗 Дорожный кодекс',
        data: () => DK_DATA || [],
        type: 'traffic',
        hasFilters: false,
        searchFields: (item) => [item.article, item.name, item.desc, item.fine]
    },
    pk: {
        title: '📜 Процессуальный кодекс',
        data: () => PK_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    weapon: {
        title: '🔫 Справочник оружия',
        data: () => WEAPON_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.article, item.name, item.desc]
    },
    'gov-rules': {
        title: '📋 Правила гос.структур',
        data: () => GOV_RULES_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    frb: {
        title: '🕵️ ФРБ (Закон)',
        data: () => FRB_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    'frb-charter': {
        title: '📜 Устав ФРБ',
        data: () => FRB_CHARTER_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    ord: {
        title: '🕵️‍♂️ Закон об ОРД',
        data: () => ORD_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    'closed-areas': {
        title: '🚫 Закрытые территории',
        data: () => CLOSED_AREAS_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    theory: {
        title: '🎓 Терминология',
        data: () => THEORY_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    rules: {
        title: '📜 Правила проекта',
        data: () => RULES_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    robbery: {
        title: '🚨 Ограбления и похищения',
        data: () => ROBBERY_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    },
    events: {
        title: '💣 Мероприятия',
        data: () => EVENTS_DATA || [],
        type: 'info',
        hasFilters: false,
        searchFields: (item) => [item.title, ...(item.items || [])]
    }
};

let currentSection = 'uk';
let currentFilter = 'all';
let searchQuery = '';
let isGlobalSearch = false;

// ===== ГЛОБАЛЬНЫЙ ПОИСК =====
function performGlobalSearch(query) {
    if (!query || query.trim() === '') {
        isGlobalSearch = false;
        return null;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    for (const [sectionId, section] of Object.entries(SECTIONS)) {
        const items = section.data();
        if (!items || items.length === 0) continue;
        
        for (const item of items) {
            let matched = false;
            const searchFields = section.searchFields(item);
            
            for (const field of searchFields) {
                if (field && String(field).toLowerCase().includes(lowerQuery)) {
                    matched = true;
                    break;
                }
            }
            
            if (matched) {
                results.push({
                    sectionId: sectionId,
                    sectionTitle: section.title,
                    sectionType: section.type,
                    item: item,
                    hasFilters: section.hasFilters
                });
            }
        }
    }
    
    isGlobalSearch = results.length > 0 || query !== '';
    return results;
}

function renderGlobalSearchResults(results, query) {
    const globalResultsContainer = document.getElementById('globalSearchResults');
    const globalListContainer = document.getElementById('globalSearchList');
    const filtersBar = document.getElementById('filtersBar');
    const articlesContainer = document.getElementById('articlesList');
    
    if (!results || results.length === 0) {
        globalListContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <div class="empty-title">Ничего не найдено</div>
                <p>По запросу "${query}" ничего не найдено</p>
            </div>
        `;
        globalResultsContainer.style.display = 'block';
        filtersBar.style.display = 'none';
        articlesContainer.style.display = 'none';
        return;
    }
    
    let html = '';
    let lastSection = '';
    
    for (const res of results) {
        if (res.sectionTitle !== lastSection) {
            if (lastSection !== '') html += '<div class="section-divider"></div>';
            html += `<div class="search-section-header">📁 ${res.sectionTitle}</div>`;
            lastSection = res.sectionTitle;
        }
        
        const item = res.item;
        const itemId = `${res.sectionId}-${Math.random()}`;
        const stars = item.stars ? `<div class="card-stars">${item.stars}</div>` : '';
        const penalty = item.punishment ? `<span class="card-penalty">⏱️ ${item.punishment}</span>` : '';
        const fine = item.fine ? `<span class="card-fine">💰 ${item.fine}</span>` : '';
        
        let detailsHtml = '';
        if (item.fullDesc) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">📖 Полное описание</div><div class="detail-content">${item.fullDesc}</div></div>`;
        }
        if (item.important) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">⚠️ Важно</div><div class="detail-content">${item.important}</div></div>`;
        }
        if (item.items && item.items.length > 0) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">📋 Содержание</div><div class="detail-content">${item.items.map(i => `<p>• ${i}</p>`).join('')}</div></div>`;
        }
        if (item.who) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">👮 Кто применяет</div><div class="detail-content">${item.who}</div></div>`;
        }
        if (!detailsHtml && item.desc) {
            detailsHtml = `<div class="detail-section"><div class="detail-label">📖 Описание</div><div class="detail-content">${item.desc}</div></div>`;
        }
        if (!detailsHtml) {
            detailsHtml = `<div class="detail-section"><div class="detail-content">Нет дополнительной информации</div></div>`;
        }
        
        html += `
            <div class="article-card ${res.sectionType}" data-section="${res.sectionId}">
                <div class="card-header" onclick="toggleDetails('${itemId}')">
                    <div class="card-info">
                        <div class="card-code">${item.article || item.number || item.title?.substring(0, 30) || 'Информация'}</div>
                        <div class="card-title">${item.name || item.title || ''}</div>
                        <div class="card-desc">${item.desc || (item.items ? item.items[0] : '')}</div>
                        <div class="card-footer">
                            ${penalty}
                            ${fine}
                        </div>
                    </div>
                    ${stars}
                </div>
                <div class="card-details" id="${itemId}">
                    ${detailsHtml}
                </div>
            </div>
        `;
    }
    
    globalListContainer.innerHTML = html;
    globalResultsContainer.style.display = 'block';
    filtersBar.style.display = 'none';
    articlesContainer.style.display = 'none';
    
    // Добавляем обработчики для карточек в результатах поиска
    document.querySelectorAll('#globalSearchList .article-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-header')) return;
            const sectionId = card.dataset.section;
            if (sectionId) {
                changeSection(sectionId);
            }
        });
    });
}

function clearGlobalSearch() {
    searchQuery = '';
    isGlobalSearch = false;
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) searchInput.value = '';
    
    document.getElementById('globalSearchResults').style.display = 'none';
    document.getElementById('filtersBar').style.display = 'flex';
    document.getElementById('articlesList').style.display = 'block';
    
    render();
}

// ===== TOGGLE DETAILS =====
function toggleDetails(id) {
    const details = document.getElementById(id);
    if (details) {
        details.classList.toggle('open');
    }
}

// ===== RENDER FUNCTIONS =====
function render() {
    if (isGlobalSearch) return;
    
    const section = SECTIONS[currentSection];
    if (!section) return;

    document.getElementById('sectionTitle').textContent = section.title;
    renderArticles(section);
    renderFilters(section);
    updateStats(section);
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === currentSection) {
            btn.classList.add('active');
        }
    });
}

function renderArticles(section) {
    const container = document.getElementById('articlesList');
    let items = section.data();

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Нет данных</div><p>Раздел временно недоступен</p></div>`;
        return;
    }

    if (section.hasFilters && currentFilter !== 'all') {
        if (currentFilter === 'sud') items = items.filter(i => i.sud);
        else if (currentFilter === 'sh') items = items.filter(i => i.fine);
        else if (currentFilter === '5star') items = items.filter(i => i.stars === '⭐⭐⭐⭐⭐');
    }

    if (searchQuery && !isGlobalSearch) {
        const query = searchQuery.toLowerCase();
        items = items.filter(item => {
            const article = (item.article || '').toLowerCase();
            const name = (item.name || item.title || '').toLowerCase();
            const desc = (item.desc || '').toLowerCase();
            return article.includes(query) || name.includes(query) || desc.includes(query);
        });
    }

    if (items.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Ничего не найдено</div><p>Попробуйте изменить поисковый запрос или фильтр</p></div>`;
        return;
    }

    container.innerHTML = items.map((item, idx) => {
        const cardId = `${currentSection}-${idx}`;
        const stars = item.stars ? `<div class="card-stars">${item.stars}</div>` : '';
        const penalty = item.punishment ? `<span class="card-penalty">⏱️ ${item.punishment}</span>` : '';
        const fine = item.fine ? `<span class="card-fine">💰 ${item.fine}</span>` : '';
        
        let detailsHtml = '';
        if (item.fullDesc) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">📖 Полное описание</div><div class="detail-content">${item.fullDesc}</div></div>`;
        }
        if (item.important) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">⚠️ Важно</div><div class="detail-content">${item.important}</div></div>`;
        }
        if (item.items && item.items.length > 0) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">📋 Содержание</div><div class="detail-content">${item.items.map(i => `<p>• ${i}</p>`).join('')}</div></div>`;
        }
        if (item.who) {
            detailsHtml += `<div class="detail-section"><div class="detail-label">👮 Кто применяет</div><div class="detail-content">${item.who}</div></div>`;
        }
        if (!detailsHtml && item.desc) {
            detailsHtml = `<div class="detail-section"><div class="detail-label">📖 Описание</div><div class="detail-content">${item.desc}</div></div>`;
        }
        if (!detailsHtml) {
            detailsHtml = `<div class="detail-section"><div class="detail-content">Нет дополнительной информации</div></div>`;
        }

        return `
            <div class="article-card ${section.type}">
                <div class="card-header" onclick="toggleDetails('${cardId}')">
                    <div class="card-info">
                        <div class="card-code">${item.article || item.number || 'Информация'}</div>
                        <div class="card-title">${item.name || item.title || ''}</div>
                        <div class="card-desc">${item.desc || (item.items ? item.items[0] : '')}</div>
                        <div class="card-footer">
                            ${penalty}
                            ${fine}
                        </div>
                    </div>
                    ${stars}
                </div>
                <div class="card-details" id="${cardId}">
                    ${detailsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function renderFilters(section) {
    const container = document.getElementById('filtersBar');
    
    if (!section.hasFilters) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">📌 Все</button>
        <button class="filter-btn ${currentFilter === 'sud' ? 'active' : ''}" onclick="setFilter('sud')">⚠️ Влечёт судимость</button>
        <button class="filter-btn ${currentFilter === 'sh' ? 'active' : ''}" onclick="setFilter('sh')">💰 Со штрафом</button>
        <button class="filter-btn ${currentFilter === '5star' ? 'active' : ''}" onclick="setFilter('5star')">⭐ 5 звёзд</button>
    `;
}

function updateStats(section) {
    const items = section.data();
    const statsContainer = document.getElementById('stats');
    if (!statsContainer) return;
    
    let html = `<div class="stat-badge">📄 ${items.length} записей</div>`;
    if (section.hasFilters && items.length > 0) {
        const sudCount = items.filter(i => i.sud).length;
        const fineCount = items.filter(i => i.fine).length;
        if (sudCount > 0) html += `<div class="stat-badge">⚠️ ${sudCount}</div>`;
        if (fineCount > 0) html += `<div class="stat-badge">💰 ${fineCount}</div>`;
    }
    statsContainer.innerHTML = html;
}

// ===== FILTER HANDLER =====
window.setFilter = function(filter) {
    currentFilter = filter;
    render();
};

// ===== SECTION CHANGE =====
function changeSection(sectionId) {
    currentSection = sectionId;
    currentFilter = 'all';
    
    if (!isGlobalSearch) {
        searchQuery = '';
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.value = '';
    }
    
    isGlobalSearch = false;
    document.getElementById('globalSearchResults').style.display = 'none';
    document.getElementById('filtersBar').style.display = 'flex';
    document.getElementById('articlesList').style.display = 'block';
    
    render();
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });
}

// ===== EXPORT GLOBALS =====
window.toggleDetails = toggleDetails;
window.setFilter = setFilter;
window.changeSection = changeSection;
window.clearGlobalSearch = clearGlobalSearch;

// ===== BUILD SIDEBARS =====
const NAV_ITEMS = [
    { group: '📚 Кодексы', items: [
        { id: 'uk', icon: '⚖️', name: 'Уголовный кодекс' },
        { id: 'uk-general', icon: '📖', name: 'Общая часть УК' },
        { id: 'ak', icon: '📋', name: 'Административный' },
        { id: 'dk', icon: '🚗', name: 'Дорожный' },
        { id: 'pk', icon: '📜', name: 'Процессуальный' }
    ] },
    { group: '🔍 Справочники', items: [
        { id: 'weapon', icon: '🔫', name: 'Оружие' },
        { id: 'gov-rules', icon: '📋', name: 'Гос.структуры' },
        { id: 'frb', icon: '🕵️', name: 'ФРБ (Закон)' },
        { id: 'frb-charter', icon: '📜', name: 'Устав ФРБ' },
        { id: 'ord', icon: '🕵️‍♂️', name: 'Закон об ОРД' }
    ] },
    { group: '⚠️ Особое', items: [
        { id: 'closed-areas', icon: '🚫', name: 'Закрытые территории' },
        { id: 'theory', icon: '🎓', name: 'Терминология' },
        { id: 'rules', icon: '📜', name: 'Правила проекта' },
        { id: 'robbery', icon: '🚨', name: 'Ограбления' },
        { id: 'events', icon: '💣', name: 'Мероприятия' }
    ] }
];

function buildSidebars() {
    const desktopNav = document.getElementById('desktopSidebarNav');
    const mobileNav = document.getElementById('mobileSidebarNav');
    
    let html = '';
    for (const group of NAV_ITEMS) {
        html += `<div class="nav-group"><div class="nav-group-title">${group.group}</div>`;
        for (const item of group.items) {
            html += `<button class="nav-item" data-section="${item.id}"><span class="nav-icon">${item.icon}</span><span>${item.name}</span></button>`;
        }
        html += `</div>`;
    }
    
    if (desktopNav) desktopNav.innerHTML = html;
    if (mobileNav) mobileNav.innerHTML = html;
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => changeSection(btn.dataset.section));
    });
}

// ===== MOBILE MENU =====
function openMobileMenu() {
    document.getElementById('mobileSidebar').classList.add('open');
    document.getElementById('mobileMenuOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    document.getElementById('mobileSidebar').classList.remove('open');
    document.getElementById('mobileMenuOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    buildSidebars();
    
    document.getElementById('menuToggleBtn')?.addEventListener('click', openMobileMenu);
    document.getElementById('closeSidebarBtn')?.addEventListener('click', closeMobileMenu);
    document.getElementById('mobileMenuOverlay')?.addEventListener('click', closeMobileMenu);
    document.getElementById('clearSearchBtn')?.addEventListener('click', clearGlobalSearch);
    
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            const results = performGlobalSearch(searchQuery);
            
            if (results && results.length > 0) {
                renderGlobalSearchResults(results, searchQuery);
                document.getElementById('sectionTitle').textContent = '🔍 Результаты поиска';
                document.getElementById('stats').innerHTML = `<div class="stat-badge">🎯 Найдено: ${results.length}</div>`;
            } else if (searchQuery && searchQuery !== '') {
                renderGlobalSearchResults([], searchQuery);
                document.getElementById('sectionTitle').textContent = '🔍 Результаты поиска';
                document.getElementById('stats').innerHTML = `<div class="stat-badge">🎯 Найдено: 0</div>`;
            } else {
                clearGlobalSearch();
            }
        });
    }
    
    // Запускаем рендер начальной секции
    render();
});
