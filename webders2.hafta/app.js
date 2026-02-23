/* ========================================
   BEUShareBox — Application Logic
   Modular Vanilla JavaScript SPA
   ======================================== */

// ===== STATE MANAGEMENT =====
// Central state object holding all products
let state = {
    products: [],
    currentFilter: 'all',
    currentSort: 'newest',
    searchQuery: '',
    theme: 'light',
    lang: 'en',
    editingProductId: null
};

// Category emoji mapping for placeholders
const CATEGORY_ICONS = {
    Electronics: '💻',
    Books: '📚',
    Clothing: '👗',
    Home: '🏡',
    Sports: '⚽',
    Other: '📦'
};

// ===== i18n TRANSLATION DICTIONARIES =====
const TRANSLATIONS = {
    en: {
        // Header
        searchPlaceholder: 'Search products...',
        addProduct: '+ Add Product',
        // Add Product Modal
        addNewProduct: 'Add New Product',
        titleLabel: 'Title *',
        titlePlaceholder: 'Product name',
        descLabel: 'Description *',
        descPlaceholder: 'Short description',
        priceLabel: 'Price (₺) *',
        categoryLabel: 'Category *',
        selectCategory: 'Select category',
        catElectronics: 'Electronics',
        catBooks: 'Books',
        catClothing: 'Clothing',
        catHome: 'Home & Garden',
        catSports: 'Sports',
        catOther: 'Other',
        imageLabel: 'Product Image (optional)',
        imageDragText: 'Click or drag image here',
        imageUrlLabel: 'OR Image URL',
        imageUrlPlaceholder: 'https://example.com/image.jpg',
        submitProduct: '🚀 Add Product',
        saveChanges: '💾 Save Changes',
        editProduct: 'Edit Product',
        addNewProduct: 'Add New Product',
        toastUpdated: 'has been updated!',
        editButton: 'Edit',
        // Toolbar
        categoryToolbar: 'Category:',
        filterAll: 'All',
        sortBy: 'Sort by:',
        sortNewest: 'Newest First',
        sortOldest: 'Oldest First',
        sortPriceLow: 'Price: Low → High',
        sortPriceHigh: 'Price: High → Low',
        sortLikes: 'Most Liked',
        // Empty State
        emptyTitle: 'No products yet!',
        emptyDesc: 'Click <strong>+ Add Product</strong> to share your first product.',
        emptySearchTitle: 'No matching products',
        emptySearchDesc: 'Try a different search or filter.',
        // Footer
        footerText: '© 2026 BEUShareBox — Built with ❤️ using HTML, CSS & JavaScript',
        // Stats Modal
        statsDashboard: '📊 Statistics Dashboard',
        totalProducts: 'Total Products',
        totalLikes: 'Total Likes',
        totalComments: 'Total Comments',
        averagePrice: 'Average Price',
        mostLikedProduct: '🏆 Most Liked Product',
        categoryDistribution: '📊 Category Distribution',
        noDataYet: 'No data yet.',
        // Detail Modal
        comments: '💬 Comments',
        noCommentsYet: 'No comments yet.',
        commentPlaceholder: 'Write a comment...',
        send: 'Send',
        likes: 'Likes',
        // Toasts
        toastAdded: 'has been added!',
        toastDeleted: 'deleted.',
        toastLiked: 'You liked',
        toastCommentAdded: 'Comment added! 💬',
        toastImageTooLarge: 'Image too large! Max 500KB.',
        // Validation
        errTitleMin: 'Title must be at least 2 characters.',
        errDescMin: 'Description must be at least 5 characters.',
        errPriceInvalid: 'Please enter a valid price.',
        errCategoryRequired: 'Please select a category.',
        // Confirm
        confirmDelete: 'Are you sure you want to delete'
    },
    tr: {
        // Header
        searchPlaceholder: 'Ürün ara...',
        addProduct: '+ Ürün Ekle',
        // Add Product Modal
        addNewProduct: 'Yeni Ürün Ekle',
        titleLabel: 'Başlık *',
        titlePlaceholder: 'Ürün adı',
        descLabel: 'Açıklama *',
        descPlaceholder: 'Kısa açıklama',
        priceLabel: 'Fiyat (₺) *',
        categoryLabel: 'Kategori *',
        selectCategory: 'Kategori seçin',
        catElectronics: 'Elektronik',
        catBooks: 'Kitaplar',
        catClothing: 'Giyim',
        catHome: 'Ev & Bahçe',
        catSports: 'Spor',
        catOther: 'Diğer',
        imageLabel: 'Ürün Görseli (isteğe bağlı)',
        imageDragText: 'Görsel yüklemek için tıklayın veya sürükleyin',
        imageUrlLabel: 'VEYA Ürün Görsel Linki (URL)',
        imageUrlPlaceholder: 'https://ornek.com/resim.jpg',
        submitProduct: '🚀 Ürün Ekle',
        saveChanges: '💾 Değişiklikleri Kaydet',
        editProduct: 'Ürünü Düzenle',
        addNewProduct: 'Yeni Ürün Ekle',
        toastUpdated: 'güncellendi!',
        editButton: 'Düzenle',
        // Toolbar
        categoryToolbar: 'Kategori:',
        filterAll: 'Tümü',
        sortBy: 'Sırala:',
        sortNewest: 'En Yeni',
        sortOldest: 'En Eski',
        sortPriceLow: 'Fiyat: Düşük → Yüksek',
        sortPriceHigh: 'Fiyat: Yüksek → Düşük',
        sortLikes: 'En Beğenilen',
        // Empty State
        emptyTitle: 'Henüz ürün yok!',
        emptyDesc: 'İlk ürününüzü paylaşmak için <strong>+ Ürün Ekle</strong> butonuna tıklayın.',
        emptySearchTitle: 'Eşleşen ürün bulunamadı',
        emptySearchDesc: 'Farklı bir arama veya filtre deneyin.',
        // Footer
        footerText: '© 2026 BEUShareBox — HTML, CSS & JavaScript ile ❤️ yapıldı',
        // Stats Modal
        statsDashboard: '📊 İstatistik Paneli',
        totalProducts: 'Toplam Ürün',
        totalLikes: 'Toplam Beğeni',
        totalComments: 'Toplam Yorum',
        averagePrice: 'Ortalama Fiyat',
        mostLikedProduct: '🏆 En Beğenilen Ürün',
        categoryDistribution: '📊 Kategori Dağılımı',
        noDataYet: 'Henüz veri yok.',
        // Detail Modal
        comments: '💬 Yorumlar',
        noCommentsYet: 'Henüz yorum yok.',
        commentPlaceholder: 'Yorum yazın...',
        send: 'Gönder',
        likes: 'Beğeni',
        // Toasts
        toastAdded: 'eklendi!',
        toastDeleted: 'silindi.',
        toastLiked: 'Beğendiniz:',
        toastCommentAdded: 'Yorum eklendi! 💬',
        toastImageTooLarge: 'Görsel çok büyük! Maks 500KB.',
        // Validation
        errTitleMin: 'Başlık en az 2 karakter olmalıdır.',
        errDescMin: 'Açıklama en az 5 karakter olmalıdır.',
        errPriceInvalid: 'Lütfen geçerli bir fiyat girin.',
        errCategoryRequired: 'Lütfen bir kategori seçin.',
        // Confirm
        confirmDelete: 'Silmek istediğinize emin misiniz:'
    }
};

