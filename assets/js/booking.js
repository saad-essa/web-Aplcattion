// Booking functionality for Socotra Go

document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking form
    initBookingForm();
    initDatePickers();
    initTripCalculations();
    initFormValidation();
    initSummaryUpdate();
    initURLParameters();
});

// Initialize booking form steps
function initBookingForm() {
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    
    // Next step functionality
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStepId = this.getAttribute('data-next');
            const nextStep = document.getElementById(nextStepId + '-form');
            
            // Validate current step before proceeding
            if (!validateStep(currentStep)) {
                return;
            }
            
            // Update active steps
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            
            // Update step indicators
            updateStepIndicators(nextStepId);
            
            // Update summary if going to step 3
            if (nextStepId === 'step3') {
                updateBookingSummary();
            }
        });
    });
    
    // Previous step functionality
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const prevStepId = this.getAttribute('data-prev');
            const prevStep = document.getElementById(prevStepId + '-form');
            
            // Update active steps
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            
            // Update step indicators
            updateStepIndicators(prevStepId);
        });
    });
    
    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateStep(this)) {
                showAlert('يرجى تصحيح الأخطاء في النموذج', 'danger');
                return;
            }
            
            // Collect form data
            const formData = new FormData(this);
            const bookingData = Object.fromEntries(formData);
            
            // Generate booking number
            const bookingNumber = generateBookingNumber();
            document.getElementById('bookingNumber').textContent = bookingNumber;
            
            // Show success modal
            const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
            bookingModal.show();
            
            // Send data to server (in real implementation)
            sendBookingData(bookingData);
            
            // Reset form after successful submission
            setTimeout(() => {
                bookingForm.reset();
                resetFormSteps();
            }, 5000);
        });
    }
}

// Validate individual step
function validateStep(step) {
    let isValid = true;
    const requiredInputs = step.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
            
            // Add error message if not exists
            if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('invalid-feedback')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = 'هذا الحقل مطلوب';
                input.parentNode.appendChild(errorDiv);
            }
        } else {
            input.classList.remove('is-invalid');
            
            // Remove error message if exists
            const errorDiv = input.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.remove();
            }
            
            // Specific validations
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.textContent = 'يرجى إدخال بريد إلكتروني صحيح';
                    input.parentNode.appendChild(errorDiv);
                }
            }
            
            if (input.type === 'tel') {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.textContent = 'يرجى إدخال رقم هاتف صحيح';
                    input.parentNode.appendChild(errorDiv);
                }
            }
        }
    });
    
    return isValid;
}

// Update step indicators
function updateStepIndicators(activeStepId) {
    const steps = document.querySelectorAll('.step');
    let activeFound = false;
    
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
        
        if (step.id === activeStepId) {
            step.classList.add('active');
            activeFound = true;
        } else if (!activeFound) {
            step.classList.add('completed');
        }
    });
}

// Initialize date pickers
function initDatePickers() {
    const arrivalDate = document.getElementById('arrivalDate');
    const departureDate = document.getElementById('departureDate');
    
    if (arrivalDate) {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        arrivalDate.min = today;
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        arrivalDate.value = tomorrow.toISOString().split('T')[0];
        
        // Update departure date min when arrival changes
        arrivalDate.addEventListener('change', function() {
            if (departureDate) {
                departureDate.min = this.value;
                
                // If departure is before arrival, update it
                if (departureDate.value && departureDate.value < this.value) {
                    departureDate.value = this.value;
                }
            }
        });
    }
    
    if (departureDate) {
        // Set default departure to 5 days after arrival
        if (arrivalDate && arrivalDate.value) {
            const arrival = new Date(arrivalDate.value);
            arrival.setDate(arrival.getDate() + 5);
            departureDate.value = arrival.toISOString().split('T')[0];
        }
    }
}

// Initialize trip calculations
function initTripCalculations() {
    const adultsInput = document.getElementById('adults');
    const childrenInput = document.getElementById('children');
    const infantsInput = document.getElementById('infants');
    const tripSelection = document.getElementById('tripSelection');
    
    // Update calculations when inputs change
    [adultsInput, childrenInput, infantsInput, tripSelection].forEach(input => {
        if (input) {
            input.addEventListener('change', updateTripCalculations);
        }
    });
}

