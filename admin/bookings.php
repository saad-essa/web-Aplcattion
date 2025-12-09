<?php
require_once 'config.php';

// Set header for JSON response
header('Content-Type: application/json; charset=utf-8');

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get database connection
$pdo = getPDO();

// Get and sanitize form data
$data = [
    'full_name' => sanitize($_POST['full_name'] ?? ''),
    'email' => sanitize($_POST['email'] ?? ''),
    'whatsapp' => sanitize($_POST['whatsapp'] ?? ''),
    'country' => sanitize($_POST['country'] ?? ''),
    'passport' => sanitize($_POST['passport'] ?? ''),
    'trip_type' => sanitize($_POST['trip_type'] ?? ''),
    'trip_selection' => sanitize($_POST['trip_selection'] ?? ''),
    'arrival_date' => sanitize($_POST['arrival_date'] ?? ''),
    'departure_date' => sanitize($_POST['departure_date'] ?? ''),
    'adults' => intval($_POST['adults'] ?? 1),
    'children' => intval($_POST['children'] ?? 0),
    'infants' => intval($_POST['infants'] ?? 0),
    'accommodation' => sanitize($_POST['accommodation'] ?? ''),
    'food_preference' => sanitize($_POST['food_preference'] ?? ''),
    'special_requests' => sanitize($_POST['special_requests'] ?? ''),
    'how_did_you_hear' => sanitize($_POST['how_did_you_hear'] ?? ''),
    'payment_method' => sanitize($_POST['payment_method'] ?? '')
];

// Validate required fields
$required_fields = ['full_name', 'email', 'whatsapp', 'country', 'trip_type', 'trip_selection', 'arrival_date'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode([
            'success' => false,
            'message' => 'يرجى ملء جميع الحقول المطلوبة',
            'field' => $field
        ]);
        exit;
    }
}

// Validate email
if (!validateEmail($data['email'])) {
    echo json_encode([
        'success' => false,
        'message' => 'البريد الإلكتروني غير صحيح',
        'field' => 'email'
    ]);
    exit;
}

// Validate phone number
if (!validatePhone($data['whatsapp'])) {
    echo json_encode([
        'success' => false,
        'message' => 'رقم الهاتف غير صحيح',
        'field' => 'whatsapp'
    ]);
    exit;
}

// Validate dates
if (!strtotime($data['arrival_date'])) {
    echo json_encode([
        'success' => false,
        'message' => 'تاريخ الوصول غير صحيح',
        'field' => 'arrival_date'
    ]);
    exit;
}

if (!empty($data['departure_date']) && !strtotime($data['departure_date'])) {
    echo json_encode([
        'success' => false,
        'message' => 'تاريخ المغادرة غير صحيح',
        'field' => 'departure_date'
    ]);
    exit;
}

// Validate number of people
if ($data['adults'] < 1) {
    echo json_encode([
        'success' => false,
        'message' => 'يجب أن يكون عدد البالغين 1 على الأقل',
        'field' => 'adults'
    ]);
    exit;
}

// Get tour ID from selection
$tour_id = getTourIdFromSelection($data['trip_selection']);
if (!$tour_id) {
    echo json_encode([
        'success' => false,
        'message' => 'الرحلة المختارة غير متاحة',
        'field' => 'trip_selection'
    ]);
    exit;
}

// Calculate total amount
$total_amount = calculateTotalAmount(
    $data['trip_selection'],
    $data['adults'],
    $data['children'],
    $data['infants']
);

// Generate booking number
$booking_number = generateBookingNumber();

// Start transaction
$pdo->beginTransaction();