// Get translation by key
function t(key) {
    return TRANSLATIONS[state.lang][key] || TRANSLATIONS['en'][key] || key;
}

// ===== LOCAL STORAGE =====
// Load saved data from localStorage
function loadState() {
    try {
        const saved = localStorage.getItem('beusharebox_products');
        if (saved) {
            state.products = JSON.parse(saved);
        }
        const savedTheme = localStorage.getItem('beusharebox_theme');
        if (savedTheme) {
            state.theme = savedTheme;
        }
        const savedLang = localStorage.getItem('beusharebox_lang');
        if (savedLang) {
            state.lang = savedLang;
        }
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
    }
}

// Save products to localStorage
function saveProducts() {
    try {
        localStorage.setItem('beusharebox_products', JSON.stringify(state.products));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
}

function saveTheme() {
    localStorage.setItem('beusharebox_theme', state.theme);
}

// Save language preference
function saveLang() {
    localStorage.setItem('beusharebox_lang', state.lang);
}

// ===== UNIQUE ID GENERATOR =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ===== TOAST NOTIFICATION SYSTEM =====
// Show animated toast notifications for user actions
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icon based on type
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;

    container.appendChild(toast);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== THEME SYSTEM =====
// Toggle between dark and light mode
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeButton();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeButton();
    saveTheme();
}

