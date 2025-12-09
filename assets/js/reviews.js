// Reviews functionality for Socotra Go

document.addEventListener('DOMContentLoaded', function() {
    // Initialize reviews
    initReviews();
    initReviewForm();
    initRatingSystem();
    initReviewFilters();
    initVideoReviews();
});

// Initialize reviews display
function initReviews() {
    // Check if we have reviews in localStorage
    const savedReviews = getLocalStorage('socotra_reviews');
    
    if (savedReviews && savedReviews.length > 0) {
        // Display saved reviews
        displayReviews(savedReviews);
    } else {
        // Load default reviews
        loadDefaultReviews();
    }
    
    // Update overall rating
    updateOverallRating();
}

// Load default reviews
function loadDefaultReviews() {
    const defaultReviews = [
        {
            id: 1,
            name: "محمد العبدلي",
            rating: 5,
            title: "تجربة لا تنسى في جزيرة العجائب",
            text: "رحلة مذهلة مع فريق Socotra Go المحترف. كانت كل التفاصيل منظمة بشكل رائع، المرشد السياحي كان خبيراً ومتعاوناً، والإقامة كانت مريحة والوجبات لذيذة. شاطئ عيق كان أجمل مما توقعنا!",
            date: "2023-12-15",
            trip: "باقة 5 أيام - Discover Socotra",
            images: ["review1-1.jpg", "review1-2.jpg", "review1-3.jpg"],
            verified: true
        },
        {
            id: 2,
            name: "سارة القاسمي",
            rating: 5,
            title: "رحلة عائلية ناجحة",
            text: "سافرت مع عائلتي المكونة من 6 أشخاص وكانت الرحلة رائعة. فريق Socotra Go تعامل مع احتياجات الأطفال بشكل ممتاز. الأماكن كانت آمنة والمواصلات مريحة. أنصح بشدة باختيارهم لرحلات سقطرى.",
            date: "2023-11-20",
            trip: "باقة 7 أيام - Socotra Experience",
            images: ["review2-1.jpg", "review2-2.jpg"],
            verified: true
        },
        {
            id: 3,
            name: "أحمد التركي",
            rating: 4.5,
            title: "مغامرة لا تصدق",
            text: "اخترت باقة المغامرين وكانت تجربة فريدة. تسلق الجبال، التخييم تحت النجوم، والغوص في المياه الفيروزية. الفريق كان محترفاً جداً والأمان كان أولوية. فقط وجدت الإقامة بسيطة بعض الشيء لكنها كانت مناسبة للمغامرة.",
            date: "2023-10-10",
            trip: "باقة المغامرين - Adventure Package",
            images: ["review3-1.jpg"],
            verified: true
        },
        {
            id: 4,
            name: "فاطمة البحرانية",
            rating: 5,
            title: "رحلة تصوير ساحرة",
            text: "كمصورة محترفة، كنت أبحث عن أماكن فريدة للتصوير. سقطرى مع Socotra Go كانت الحلم الذي تحقق. كل موقع كان أكثر إثارة من الآخر. الفريق ساعدني في الوصول لأفضل زوايا التصوير وكانوا متعاونين جداً.",
            date: "2023-09-05",
            trip: "رحلة مخصصة للتصوير",
            images: ["review4-1.jpg", "review4-2.jpg", "review4-3.jpg"],
            verified: true
        },
        {
            id: 5,
            name: "خالد السعدي",
            rating: 4,
            title: "تجربة جيدة مع بعض الملاحظات",
            text: "الرحلة بشكل عام كانت جيدة، الأماكن جميلة والمرشد ممتاز. لكن واجهتنا مشكلة صغيرة في تنظيم مواعيد التنقلات بين المواقع. التواصل مع الفريق كان سريعاً لحل المشكلة. أنصح بالحجز المبكر.",
            date: "2023-08-15",
            trip: "رحلة شاطئ عيق + كهف حوق",
            images: [],
            verified: true
        },
        {
            id: 6,
            name: "نورة العتيبي",
            rating: 5,
            title: "أجمل إجازة في حياتي",
            text: "لا أملك كلمات لوصف جمال الرحلة. من التنظيم الرائع إلى الاهتمام بكل التفاصيل الصغيرة. كانت أول زيارة لي لسقطرى ولن تكون الأخيرة. شكراً لفريق Socotra Go على هذه الذكريات الجميلة. أوصي كل أصدقائي بالسفر معهم.",
            date: "2023-07-22",
            trip: "باقة 5 أيام - Discover Socotra",
            images: ["review6-1.jpg", "review6-2.jpg"],
            verified: true
        }
    ];
    
    // Save to localStorage
    setLocalStorage('socotra_reviews', defaultReviews);
    
    // Display reviews
    displayReviews(defaultReviews);
}