// Update trip calculations
function updateTripCalculations() {
    const adults = parseInt(document.getElementById('adults')?.value) || 0;
    const children = parseInt(document.getElementById('children')?.value) || 0;
    const infants = parseInt(document.getElementById('infants')?.value) || 0;
    const tripSelection = document.getElementById('tripSelection')?.value;
    
    // Calculate total travelers
    const totalTravelers = adults + children + infants;
    
    // Update total travelers display
    const totalDisplay = document.getElementById('totalTravelers');
    if (totalDisplay) {
        totalDisplay.textContent = totalTravelers;
    }
    
    // Calculate price based on trip selection
    const price = calculateTripPrice(tripSelection, adults, children, infants);
    
    // Update price display
    const priceDisplay = document.getElementById('calculatedPrice');
    if (priceDisplay) {
        priceDisplay.textContent = formatCurrency(price);
    }
    
    return price;
}

// Calculate trip price
function calculateTripPrice(tripId, adults, children, infants) {
    // Price mapping for trips
    const priceMap = {
        // Daily tours
        'aiq_beach': 120,
        'dragon_blood': 90,
        'hoq_cave': 110,
        'qalansiya': 150,
        
        // Packages
        '5days_package': 650,
        '7days_package': 950,
        'adventure_package': 1200
    };
    
    const basePrice = priceMap[tripId] || 0;
    let totalPrice = 0;
    
    // Calculate total
    if (tripId.includes('package')) {
        // Packages: adults full price, children 50%, infants free
        totalPrice = (adults * basePrice) + (children * basePrice * 0.5);
    } else {
        // Daily tours: same price for all
        totalPrice = (adults + children) * basePrice;
        // Infants free for daily tours too
    }
    
    return totalPrice;
}

// Initialize form validation
function initFormValidation() {
    // Real-time validation for inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Remove invalid class while typing
            if (this.classList.contains('is-invalid')) {
                this.classList.remove('is-invalid');
                const errorDiv = this.nextElementSibling;
                if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                    errorDiv.remove();
                }
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    if (!field.hasAttribute('required') && !field.value) {
        return true;
    }
    
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'هذا الحقل مطلوب';
    }
    
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'يرجى إدخال بريد إلكتروني صحيح';
        }
    }
    
    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'يرجى إدخال رقم هاتف صحيح';
        }
    }
    
    if (field.type === 'date' && field.value) {
        const selectedDate = new Date(field.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (field.id === 'arrivalDate' && selectedDate < today) {
            isValid = false;
            errorMessage = 'لا يمكن اختيار تاريخ في الماضي';
        }
    }
    
    if (field.type === 'number' && field.value) {
        const min = parseInt(field.getAttribute('min')) || 1;
        const max = parseInt(field.getAttribute('max')) || Infinity;
        const value = parseInt(field.value);
        
        if (value < min || value > max) {
            isValid = false;
            errorMessage = `القيمة يجب أن تكون بين ${min} و ${max}`;
        }
    }
    
    // Update field state
    if (!isValid) {
        field.classList.add('is-invalid');
        
        // Add or update error message
        let errorDiv = field.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = errorMessage;
    } else {
        field.classList.remove('is-invalid');
        
        // Remove error message if exists
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.remove();
        }
    }
    
    return isValid;
}

// Initialize booking summary update
function initSummaryUpdate() {
    // Update summary when form changes
    const formInputs = document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('change', updateBookingSummary);
    });
}