function updateThemeButton() {
    const btn = document.getElementById('themeToggle');
    btn.textContent = state.theme === 'light' ? '🌙' : '☀️';
    btn.title = state.theme === 'light'
        ? (state.lang === 'tr' ? 'Karanlık Moda Geç' : 'Switch to Dark Mode')
        : (state.lang === 'tr' ? 'Aydınlık Moda Geç' : 'Switch to Light Mode');
}

// ===== LANGUAGE SYSTEM =====
// Toggle between Turkish and English
function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'tr' : 'en';
    saveLang();
    applyLanguage();
    renderProducts(); // Re-render cards to update empty state text
    updateStats();
}

// Apply language to all elements with data-i18n attribute
function applyLanguage() {
    // Update lang toggle button text
    const langBtn = document.getElementById('langToggle');
    langBtn.textContent = state.lang === 'en' ? '🌐 TR' : '🌐 EN';
    langBtn.title = state.lang === 'en' ? 'Türkçeye geç' : 'Switch to English';

    // Update HTML lang attribute
    document.documentElement.lang = state.lang === 'tr' ? 'tr' : 'en';

    // Update all elements with data-i18n attribute (text content)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            // Use innerHTML for keys that may contain HTML (like emptyDesc)
            if (key === 'emptyDesc' || key === 'footerText') {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation) {
            el.placeholder = translation;
        }
    });

    // Update theme button text
    updateThemeButton();
}

// ===== MODAL SYSTEM =====
// Open any modal by ID
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }
}

// Close any modal by ID
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Close all open modals
function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
    });
    document.body.style.overflow = '';
}

// ===== FORM VALIDATION =====
// Validate product form and return error messages
function validateForm(data) {
    const errors = {};

    if (!data.title || data.title.trim().length < 2) {
        errors.title = t('errTitleMin');
    }
    if (!data.description || data.description.trim().length < 5) {
        errors.description = t('errDescMin');
    }
    if (!data.price || isNaN(data.price) || parseFloat(data.price) < 0) {
        errors.price = t('errPriceInvalid');
    }
    if (!data.category) {
        errors.category = t('errCategoryRequired');
    }

    return errors;
}

// Show validation errors on form fields
function showFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    if (errors.title) {
        document.getElementById('titleError').textContent = errors.title;
        document.getElementById('productTitle').classList.add('invalid');
    }
    if (errors.description) {
        document.getElementById('descError').textContent = errors.description;
        document.getElementById('productDescription').classList.add('invalid');
    }
    if (errors.price) {
        document.getElementById('priceError').textContent = errors.price;
        document.getElementById('productPrice').classList.add('invalid');
    }
    if (errors.category) {
        document.getElementById('catError').textContent = errors.category;
        document.getElementById('productCategory').classList.add('invalid');
    }
}

// ===== IMAGE UPLOAD HANDLING =====
let currentImageData = null; // Holds base64 image data