// Display reviews in the grid
function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;
    
    // Clear existing content
    reviewsContainer.innerHTML = '';
    
    // Sort reviews by date (newest first)
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display each review
    reviews.forEach(review => {
        const reviewCard = createReviewCard(review);
        reviewsContainer.appendChild(reviewCard);
    });
}

// Create review card element
function createReviewCard(review) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-lg-4 col-md-6 mb-4';
    
    // Format date
    const formattedDate = formatDate(review.date, 'ar-SA');
    
    // Create stars HTML
    const stars = createStarsHTML(review.rating);
    
    // Create images HTML
    const imagesHTML = review.images.length > 0 ? createImagesHTML(review.images) : '';
    
    colDiv.innerHTML = `
        <div class="review-card h-100">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="avatar-placeholder">
                        ${getInitials(review.name)}
                    </div>
                    <div>
                        <h5 class="reviewer-name">${review.name}</h5>
                        <div class="review-date">${formattedDate}</div>
                        ${review.verified ? '<span class="verified-badge"><i class="bi bi-patch-check-fill"></i> مراجع</span>' : ''}
                    </div>
                </div>
                <div class="review-rating">
                    ${stars}
                    <span class="rating-text">${review.rating.toFixed(1)}</span>
                </div>
            </div>
            <div class="review-body">
                <h6 class="review-title">${review.title}</h6>
                <p class="review-text">${review.text}</p>
            </div>
            ${imagesHTML}
            <div class="review-footer">
                <div class="review-trip">
                    <i class="bi bi-suitcase"></i>
                    <span>${review.trip}</span>
                </div>
            </div>
        </div>
    `;
    
    return colDiv;
}

// Create stars HTML
function createStarsHTML(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="bi bi-star-fill"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="bi bi-star-half"></i>';
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="bi bi-star"></i>';
    }
    
    return starsHTML;
}

// Create images HTML
function createImagesHTML(images) {
    let imagesHTML = '<div class="review-images mt-3"><div class="row g-2">';
    
    images.forEach((image, index) => {
        if (index < 3) { // Show max 3 images
            imagesHTML += `
                <div class="col-4">
                    <img src="assets/images/${image}" 
                         alt="صورة من الرحلة" 
                         class="img-fluid rounded review-image"
                         data-index="${index}"
                         onclick="openImageGallery(this)">
                </div>
            `;
        }
    });
    
    imagesHTML += '</div></div>';
    return imagesHTML;
}

