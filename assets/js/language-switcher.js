// Language switcher for Socotra Go

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language switcher
    initLanguageSwitcher();
    loadLanguagePreference();
});

// Initialize language switcher
function initLanguageSwitcher() {
    const langSwitch = document.getElementById('langSwitch');
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Main language switch button
    if (langSwitch) {
        langSwitch.addEventListener('click', function() {
            const currentLang = document.documentElement.lang;
            const newLang = currentLang === 'ar' ? 'en' : 'ar';
            switchLanguage(newLang);
        });
    }
    
    // Individual language buttons
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

// Switch language
function switchLanguage(lang) {
    // Save preference
    saveLanguagePreference(lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update button text
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
        langSwitch.textContent = lang === 'ar' ? 'EN' : 'AR';
    }
    
    // Update all translatable elements
    updateContentLanguage(lang);
    
    // Update URLs for language-specific pages
    updatePageURLs(lang);
    
    // Show confirmation message
    showLanguageMessage(lang);
}

// Update content based on language
function updateContentLanguage(lang) {
    // Get all translatable elements
    const translatableElements = document.querySelectorAll('[data-ar], [data-en]');
    
    translatableElements.forEach(element => {
        const arText = element.getAttribute('data-ar');
        const enText = element.getAttribute('data-en');
        
        if (lang === 'ar' && arText) {
            updateElementContent(element, arText);
        } else if (lang === 'en' && enText) {
            updateElementContent(element, enText);
        }
    });
    
    // Update page titles
    updatePageTitles(lang);
    
    // Update form placeholders and labels
    updateFormElements(lang);
    
    // Update dates and numbers formatting
    updateFormatting(lang);
}

// Update element content based on type
function updateElementContent(element, text) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = text;
    } else if (element.tagName === 'IMG') {
        element.alt = text;
    } else {
        element.textContent = text;
    }
}

// Update page titles
function updatePageTitles(lang) {
    const pageTitles = {
        'index': { ar: 'Socotra Go - جزيرة سقطرى للعجائب', en: 'Socotra Go - Island of Wonders' },
        'tours': { ar: 'الرحلات - Socotra Go', en: 'Tours - Socotra Go' },
        'packages': { ar: 'الباقات - Socotra Go', en: 'Packages - Socotra Go' },
        'attractions': { ar: 'الأماكن السياحية - Socotra Go', en: 'Attractions - Socotra Go' },
        'book': { ar: 'حجز رحلتك - Socotra Go', en: 'Book Your Trip - Socotra Go' },
        'reviews': { ar: 'آراء العملاء - Socotra Go', en: 'Customer Reviews - Socotra Go' },
        'about': { ar: 'عن الوكالة - Socotra Go', en: 'About Us - Socotra Go' },
        'contact': { ar: 'التواصل معنا - Socotra Go', en: 'Contact Us - Socotra Go' }
    };
    
    // Get current page from URL
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    if (pageTitles[currentPage]) {
        document.title = pageTitles[currentPage][lang];
    }
}

// Update form elements
function updateFormElements(lang) {
    const formElements = document.querySelectorAll('form');
    
    formElements.forEach(form => {
        // Update labels
        const labels = form.querySelectorAll('label');
        labels.forEach(label => {
            const arText = label.getAttribute('data-ar');
            const enText = label.getAttribute('data-en');
            
            if (lang === 'ar' && arText) {
                label.textContent = arText;
            } else if (lang === 'en' && enText) {
                label.textContent = enText;
            }
        });
        
        // Update buttons
        const buttons = form.querySelectorAll('button');
        buttons.forEach(button => {
            const arText = button.getAttribute('data-ar');
            const enText = button.getAttribute('data-en');
            
            if (lang === 'ar' && arText) {
                button.innerHTML = button.innerHTML.replace(/[^>]+(?=<)/, arText);
            } else if (lang === 'en' && enText) {
                button.innerHTML = button.innerHTML.replace(/[^>]+(?=<)/, enText);
            }
        });
        
        // Update select options
        const options = form.querySelectorAll('option');
        options.forEach(option => {
            const arText = option.getAttribute('data-ar');
            const enText = option.getAttribute('data-en');
            
            if (lang === 'ar' && arText) {
                option.textContent = arText;
            } else if (lang === 'en' && enText) {
                option.textContent = enText;
            }
        });
    });
}