// Update booking summary
function updateBookingSummary() {
    const summaryContent = document.getElementById('summaryContent');
    if (!summaryContent) return;
    
    // Collect form data
    const formData = new FormData(document.getElementById('bookingForm'));
    const data = Object.fromEntries(formData);
    
    // Calculate total price
    const adults = parseInt(data.adults) || 1;
    const children = parseInt(data.children) || 0;
    const infants = parseInt(data.infants) || 0;
    const totalPrice = calculateTripPrice(data.trip_selection, adults, children, infants);
    
    // Format dates
    const arrivalDate = data.arrival_date ? formatDate(data.arrival_date, 'ar-SA') : 'غير محدد';
    const departureDate = data.departure_date ? formatDate(data.departure_date, 'ar-SA') : 'غير محدد';
    
    // Get trip name
    const tripName = getTripName(data.trip_selection);
    
    // Build summary HTML
    const summaryHtml = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>الاسم:</strong> ${data.full_name || 'غير محدد'}</p>
                <p><strong>البريد الإلكتروني:</strong> ${data.email || 'غير محدد'}</p>
                <p><strong>رقم الواتساب:</strong> ${data.whatsapp || 'غير محدد'}</p>
                <p><strong>الدولة:</strong> ${data.country || 'غير محدد'}</p>
            </div>
            <div class="col-md-6">
                <p><strong>نوع الرحلة:</strong> ${data.trip_type === 'tour' ? 'رحلة يومية' : 
                                            data.trip_type === 'package' ? 'باقة سياحية' : 
                                            data.trip_type === 'custom' ? 'مخصصة' : 'غير محدد'}</p>
                <p><strong>اسم الرحلة:</strong> ${tripName}</p>
                <p><strong>تاريخ الوصول:</strong> ${arrivalDate}</p>
                <p><strong>تاريخ المغادرة:</strong> ${departureDate}</p>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-md-6">
                <p><strong>عدد المسافرين:</strong></p>
                <ul>
                    <li>البالغين: ${adults}</li>
                    <li>الأطفال: ${children}</li>
                    <li>الرضع: ${infants}</li>
                    <li><strong>المجموع:</strong> ${adults + children + infants} مسافر</li>
                </ul>
            </div>
            <div class="col-md-6">
                <p><strong>التكلفة الإجمالية:</strong></p>
                <h4 class="text-primary">${formatCurrency(totalPrice)}</h4>
                <small class="text-muted">يشمل الضرائب والرسوم</small>
            </div>
        </div>
        ${data.special_requests ? `
        <div class="row mt-3">
            <div class="col-12">
                <p><strong>الطلبات الخاصة:</strong></p>
                <p>${data.special_requests}</p>
            </div>
        </div>
        ` : ''}
    `;
    
    summaryContent.innerHTML = summaryHtml;
}

// Get trip name from selection
function getTripName(tripId) {
    const tripNames = {
        'aiq_beach': 'رحلة شاطئ عيق',
        'dragon_blood': 'رحلة غابة دم الأخوين',
        'hoq_cave': 'رحلة كهف حوق',
        'qalansiya': 'رحلة قلنسية',
        '5days_package': 'باقة 5 أيام - Discover Socotra',
        '7days_package': 'باقة 7 أيام - Socotra Experience',
        'adventure_package': 'باقة المغامرين - Adventure Package'
    };
    
    return tripNames[tripId] || 'غير محدد';
}

// Initialize URL parameters
function initURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get parameters from URL
    const tour = urlParams.get('tour');
    const package = urlParams.get('package');
    
    // Set initial values based on URL parameters
    if (tour) {
        const tripSelection = document.getElementById('tripSelection');
        if (tripSelection) {
            tripSelection.value = tour;
            updateTripCalculations();
        }
    }
    
    if (package) {
        const tripSelection = document.getElementById('tripSelection');
        if (tripSelection) {
            tripSelection.value = package + '_package';
            updateTripCalculations();
        }
    }
}

// Generate booking number
function generateBookingNumber() {
    const prefix = 'SG';
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
}

// Send booking data to server (simulated)
function sendBookingData(data) {
    // In real implementation, this would be an API call
    console.log('Sending booking data:', data);
    
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // Save to local storage for demo purposes
            const bookings = JSON.parse(localStorage.getItem('socotra_bookings') || '[]');
            bookings.push({
                ...data,
                bookingDate: new Date().toISOString(),
                bookingNumber: document.getElementById('bookingNumber').textContent,
                status: 'pending'
            });
            localStorage.setItem('socotra_bookings', JSON.stringify(bookings));
            
            resolve(true);
        }, 1000);
    });
}

// Reset form steps
function resetFormSteps() {
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    
    // Reset to step 1
    formSteps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Reset step indicators
    stepIndicators.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) {
            step.classList.add('active');
        }
    });
}

// Format currency helper
function formatCurrency(amount, currency = 'USD', locale = 'ar-SA') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date helper
function formatDate(dateString, locale = 'ar-SA') {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show alert function
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.booking-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertHtml = `
        <div class="booking-alert alert alert-${type} alert-dismissible fade show position-fixed" 
             style="top: 100px; left: 50%; transform: translateX(-50%); z-index: 9999;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Add alert to page
    document.body.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.booking-alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Export functions for use in other modules
window.bookingModule = {
    calculateTripPrice,
    formatCurrency,
    formatDate,
    showAlert,
    validateField
};