// Initialize review form
function initReviewForm() {
    const reviewForm = document.getElementById('addReviewForm');
    if (!reviewForm) return;
    
    // Rating input
    const ratingStars = reviewForm.querySelectorAll('.rating-input i');
    const ratingInput = document.getElementById('userRating');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            // Update stars display
            ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                    s.classList.remove('bi-star');
                    s.classList.add('bi-star-fill');
                } else {
                    s.classList.remove('active');
                    s.classList.remove('bi-star-fill');
                    s.classList.add('bi-star');
                }
            });
            
            // Update hidden input
            ratingInput.value = rating;
        });
        
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('bi-star-fill');
                    s.classList.remove('bi-star');
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            const currentRating = parseInt(ratingInput.value) || 0;
            
            ratingStars.forEach((s, index) => {
                if (index >= currentRating) {
                    s.classList.remove('bi-star-fill');
                    s.classList.add('bi-star');
                }
            });
        });
    });
    
    // Form submission
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateReviewForm(this)) {
            return;
        }
        
        // Collect form data
        const formData = new FormData(this);
        const reviewData = {
            id: Date.now(), // Generate unique ID
            name: formData.get('reviewerName'),
            rating: parseInt(formData.get('rating')),
            title: formData.get('reviewTitle'),
            text: formData.get('reviewText'),
            trip: formData.get('reviewTrip') || 'غير محدد',
            date: new Date().toISOString().split('T')[0],
            images: [],
            verified: false
        };
        
        // Handle image uploads
        const imageInput = this.querySelector('input[type="file"]');
        if (imageInput && imageInput.files.length > 0) {
            // In a real implementation, you would upload images to a server
            // For now, we'll just store the file names
            const imageFiles = Array.from(imageInput.files);
            reviewData.images = imageFiles.map(file => file.name);
        }
        
        // Save review
        saveReview(reviewData);
        
        // Show success message
        showReviewSuccess();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addReviewModal'));
        modal.hide();
        
        // Reset form
        this.reset();
        
        // Reset rating stars
        ratingStars.forEach(star => {
            star.classList.remove('active', 'bi-star-fill');
            star.classList.add('bi-star');
        });
        ratingInput.value = '0';
    });
}

// Validate review form
function validateReviewForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('invalid-feedback')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = 'هذا الحقل مطلوب';
                field.parentNode.appendChild(errorDiv);
            }
        } else {
            field.classList.remove('is-invalid');
            
            const errorDiv = field.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.remove();
            }
        }
    });
    
    // Check rating
    const rating = parseInt(document.getElementById('userRating').value);
    if (rating < 1 || rating > 5) {
        isValid = false;
        showAlert('يرجى اختيار تقييم من 1 إلى 5 نجوم', 'warning');
    }
    
    return isValid;
}

// Save review to localStorage
function saveReview(review) {
    try {
        // Get existing reviews
        const existingReviews = getLocalStorage('socotra_reviews') || [];
        
        // Add new review
        existingReviews.unshift(review); // Add to beginning
        
        // Save back to localStorage
        setLocalStorage('socotra_reviews', existingReviews);
        
        // Update display
        displayReviews(existingReviews);
        
        // Update overall rating
        updateOverallRating();
        
        return true;
    } catch (error) {
        console.error('Error saving review:', error);
        showAlert('حدث خطأ في حفظ التقييم', 'danger');
        return false;
    }
}

// Update overall rating statistics
function updateOverallRating() {
    const reviews = getLocalStorage('socotra_reviews') || [];
    
    if (reviews.length === 0) return;
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Count ratings by star
    const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    
    reviews.forEach(review => {
        const roundedRating = Math.round(review.rating);
        ratingCounts[roundedRating]++;
    });
    
    // Update display
    updateRatingDisplay(averageRating, ratingCounts, reviews.length);
}

// Update rating display
function updateRatingDisplay(averageRating, ratingCounts, totalReviews) {
    // Update average rating
    const ratingNumber = document.querySelector('.rating-number');
    if (ratingNumber) {
        ratingNumber.textContent = averageRating.toFixed(1);
    }
    
    // Update stars
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
        starsContainer.innerHTML = createStarsHTML(averageRating);
    }
    
    // Update rating text
    const ratingText = document.querySelector('.rating-text');
    if (ratingText) {
        ratingText.textContent = `تقييم عام من ${totalReviews} عميل`;
    }
    
    // Update rating bars
    updateRatingBars(ratingCounts, totalReviews);
}