// Update formatting for dates and numbers
function updateFormatting(lang) {
    // Update dates
    const dateElements = document.querySelectorAll('.date-display');
    dateElements.forEach(element => {
        const date = element.getAttribute('data-date');
        if (date) {
            const formattedDate = formatDate(date, lang);
            element.textContent = formattedDate;
        }
    });
    
    // Update numbers
    const numberElements = document.querySelectorAll('.number-display');
    numberElements.forEach(element => {
        const number = element.getAttribute('data-number');
        if (number) {
            const formattedNumber = formatNumber(number, lang);
            element.textContent = formattedNumber;
        }
    });
    
    // Update prices
    const priceElements = document.querySelectorAll('.price-display');
    priceElements.forEach(element => {
        const amount = element.getAttribute('data-amount');
        const currency = element.getAttribute('data-currency') || 'USD';
        
        if (amount) {
            const formattedPrice = formatCurrency(parseFloat(amount), currency, lang);
            element.textContent = formattedPrice;
        }
    });
}

// Format date based on language
function formatDate(dateString, lang) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    
    if (lang === 'ar') {
        return date.toLocaleDateString('ar-SA', options);
    } else {
        return date.toLocaleDateString('en-US', options);
    }
}

// Format number based on language
function formatNumber(number, lang) {
    if (lang === 'ar') {
        return new Intl.NumberFormat('ar-SA').format(number);
    } else {
        return new Intl.NumberFormat('en-US').format(number);
    }
}