function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');

    // Click to open file picker
    uploadArea.addEventListener('click', () => fileInput.click());

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        handleImageFile(e.target.files[0]);
    });

    // Drag & Drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    // Handle Image URL Preview
    const urlInput = document.getElementById('productImageUrl');
    urlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            // Set up error handler for broken URLs
            preview.onerror = () => {
                showToast(state.lang === 'tr' ? 'Geçersiz görsel URL\'si!' : 'Invalid image URL!', 'error');
                preview.src = '';
                preview.hidden = true;
                placeholder.hidden = false;
            };

            preview.src = url;
            preview.hidden = false;
            placeholder.hidden = true;

            // Clear file upload state if URL is being used
            currentImageData = null;
            fileInput.value = '';
        } else if (!currentImageData) {
            preview.hidden = true;
            preview.src = '';
            placeholder.hidden = false;
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            // Clear URL if file is chosen
            if (urlInput) urlInput.value = '';
        }
    });
}

// Read image file using FileReader API and convert to base64
function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');

    // Limit file size to ~500KB to keep localStorage manageable
    if (file.size > 500 * 1024) {
        showToast(t('toastImageTooLarge'), 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        preview.src = currentImageData;
        preview.hidden = false;
        placeholder.hidden = true;
    };
    reader.readAsDataURL(file);
}

// Reset image upload area
function resetImageUpload() {
    currentImageData = null;
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const fileInput = document.getElementById('productImage');
    const urlInput = document.getElementById('productImageUrl');
    preview.hidden = true;
    preview.src = '';
    placeholder.hidden = false;
    fileInput.value = '';
    if (urlInput) urlInput.value = '';
}

// ===== ADD PRODUCT =====
// Handle form submission and create a new product
function handleAddProduct(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('productTitle').value,
        description: document.getElementById('productDescription').value,
        price: document.getElementById('productPrice').value,
        category: document.getElementById('productCategory').value,
        imageUrl: document.getElementById('productImageUrl').value.trim()
    };

    // Validate
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
        showFormErrors(errors);
        return;
    }

    // Create product object or update existing
    if (state.editingProductId) {
        const index = state.products.findIndex(p => p.id === state.editingProductId);
        if (index !== -1) {
            const oldProduct = state.products[index];
            state.products[index] = {
                ...oldProduct,
                title: formData.title.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category: formData.category,
                image: formData.imageUrl || currentImageData || oldProduct.image
            };
            showToast(`"${formData.title}" ${t('toastUpdated')}`, 'success');
        }
    } else {
        const product = {
            id: generateId(),
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price),
            category: formData.category,
            likes: 0,
            comments: [],
            image: formData.imageUrl || currentImageData || null,
            createdAt: new Date().toISOString()
        };
        state.products.unshift(product);
        showToast(`"${product.title}" ${t('toastAdded')}`, 'success');
    }

    saveProducts();

    // Reset form and close modal
    e.target.reset();
    state.editingProductId = null;
    resetImageUpload();
    showFormErrors({});
    closeModal('addProductModal');

    // Re-render and notify
    renderProducts();
    updateStats();
}

// ===== EDIT PRODUCT =====
function openEditModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    state.editingProductId = productId;

    // Populate form
    document.getElementById('productTitle').value = product.title;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;

    const urlInput = document.getElementById('productImageUrl');
    if (urlInput) {
        // If image is a URL (starts with http), put it in URL field
        if (product.image && product.image.startsWith('http')) {
            urlInput.value = product.image;
        } else {
            urlInput.value = '';
        }
    }

    // Handle preview
    const preview = document.getElementById('imagePreview');
    const placeholder = document.getElementById('uploadPlaceholder');

    if (product.image) {
        preview.src = product.image;
        preview.hidden = false;
        placeholder.hidden = true;
        // If it was a base64 from file upload, keep it in currentImageData if we want to preserve it
        // but it's cleaner to let the user re-upload or keep the old one
        if (product.image.startsWith('data:')) {
            currentImageData = product.image;
        }
    } else {
        resetImageUpload();
    }

    // UI Updates
    document.getElementById('addProductTitle').textContent = t('editProduct');
    document.querySelector('.btn-submit').textContent = t('saveChanges');

    openModal('addProductModal');
}