// Update rating bars
function updateRatingBars(ratingCounts, totalReviews) {
    for (let stars = 5; stars >= 1; stars--) {
        const count = ratingCounts[stars] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews * 100) : 0;
        
        const barElement = document.querySelector(`.rating-bar-item:nth-child(${6 - stars}) .progress-bar`);
        const countElement = document.querySelector(`.rating-bar-item:nth-child(${6 - stars}) span:last-child`);
        
        if (barElement) {
            barElement.style.width = `${percentage}%`;
        }
        
        if (countElement) {
            countElement.textContent = `${percentage.toFixed(0)}% (${count} عميل)`;
        }
    }
}

// Initialize rating system
function initRatingSystem() {
    // Add rating calculator
    const ratingCalculator = document.getElementById('ratingCalculator');
    if (ratingCalculator) {
        ratingCalculator.addEventListener('input', function() {
            const rating = parseInt(this.value) || 0;
            updateStarsPreview(rating);
        });
    }
}

// Update stars preview
function updateStarsPreview(rating) {
    const previewStars = document.querySelectorAll('.stars-preview i');
    
    previewStars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('bi-star-fill', 'text-warning');
            star.classList.remove('bi-star');
        } else {
            star.classList.remove('bi-star-fill', 'text-warning');
            star.classList.add('bi-star');
        }
    });
}

// Initialize review filters
function initReviewFilters() {
    const ratingFilter = document.getElementById('ratingFilter');
    const dateFilter = document.getElementById('dateFilter');
    const tripFilter = document.getElementById('tripFilter');
    
    if (ratingFilter) {
        ratingFilter.addEventListener('change', filterReviews);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', filterReviews);
    }
    
    if (tripFilter) {
        tripFilter.addEventListener('change', filterReviews);
    }
}

// Filter reviews based on criteria
function filterReviews() {
    const reviews = getLocalStorage('socotra_reviews') || [];
    let filteredReviews = [...reviews];
    
    // Apply rating filter
    const ratingFilter = document.getElementById('ratingFilter');
    if (ratingFilter && ratingFilter.value !== 'all') {
        const minRating = parseInt(ratingFilter.value);
        filteredReviews = filteredReviews.filter(review => review.rating >= minRating);
    }
    
    // Apply date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter && dateFilter.value !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (dateFilter.value) {
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        filteredReviews = filteredReviews.filter(review => {
            const reviewDate = new Date(review.date);
            return reviewDate >= cutoffDate;
        });
    }
    
    // Apply trip filter
    const tripFilter = document.getElementById('tripFilter');
    if (tripFilter && tripFilter.value !== 'all') {
        filteredReviews = filteredReviews.filter(review => 
            review.trip.includes(tripFilter.value)
        );
    }
    
    // Display filtered reviews
    displayReviews(filteredReviews);
    
    // Update filtered count
    updateFilteredCount(filteredReviews.length);
}

// Update filtered count display
function updateFilteredCount(count) {
    const filteredCount = document.getElementById('filteredCount');
    if (filteredCount) {
        filteredCount.textContent = `عرض ${count} تقييم`;
    }
}

// Initialize video reviews
function initVideoReviews() {
    const videoPlayButtons = document.querySelectorAll('.video-play-btn');
    
    videoPlayButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            openVideoModal(videoId);
        });
    });
}