// Format currency based on language
function formatCurrency(amount, currency, lang) {
    if (lang === 'ar') {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}

// Update page URLs for language
function updatePageURLs(lang) {
    // This would typically update links to language-specific versions
    // For now, we'll just update the current page URL
    const currentUrl = window.location.href;
    
    // Remove any existing language parameter
    let newUrl = currentUrl.replace(/[?&]lang=(ar|en)/, '');
    
    // Add language parameter if not index page
    if (newUrl.includes('?')) {
        newUrl += '&lang=' + lang;
    } else {
        newUrl += '?lang=' + lang;
    }
    
    // Update browser history without reloading
    window.history.replaceState({}, '', newUrl);
}

// Show language change message
function showLanguageMessage(lang) {
    const messages = {
        ar: 'تم تغيير اللغة إلى العربية',
        en: 'Language changed to English'
    };
    
    // Remove existing message
    const existingMessage = document.querySelector('.language-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'language-message alert alert-success alert-dismissible fade show position-fixed';
    messageDiv.style.cssText = `
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        min-width: 300px;
        text-align: center;
    `;
    
    messageDiv.innerHTML = `
        ${messages[lang]}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add message to page
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Save language preference
function saveLanguagePreference(lang) {
    try {
        localStorage.setItem('socotra_language', lang);
    } catch (e) {
        console.error('Failed to save language preference:', e);
    }
}

// Load language preference
function loadLanguagePreference() {
    try {
        // Check URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang && (urlLang === 'ar' || urlLang === 'en')) {
            switchLanguage(urlLang);
            return;
        }
        
        // Then check localStorage
        const savedLang = localStorage.getItem('socotra_language');
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
            switchLanguage(savedLang);
            return;
        }
        
        // Then check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ar')) {
            switchLanguage('ar');
        } else {
            switchLanguage('en');
        }
    } catch (e) {
        console.error('Failed to load language preference:', e);
        // Default to Arabic
        switchLanguage('ar');
    }
}

// Language data (could be loaded from JSON file)
const translations = {
    ar: {
        // Navigation
        'home': 'الرئيسية',
        'tours': 'الرحلات',
        'packages': 'الباقات',
        'attractions': 'الأماكن',
        'reviews': 'آراء العملاء',
        'about': 'عن الوكالة',
        'contact': 'التواصل',
        'book_now': 'احجز الآن',
        
        // Common
        'read_more': 'اقرأ المزيد',
        'learn_more': 'تعرف أكثر',
        'view_details': 'عرض التفاصيل',
        'book': 'احجز',
        'price': 'السعر',
        'duration': 'المدة',
        'includes': 'يشمل',
        'from': 'من',
        'to': 'إلى',
        'per_person': 'للشخص',
        'total': 'المجموع',
        'discount': 'خصم',
        'available': 'متاح',
        'sold_out': 'نفذت الكمية',
        
        // Booking form
        'full_name': 'الاسم الكامل',
        'email': 'البريد الإلكتروني',
        'phone': 'رقم الهاتف',
        'whatsapp': 'رقم الواتساب',
        'country': 'الدولة',
        'passport': 'رقم الجواز',
        'arrival_date': 'تاريخ الوصول',
        'departure_date': 'تاريخ المغادرة',
        'adults': 'البالغين',
        'children': 'الأطفال',
        'infants': 'الرضع',
        'special_requests': 'طلبات خاصة',
        'next': 'التالي',
        'previous': 'السابق',
        'submit': 'إرسال',
        'confirm': 'تأكيد',
        
        // Contact
        'send_message': 'أرسل رسالة',
        'subject': 'الموضوع',
        'message': 'الرسالة',
        'name': 'الاسم',
        
        // Footer
        'quick_links': 'روابط سريعة',
        'contact_us': 'اتصل بنا',
        'follow_us': 'تابعنا',
        'rights_reserved': 'جميع الحقوق محفوظة',
        
        // Messages
        'success': 'تم بنجاح',
        'error': 'خطأ',
        'loading': 'جاري التحميل',
        'sending': 'جاري الإرسال',
        'please_wait': 'يرجى الانتظار'
    },
    
    en: {
        // Navigation
        'home': 'Home',
        'tours': 'Tours',
        'packages': 'Packages',
        'attractions': 'Attractions',
        'reviews': 'Reviews',
        'about': 'About',
        'contact': 'Contact',
        'book_now': 'Book Now',
        
        // Common
        'read_more': 'Read More',
        'learn_more': 'Learn More',
        'view_details': 'View Details',
        'book': 'Book',
        'price': 'Price',
        'duration': 'Duration',
        'includes': 'Includes',
        'from': 'From',
        'to': 'To',
        'per_person': 'Per Person',
        'total': 'Total',
        'discount': 'Discount',
        'available': 'Available',
        'sold_out': 'Sold Out',
        
        // Booking form
        'full_name': 'Full Name',
        'email': 'Email',
        'phone': 'Phone Number',
        'whatsapp': 'WhatsApp Number',
        'country': 'Country',
        'passport': 'Passport Number',
        'arrival_date': 'Arrival Date',
        'departure_date': 'Departure Date',
        'adults': 'Adults',
        'children': 'Children',
        'infants': 'Infants',
        'special_requests': 'Special Requests',
        'next': 'Next',
        'previous': 'Previous',
        'submit': 'Submit',
        'confirm': 'Confirm',
        
        // Contact
        'send_message': 'Send Message',
        'subject': 'Subject',
        'message': 'Message',
        'name': 'Name',
        
        // Footer
        'quick_links': 'Quick Links',
        'contact_us': 'Contact Us',
        'follow_us': 'Follow Us',
        'rights_reserved': 'All Rights Reserved',
        
        // Messages
        'success': 'Success',
        'error': 'Error',
        'loading': 'Loading',
        'sending': 'Sending',
        'please_wait': 'Please Wait'
    }
};

// Get translation
function getTranslation(key, lang = null) {
    if (!lang) {
        lang = document.documentElement.lang || 'ar';
    }
    
    if (translations[lang] && translations[lang][key]) {
        return translations[lang][key];
    }
    
    // Return key if translation not found
    return key;
}

// Initialize all translatable elements
function initializeTranslations() {
    const currentLang = document.documentElement.lang || 'ar';
    
    // Set data attributes for all translatable elements
    Object.keys(translations.ar).forEach(key => {
        const elements = document.querySelectorAll(`[data-translate="${key}"]`);
        elements.forEach(element => {
            element.setAttribute('data-ar', translations.ar[key]);
            element.setAttribute('data-en', translations.en[key]);
            element.textContent = translations[currentLang][key];
        });
    });
}

// Export functions for use in other modules
window.languageModule = {
    switchLanguage,
    getTranslation,
    formatDate,
    formatNumber,
    formatCurrency,
    saveLanguagePreference,
    loadLanguagePreference
};