// ===== DELETE PRODUCT =====
function deleteProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Confirmation dialog
    if (!confirm(`${t('confirmDelete')} "${product.title}"?`)) return;

    // Add removing animation
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
        card.classList.add('removing');
        // Wait for animation to finish before removing from state
        setTimeout(() => {
            state.products = state.products.filter(p => p.id !== productId);
            saveProducts();
            renderProducts();
            updateStats();
            showToast(`"${product.title}" ${t('toastDeleted')}`, 'error');
        }, 350);
    } else {
        state.products = state.products.filter(p => p.id !== productId);
        saveProducts();
        renderProducts();
        updateStats();
    }
}

// ===== LIKE PRODUCT =====
function toggleLike(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    product.likes += 1;
    saveProducts();
    renderProducts();
    updateStats();
    showToast(`${t('toastLiked')} "${product.title}"! ❤️`, 'info');
}

// ===== COMMENT SYSTEM =====
function addComment(productId, text) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !text.trim()) return;

    product.comments.push({
        text: text.trim(),
        createdAt: new Date().toISOString()
    });

    saveProducts();
}

// ===== FILTERING =====
// Filter products by category using Array.filter()
function getFilteredProducts() {
    let filtered = [...state.products];

    // Apply category filter
    if (state.currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === state.currentFilter);
    }

    // Apply search filter
    if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }

    // Apply sorting using Array.sort()
    switch (state.currentSort) {
        case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'priceAsc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'priceDesc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'likes':
            filtered.sort((a, b) => b.likes - a.likes);
            break;
    }

    return filtered;
}

// ===== RENDERING =====
// Render all product cards dynamically using DOM manipulation
function renderProducts() {
    const grid = document.getElementById('productGrid');
    const emptyState = document.getElementById('emptyState');
    const filtered = getFilteredProducts();

    grid.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.hidden = false;
        // You can customize empty state message based on filter/search
        if (state.searchQuery || state.currentFilter !== 'all') {
            emptyState.querySelector('h3').textContent = t('emptySearchTitle');
            emptyState.querySelector('p').innerHTML = t('emptySearchDesc');
        } else {
            emptyState.querySelector('h3').textContent = t('emptyTitle');
            emptyState.querySelector('p').innerHTML = t('emptyDesc');
        }
    } else {
        emptyState.hidden = true;
    }

    // Create product cards with staggered animation
    filtered.forEach((product, index) => {
        const article = createProductCard(product, index);
        grid.appendChild(article);
    });
}

// Create a single product card element
function createProductCard(product, index) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.setAttribute('data-product-id', product.id);
    article.style.animationDelay = `${index * 0.06}s`;

    // Format date
    const date = new Date(product.createdAt);
    const dateLocale = state.lang === 'tr' ? 'tr-TR' : 'en-US';
    const dateStr = date.toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    // Image or placeholder
    const imageHtml = product.image
        ? `<img class="card-image" src="${product.image}" alt="${product.title}" loading="lazy">`
        : `<div class="card-image-placeholder">${CATEGORY_ICONS[product.category] || '📦'}</div>`;

    article.innerHTML = `
        ${imageHtml}
        <div class="card-body">
            <span class="card-category">${product.category}</span>
            <h3 class="card-title">${escapeHtml(product.title)}</h3>
            <p class="card-desc">${escapeHtml(product.description)}</p>
            <div class="card-price">₺${product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div class="card-footer">
            <div class="card-actions">
                <button class="btn-like ${product.likes > 0 ? 'liked' : ''}" data-action="like" data-id="${product.id}" title="Like">
                    ❤️ ${product.likes}
                </button>
                <button class="btn-comment" data-action="detail" data-id="${product.id}" title="Comments">
                    💬 ${product.comments.length}
                </button>
                <button class="btn-edit" data-action="edit" data-id="${product.id}" title="${t('editButton')}">
                    ✏️
                </button>
                <button class="btn-delete" data-action="delete" data-id="${product.id}" title="Delete">
                    🗑️
                </button>
            </div>
            <span class="card-date">${dateStr}</span>
        </div>
    `;

    // Click on card body to open detail modal (not on action buttons)
    article.addEventListener('click', (e) => {
        if (!e.target.closest('[data-action]')) {
            openDetailModal(product.id);
        }
    });

    return article;
}