// Open video modal
function openVideoModal(videoId) {
    // In a real implementation, this would load the actual video
    const modalContent = `
        <div class="modal fade" id="videoModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">فيديو تجربة العميل</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="ratio ratio-16x9">
                            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                                    title="تجربة سقطرى"
                                    allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('videoModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // Show modal
    const videoModal = new bootstrap.Modal(document.getElementById('videoModal'));
    videoModal.show();
    
    // Clean up on close
    document.getElementById('videoModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Show review success message
function showReviewSuccess() {
    showAlert('شكراً لك! تم إرسال تقييمك بنجاح وسيظهر بعد المراجعة.', 'success');
}

// Get initials for avatar
function getInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

// Open image gallery
function openImageGallery(imageElement) {
    const reviewCard = imageElement.closest('.review-card');
    const images = Array.from(reviewCard.querySelectorAll('.review-image'));
    const currentIndex = parseInt(imageElement.getAttribute('data-index'));
    
    // Create gallery modal
    const galleryModal = document.createElement('div');
    galleryModal.className = 'modal fade';
    galleryModal.id = 'imageGallery';
    galleryModal.tabIndex = -1;
    
    galleryModal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">صور من الرحلة</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="galleryCarousel" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">
                            ${images.map((img, index) => `
                                <div class="carousel-item ${index === currentIndex ? 'active' : ''}">
                                    <img src="${img.src}" class="d-block w-100 rounded" alt="صورة ${index + 1}">
                                </div>
                            `).join('')}
                        </div>
                        ${images.length > 1 ? `
                            <button class="carousel-control-prev" type="button" data-bs-target="#galleryCarousel" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon"></span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#galleryCarousel" data-bs-slide="next">
                                <span class="carousel-control-next-icon"></span>
                            </button>
                        ` : ''}
                    </div>
                    <div class="image-counter text-center mt-3">
                        <span id="currentImage">${currentIndex + 1}</span> / <span id="totalImages">${images.length}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(galleryModal);
    
    // Initialize carousel
    const carousel = new bootstrap.Carousel(galleryModal.querySelector('#galleryCarousel'), {
        interval: false
    });
    
    // Update counter on slide
    galleryModal.querySelector('#galleryCarousel').addEventListener('slid.bs.carousel', function(event) {
        const activeIndex = event.to;
        galleryModal.querySelector('#currentImage').textContent = activeIndex + 1;
    });
    
    // Show modal
    const bsModal = new bootstrap.Modal(galleryModal);
    bsModal.show();
    
    // Clean up on close
    galleryModal.addEventListener('hidden.bs.modal', function() {
        galleryModal.remove();
    });
}

// Helper functions
function formatDate(dateString, locale = 'ar-SA') {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('LocalStorage error:', e);
    }
}

function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('LocalStorage error:', e);
        return null;
    }
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.review-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertHtml = `
        <div class="review-alert alert alert-${type} alert-dismissible fade show position-fixed" 
             style="top: 100px; left: 50%; transform: translateX(-50%); z-index: 9999; min-width: 300px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Add alert to page
    document.body.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.review-alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Export functions for global use
window.reviewsModule = {
    saveReview,
    getReviews: () => getLocalStorage('socotra_reviews') || [],
    updateOverallRating,
    createReviewCard,
    openImageGallery
};

// Add custom styles for reviews
const reviewStyles = document.createElement('style');
reviewStyles.textContent = `
    .avatar-placeholder {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #3498db, #2c3e50);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .verified-badge {
        background-color: #28a745;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        display: inline-block;
        margin-top: 5px;
    }
    
    .verified-badge i {
        font-size: 0.8rem;
        margin-left: 3px;
    }
    
    .review-image {
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    
    .review-image:hover {
        transform: scale(1.05);
    }
    
    .image-counter {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2c3e50;
    }
    
    .rating-input i {
        cursor: pointer;
        font-size: 1.8rem;
        color: #ddd;
        transition: color 0.3s ease;
        margin: 0 2px;
    }
    
    .rating-input i:hover,
    .rating-input i.active {
        color: #ffc107;
    }
    
    .stars-preview i {
        font-size: 2rem;
        margin: 0 3px;
    }
    
    /* Review filters */
    .review-filters {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 30px;
    }
    
    .review-filters .form-label {
        font-weight: 600;
        color: #2c3e50;
    }
    
    /* Carousel styles for gallery */
    .carousel-item img {
        max-height: 70vh;
        object-fit: contain;
    }
    
    /* Responsive styles */
    @media (max-width: 768px) {
        .review-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .review-rating {
            margin-top: 10px;
        }
        
        .avatar-placeholder {
            width: 50px;
            height: 50px;
            font-size: 1rem;
        }
        
        .rating-input i {
            font-size: 1.5rem;
        }
    }
`;
document.head.appendChild(reviewStyles);