try {
    // Insert booking
    $stmt = $pdo->prepare("
        INSERT INTO bookings (
            booking_number, customer_name, email, phone, whatsapp, country,
            passport_number, trip_type, tour_id, arrival_date, departure_date,
            adults, children, infants, accommodation_type, food_preference,
            special_requests, total_amount, payment_method, how_did_you_hear,
            status, payment_status, booking_date
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
        )
    ");
    
    $stmt->execute([
        $booking_number,
        $data['full_name'],
        $data['email'],
        $data['whatsapp'], // Using whatsapp as phone
        $data['whatsapp'],
        $data['country'],
        $data['passport'],
        $data['trip_type'],
        $tour_id,
        $data['arrival_date'],
        $data['departure_date'] ?: null,
        $data['adults'],
        $data['children'],
        $data['infants'],
        $data['accommodation'],
        $data['food_preference'],
        $data['special_requests'],
        $total_amount,
        $data['payment_method'],
        $data['how_did_you_hear'],
        'pending',
        'pending'
    ]);
    
    $booking_id = $pdo->lastInsertId();
    
    // Create initial payment record
    $deposit_amount = calculateDepositAmount($total_amount);
    
    $payment_stmt = $pdo->prepare("
        INSERT INTO payments (booking_id, payment_method, amount, currency, status)
        VALUES (?, ?, ?, 'USD', 'pending')
    ");
    
    $payment_stmt->execute([
        $booking_id,
        $data['payment_method'],
        $deposit_amount
    ]);
    
    // Update tour bookings count
    $update_tour_stmt = $pdo->prepare("
        UPDATE tours SET bookings_count = bookings_count + 1 WHERE id = ?
    ");
    $update_tour_stmt->execute([$tour_id]);
    
    // Commit transaction
    $pdo->commit();
    
    // Get tour details for email
    $tour_stmt = $pdo->prepare("SELECT name_ar, name_en FROM tours WHERE id = ?");
    $tour_stmt->execute([$tour_id]);
    $tour = $tour_stmt->fetch();
    
    // Send confirmation emails
    sendBookingConfirmationEmail($data, $booking_number, $total_amount, $tour);
    sendAdminNotificationEmail($data, $booking_number, $booking_id, $total_amount, $tour);
    
    // Send WhatsApp notification (if configured)
    sendWhatsAppNotification($data['whatsapp'], $booking_number);
    
    // Prepare response
    $response = [
        'success' => true,
        'message' => 'تم استلام حجزك بنجاح!',
        'booking_number' => $booking_number,
        'booking_id' => $booking_id,
        'total_amount' => $total_amount,
        'deposit_amount' => $deposit_amount,
        'data' => [
            'customer_name' => $data['full_name'],
            'email' => $data['email'],
            'arrival_date' => $data['arrival_date'],
            'tour_name' => $tour['name_ar'] ?? 'غير محدد'
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $pdo->rollBack();
    
    error_log("Booking Error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء معالجة الحجز. يرجى المحاولة مرة أخرى.'
    ]);
}

// Helper functions
function getTourIdFromSelection($selection) {
    // This function should map selection to actual tour ID
    // For now, return a mock ID
    $mapping = [
        'aiq_beach' => 1,
        'dragon_blood' => 2,
        'hoq_cave' => 3,
        'qalansiya' => 4,
        '5days_package' => 5,
        '7days_package' => 6,
        'adventure_package' => 7
    ];
    
    return $mapping[$selection] ?? null;
}

function calculateTotalAmount($selection, $adults, $children, $infants) {
    // Price mapping
    $prices = [
        'aiq_beach' => 120,
        'dragon_blood' => 90,
        'hoq_cave' => 110,
        'qalansiya' => 150,
        '5days_package' => 650,
        '7days_package' => 950,
        'adventure_package' => 1200
    ];
    
    $base_price = $prices[$selection] ?? 0;
    
    // Calculate based on selection type
    if (strpos($selection, 'package') !== false) {
        // Package: adults full price, children 50%, infants free
        $total = ($adults * $base_price) + ($children * $base_price * 0.5);
    } else {
        // Daily tour: same price for all (infants free)
        $total = ($adults + $children) * $base_price;
    }
    
    return $total;
}

function calculateDepositAmount($total_amount) {
    // Get deposit percentage from settings
    $deposit_percentage = 30; // Default 30%
    
    // In real implementation, get from database
    // $pdo = getPDO();
    // $stmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'deposit_percentage'");
    // $result = $stmt->fetch();
    // $deposit_percentage = $result['setting_value'] ?? 30;
    
    return ($total_amount * $deposit_percentage) / 100;
}

function generateBookingNumber() {
    $prefix = 'SG';
    $year = date('Y');
    $random = strtoupper(substr(md5(uniqid()), 0, 6));
    
    return $prefix . '-' . $year . '-' . $random;
}

function sendBookingConfirmationEmail($data, $booking_number, $total_amount, $tour) {
    $to = $data['email'];
    $subject = 'تأكيد استلام حجزك - Socotra Go';
    
    $message = "
    <!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Cairo', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef; }
            .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 0.9em; }
            .btn { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>شكراً لحجزك مع Socotra Go</h1>
                <p>تم استلام حجزك بنجاح وسنتواصل معك قريباً</p>
            </div>
            <div class='content'>
                <h2>تفاصيل الحجز</h2>
                
                <div class='booking-info'>
                    <p><strong>رقم الحجز:</strong> $booking_number</p>
                    <p><strong>الاسم:</strong> {$data['full_name']}</p>
                    <p><strong>البريد الإلكتروني:</strong> {$data['email']}</p>
                    <p><strong>رقم الواتساب:</strong> {$data['whatsapp']}</p>
                    <p><strong>الرحلة:</strong> {$tour['name_ar']}</p>
                    <p><strong>تاريخ الوصول:</strong> {$data['arrival_date']}</p>
                    <p><strong>عدد الأشخاص:</strong> {$data['adults']} بالغين، {$data['children']} أطفال</p>
                    <p><strong>المبلغ الإجمالي:</strong> $" . number_format($total_amount, 2) . "</p>
                </div>
                
                <p>سيتم التواصل معك خلال 24 ساعة عمل لتأكيد الحجز وتفاصيل الدفع.</p>
                
                <p>لأي استفسار، يمكنك التواصل معنا على:</p>
                <ul>
                    <li>الواتساب: +967 123 456 789</li>
                    <li>البريد الإلكتروني: info@socotrago.com</li>
                </ul>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='https://socotrago.com/contact.html' class='btn'>تواصل معنا</a>
                </div>
            </div>
            
            <div class='footer'>
                <p>© " . date('Y') . " Socotra Go. جميع الحقوق محفوظة.</p>
                <p>حديبو، سقطرى، اليمن</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Socotra Go <booking@socotrago.com>\r\n";
    $headers .= "Reply-To: info@socotrago.com\r\n";
    
    return mail($to, $subject, $message, $headers);
}

function sendAdminNotificationEmail($data, $booking_number, $booking_id, $total_amount, $tour) {
    $to = ADMIN_EMAIL;
    $subject = "حجز جديد #$booking_number";
    
    $message = "
    <!DOCTYPE html>
    <html lang='ar' dir='rtl'>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .booking-info { background: white; padding: 15px; margin: 15px 0; border: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>🔔 حجز جديد</h2>
            </div>
            <div class='content'>
                <h3>تفاصيل الحجز الجديد</h3>
                
                <div class='booking-info'>
                    <p><strong>رقم الحجز:</strong> $booking_number</p>
                    <p><strong>رقم الحجز في النظام:</strong> $booking_id</p>
                    <p><strong>الاسم:</strong> {$data['full_name']}</p>
                    <p><strong>البريد الإلكتروني:</strong> {$data['email']}</p>
                    <p><strong>رقم الواتساب:</strong> {$data['whatsapp']}</p>
                    <p><strong>الدولة:</strong> {$data['country']}</p>
                    <p><strong>الرحلة:</strong> {$tour['name_ar']}</p>
                    <p><strong>تاريخ الوصول:</strong> {$data['arrival_date']}</p>
                    <p><strong>عدد الأشخاص:</strong> {$data['adults']} بالغين، {$data['children']} أطفال، {$data['infants']} رضع</p>
                    <p><strong>المبلغ الإجمالي:</strong> $" . number_format($total_amount, 2) . "</p>
                    <p><strong>طريقة الدفع:</strong> {$data['payment_method']}</p>
                </div>
                
                <p><strong>الطلبات الخاصة:</strong><br>" . nl2br($data['special_requests']) . "</p>
                
                <p>يمكنك إدارة هذا الحجز من خلال لوحة التحكم:</p>
                <p><a href='" . SITE_URL . "/admin/bookings.php?action=view&id=$booking_id'>عرض الحجز في لوحة التحكم</a></p>
                
                <p>يجب التواصل مع العميل خلال 24 ساعة لتأكيد الحجز.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Socotra Go Booking System <noreply@socotrago.com>\r\n";
    
    return mail($to, $subject, $message, $headers);
}

function sendWhatsAppNotification($phone, $booking_number) {
    // This is a placeholder for WhatsApp integration
    // In real implementation, use WhatsApp Business API or similar service
    
    $message = urlencode("شكراً لحجزك مع Socotra Go! رقم حجزك: $booking_number. سنتواصل معك قريباً.");
    $whatsapp_url = "https://wa.me/$phone?text=$message";
    
    // You can log this URL or use it with a service
    error_log("WhatsApp URL: $whatsapp_url");
    
    return true;
}
?>