// ===== PRODUCT DETAIL MODAL =====
function openDetailModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const content = document.getElementById('detailContent');
    const detailTitle = document.getElementById('detailTitle');
    detailTitle.textContent = product.title;

    const date = new Date(product.createdAt);
    const dateLocale = state.lang === 'tr' ? 'tr-TR' : 'en-US';
    const dateStr = date.toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Build image section
    const imageHtml = product.image
        ? `<img class="detail-image" src="${product.image}" alt="${product.title}">`
        : '';

    // Build comments list
    const commentsHtml = product.comments.map(c => {
        const cDate = new Date(c.createdAt);
        return `<div class="comment-item">
            ${escapeHtml(c.text)}
            <span class="comment-time">${cDate.toLocaleString('tr-TR')}</span>
        </div>`;
    }).join('');

    content.innerHTML = `
        ${imageHtml}
        <div class="detail-meta">
            <h3>${escapeHtml(product.title)}</h3>
            <div class="detail-price">₺${product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
            <p class="detail-desc">${escapeHtml(product.description)}</p>
        </div>
        <div class="detail-info-row">
            <span class="detail-info-chip">📂 ${product.category}</span>
            <span class="detail-info-chip">❤️ ${product.likes} ${t('likes')}</span>
            <span class="detail-info-chip">💬 ${product.comments.length} ${state.lang === 'tr' ? 'Yorum' : 'Comments'}</span>
            <span class="detail-info-chip">📅 ${dateStr}</span>
        </div>
        <div class="comments-section">
            <h4>${t('comments')}</h4>
            <div class="comment-list" id="commentList-${product.id}">
                ${commentsHtml || `<p style="color:var(--text-muted);font-size:0.85rem;">${t('noCommentsYet')}</p>`}
            </div>
            <div class="comment-form">
                <input type="text" id="commentInput-${product.id}" placeholder="${t('commentPlaceholder')}" maxlength="200">
                <button data-action="addComment" data-id="${product.id}">${t('send')}</button>
            </div>
        </div>
    `;

    // Handle comment submit inside modal
    const commentBtn = content.querySelector('[data-action="addComment"]');
    const commentInput = document.getElementById(`commentInput-${product.id}`);

    commentBtn.addEventListener('click', () => {
        submitComment(product.id, commentInput);
    });

    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitComment(product.id, commentInput);
        }
    });

    openModal('detailModal');
}

// Submit a comment and refresh detail modal
function submitComment(productId, inputEl) {
    const text = inputEl.value;
    if (!text.trim()) return;

    addComment(productId, text);
    inputEl.value = '';

    // Refresh the detail modal content
    openDetailModal(productId);
    showToast(t('toastCommentAdded'), 'success');
}

// ===== STATISTICS DASHBOARD =====
// Calculate and render statistics using Array.reduce()
function renderStatistics() {
    const content = document.getElementById('statsContent');
    const products = state.products;

    // Total stats
    const totalProducts = products.length;
    const totalLikes = products.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = products.reduce((sum, p) => sum + p.comments.length, 0);
    const avgPrice = totalProducts > 0
        ? (products.reduce((sum, p) => sum + p.price, 0) / totalProducts).toFixed(2)
        : '0.00';

    // Most liked product
    const mostLiked = products.length > 0
        ? products.reduce((max, p) => p.likes > max.likes ? p : max, products[0])
        : null;

    // Category distribution using Array.reduce()
    const categories = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
    }, {});

    const maxCatCount = Math.max(...Object.values(categories), 1);

    // Build distribution bars
    const distHtml = Object.entries(categories).map(([cat, count]) => `
        <div class="dist-row">
            <span class="dist-label">${cat}</span>
            <div class="dist-bar-bg">
                <div class="dist-bar" style="width: ${(count / maxCatCount) * 100}%"></div>
            </div>
            <span class="dist-count">${count}</span>
        </div>
    `).join('');

    // Most liked section
    const mostLikedHtml = mostLiked ? `
        <div class="stat-section">
            <h4>${t('mostLikedProduct')}</h4>
            <div class="most-liked">
                <span class="most-liked-icon">❤️</span>
                <div class="most-liked-info">
                    <h5>${escapeHtml(mostLiked.title)}</h5>
                    <p>${mostLiked.likes} ${state.lang === 'tr' ? 'beğeni' : 'likes'} · ${mostLiked.category}</p>
                </div>
            </div>
        </div>
    ` : '';

    content.innerHTML = `
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-value">${totalProducts}</div>
                <div class="stat-label">${t('totalProducts')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalLikes}</div>
                <div class="stat-label">${t('totalLikes')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalComments}</div>
                <div class="stat-label">${t('totalComments')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">₺${parseFloat(avgPrice).toLocaleString('tr-TR')}</div>
                <div class="stat-label">${t('averagePrice')}</div>
            </div>
        </div>
        ${mostLikedHtml}
        <div class="stat-section">
            <h4>${t('categoryDistribution')}</h4>
            <div class="distribution-bar-container">
                ${distHtml || `<p style="color:var(--text-muted);font-size:0.85rem;">${t('noDataYet')}</p>`}
            </div>
        </div>
    `;
}

// ===== HEADER STATS =====
function updateStats() {
    const totalProducts = state.products.length;
    const totalLikes = state.products.reduce((sum, p) => sum + p.likes, 0);

    document.getElementById('totalProductsMini').textContent = `📦 ${totalProducts}`;
    document.getElementById('totalLikesMini').textContent = `❤️ ${totalLikes}`;
}

// ===== UTILITY: Escape HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== EVENT DELEGATION =====
// Handle all card button clicks using event delegation
function initEventDelegation() {
    const grid = document.getElementById('productGrid');

    grid.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');
        const productId = target.getAttribute('data-id');

        switch (action) {
            case 'like':
                e.stopPropagation();
                toggleLike(productId);
                break;
            case 'delete':
                e.stopPropagation();
                deleteProduct(productId);
                break;
            case 'detail':
                e.stopPropagation();
                openDetailModal(productId);
                break;
            case 'edit':
                e.stopPropagation();
                openEditModal(productId);
                break;
        }
    });
}

// ===== EVENT LISTENERS SETUP =====
function initEventListeners() {
    // Language toggle
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Show add product modal
    document.getElementById('showAddFormBtn').addEventListener('click', () => {
        state.editingProductId = null;
        document.getElementById('productForm').reset();
        resetImageUpload();
        document.getElementById('addProductTitle').textContent = t('addNewProduct');
        document.querySelector('.btn-submit').textContent = t('submitProduct');
        openModal('addProductModal');
    });

    // Show statistics modal
    document.getElementById('showStatsBtn').addEventListener('click', () => {
        renderStatistics();
        openModal('statsModal');
    });

    // Product form submit
    document.getElementById('productForm').addEventListener('submit', handleAddProduct);

    // Close modal buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            if (modalId) closeModal(modalId);
        });
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Category filter buttons
    document.getElementById('filterButtons').addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentFilter = btn.getAttribute('data-category');
        renderProducts();
    });

    // Sort select
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        state.currentSort = e.target.value;
        renderProducts();
    });

    // Search input (using 'input' event for real-time search)
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProducts();
    });
}

// ===== INITIALIZATION =====
// Main initialization function, called on DOMContentLoaded
function init() {
    loadState();
    initTheme();
    applyLanguage();
    initImageUpload();
    initEventListeners();
    initEventDelegation();
    renderProducts();
    updateStats();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
