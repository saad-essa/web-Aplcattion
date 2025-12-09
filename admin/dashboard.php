<?php
require_once 'config.php';
checkAdminLogin();

// جلب بعض الإحصاءات
try {
    $pdo = getPDO();
    
    // إجمالي الحجوزات
    $total_bookings = $pdo->query("SELECT COUNT(*) as count FROM bookings")->fetch()['count'];
    
    // الحجوزات اليوم
    $today_bookings = $pdo->query("SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURDATE()")->fetch()['count'];
    
    // إجمالي المستخدمين
    $total_users = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch()['count'];
    
    // إجمالي الإيرادات
    $total_revenue = $pdo->query("SELECT SUM(total_price) as total FROM bookings WHERE status = 'confirmed'")->fetch()['total'] ?? 0;
    
    // آخر الحجوزات
    $recent_bookings = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5")->fetchAll();
    
} catch (PDOException $e) {
    $error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم - Socotra Go</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        :root {
            --sidebar-width: 250px;
            --primary-color: #0d6efd;
            --success-color: #198754;
            --warning-color: #fd7e14;
            --danger-color: #dc3545;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        
        .sidebar {
            position: fixed;
            right: 0;
            top: 0;
            width: var(--sidebar-width);
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 20px 0;
            z-index: 1000;
        }
        
        .main-content {
            margin-right: var(--sidebar-width);
            padding: 20px;
            min-height: 100vh;
        }
        
        .sidebar-header {
            padding: 0 20px 30px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
        }
        
        .sidebar-logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
        }
        
        .sidebar-nav {
            padding: 20px 0;
        }
        
        .nav-item {
            margin-bottom: 5px;
        }
        
        .nav-link {
            color: #bbb;
            padding: 12px 25px;
            display: flex;
            align-items: center;
            text-decoration: none;
            transition: all 0.3s;
        }
        
        .nav-link:hover,
        .nav-link.active {
            color: white;
            background: rgba(255, 255, 255, 0.1);
            border-right: 3px solid var(--primary-color);
        }
        
        .nav-link i {
            margin-left: 10px;
            font-size: 1.1rem;
        }
        
        .stats-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s;
            height: 100%;
        }
        
        .stats-card:hover {
            transform: translateY(-5px);
        }
        
        .stats-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            margin-bottom: 20px;
        }
        
        .icon-primary {
            background: rgba(13, 110, 253, 0.1);
            color: var(--primary-color);
        }
        
        .icon-success {
            background: rgba(25, 135, 84, 0.1);
            color: var(--success-color);
        }
        
        .icon-warning {
            background: rgba(253, 126, 20, 0.1);
            color: var(--warning-color);
        }
        
        .icon-danger {
            background: rgba(220, 53, 69, 0.1);
            color: var(--danger-color);
        }
        
        .stats-number {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .stats-label {
            color: #666;
            font-size: 0.9rem;
        }
        
        .card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
        }
        
        .card-header {
            background: white;
            border-bottom: 1px solid #eee;
            padding: 20px;
            border-radius: 15px 15px 0 0 !important;
        }
        
        .table th {
            border-top: none;
            font-weight: 600;
            color: #555;
        }
        
        .badge-pending {
            background: #ffc107;
            color: #000;
        }
        
        .badge-confirmed {
            background: #198754;
            color: white;
        }
        
        .badge-cancelled {
            background: #dc3545;
            color: white;
        }
        
        .welcome-banner {
            background: linear-gradient(135deg, var(--primary-color) 0%, #0b5ed7 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <!-- الشريط الجانبي -->
    <div class="sidebar d-none d-lg-block">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="bi bi-shield-check"></i>
            </div>
            <h5 class="mb-0">Socotra Go</h5>
            <small class="text-muted">لوحة التحكم</small>
        </div>
        
        <div class="sidebar-nav">
            <div class="nav-item">
                <a href="dashboard.php" class="nav-link active">
                    <i class="bi bi-speedometer2"></i>
                    <span>لوحة التحكم</span>
                </a>
            </div>
            
            <div class="nav-item">
                <a href="bookings.php" class="nav-link">
                    <i class="bi bi-calendar-check"></i>
                    <span>إدارة الحجوزات</span>
                </a>
            </div>
            
            <div class="nav-item">
                <a href="users.php" class="nav-link">
                    <i class="bi bi-people"></i>
                    <span>المستخدمين</span>
                </a>
            </div>
            
            <div class="nav-item">
                <a href="packages.php" class="nav-link">
                    <i class="bi bi-briefcase"></i>
                    <span>الباقات</span>
                </a>
            </div>
            
            <div class="nav-item">
                <a href="reviews.php" class="nav-link">
                    <i class="bi bi-star"></i>
                    <span>التقييمات</span>
                </a>
            </div>
            
            <div class="nav-item">
                <a href="settings.php" class="nav-link">
                    <i class="bi bi-gear"></i>
                    <span>الإعدادات</span>
                </a>
            </div>
            
            <div class="nav-item mt-5">
                <a href="logout.php" class="nav-link text-danger">
                    <i class="bi bi-box-arrow-left"></i>
                    <span>تسجيل الخروج</span>
                </a>
            </div>
        </div>
    </div>
    
    <!-- المحتوى الرئيسي -->
    <div class="main-content">
        <!-- شريط التنقل العلوي للجوال -->
        <nav class="navbar navbar-light bg-white d-lg-none mb-4 rounded shadow-sm">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h6">
                    <i class="bi bi-shield-check text-primary me-2"></i>
                    Socotra Go
                </span>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="mobileNav">
                    <div class="navbar-nav">
                        <a class="nav-link active" href="dashboard.php"><i class="bi bi-speedometer2 me-2"></i>لوحة التحكم</a>
                        <a class="nav-link" href="bookings.php"><i class="bi bi-calendar-check me-2"></i>الحجوزات</a>
                        <a class="nav-link" href="users.php"><i class="bi bi-people me-2"></i>المستخدمين</a>
                        <a class="nav-link" href="logout.php"><i class="bi bi-box-arrow-left me-2"></i>تسجيل الخروج</a>
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- رسالة الترحيب -->
        <div class="welcome-banner">
            <h3 class="mb-3">
                <i class="bi bi-person-circle me-2"></i>
                مرحباً، <?php echo $_SESSION['full_name']; ?>
            </h3>
            <p class="mb-0">آخر دخول: <?php echo date('Y-m-d H:i:s'); ?></p>
        </div>
        
        <?php if (isset($error)): ?>
            <div class="alert alert-danger"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <!-- إحصاءات سريعة -->
        <div class="row g-4 mb-4">
            <div class="col-md-3 col-6">
                <div class="stats-card">
                    <div class="stats-icon icon-primary">
                        <i class="bi bi-calendar-check"></i>
                    </div>
                    <div class="stats-number"><?php echo $total_bookings; ?></div>
                    <div class="stats-label">إجمالي الحجوزات</div>
                </div>
            </div>
            
            <div class="col-md-3 col-6">
                <div class="stats-card">
                    <div class="stats-icon icon-success">
                        <i class="bi bi-calendar-day"></i>
                    </div>
                    <div class="stats-number"><?php echo $today_bookings; ?></div>
                    <div class="stats-label">حجوزات اليوم</div>
                </div>
            </div>
            
            <div class="col-md-3 col-6">
                <div class="stats-card">
                    <div class="stats-icon icon-warning">
                        <i class="bi bi-people"></i>
                    </div>
                    <div class="stats-number"><?php echo $total_users; ?></div>
                    <div class="stats-label">إجمالي المستخدمين</div>
                </div>
            </div>
            
            <div class="col-md-3 col-6">
                <div class="stats-card">
                    <div class="stats-icon icon-danger">
                        <i class="bi bi-currency-dollar"></i>
                    </div>
                    <div class="stats-number">$<?php echo number_format($total_revenue, 2); ?></div>
                    <div class="stats-label">إجمالي الإيرادات</div>
                </div>
            </div>
        </div>
        
        <!-- آخر الحجوزات -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-clock-history me-2"></i>
                    آخر الحجوزات
                </h5>
            </div>
            <div class="card-body">
                <?php if (!empty($recent_bookings)): ?>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>رقم الحجز</th>
                                    <th>العميل</th>
                                    <th>الباقة</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($recent_bookings as $booking): ?>
                                <tr>
                                    <td>#<?php echo $booking['id']; ?></td>
                                    <td><?php echo htmlspecialchars($booking['name']); ?></td>
                                    <td><?php echo htmlspecialchars($booking['package']); ?></td>
                                    <td><?php echo date('Y-m-d', strtotime($booking['start_date'])); ?></td>
                                    <td>$<?php echo number_format($booking['total_price'], 2); ?></td>
                                    <td>
                                        <span class="badge badge-<?php echo $booking['status']; ?>">
                                            <?php 
                                            switch($booking['status']) {
                                                case 'pending': echo 'قيد الانتظار'; break;
                                                case 'confirmed': echo 'مؤكد'; break;
                                                case 'cancelled': echo 'ملغي'; break;
                                                default: echo $booking['status'];
                                            }
                                            ?>
                                        </span>
                                    </td>
                                    <td>
                                        <a href="booking_view.php?id=<?php echo $booking['id']; ?>" 
                                           class="btn btn-sm btn-outline-primary">
                                            <i class="bi bi-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    <div class="text-center mt-3">
                        <a href="bookings.php" class="btn btn-primary">
                            <i class="bi bi-list me-2"></i>عرض جميع الحجوزات
                        </a>
                    </div>
                <?php else: ?>
                    <div class="text-center py-5">
                        <i class="bi bi-calendar-x display-1 text-muted"></i>
                        <h5 class="mt-3">لا توجد حجوزات بعد</h5>
                        <p class="text-muted">سيظهر هنا عند وجود حجوزات جديدة</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- معلومات النظام -->
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>معلومات النظام</h5>
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless">
                            <tr>
                                <td><strong>إصدار PHP:</strong></td>
                                <td><?php echo phpversion(); ?></td>
                            </tr>
                            <tr>
                                <td><strong>قاعدة البيانات:</strong></td>
                                <td>MySQL</td>
                            </tr>
                            <tr>
                                <td><strong>إصدار النظام:</strong></td>
                                <td>1.0.0</td>
                            </tr>
                            <tr>
                                <td><strong>الخادم:</strong></td>
                                <td><?php echo $_SERVER['SERVER_SOFTWARE']; ?></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="bi bi-lightning me-2"></i>إجراءات سريعة</h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-2">
                            <div class="col-6">
                                <a href="bookings.php?action=new" class="btn btn-primary w-100 mb-2">
                                    <i class="bi bi-plus-circle me-2"></i>حجز جديد
                                </a>
                            </div>
                            <div class="col-6">
                                <a href="packages.php" class="btn btn-success w-100 mb-2">
                                    <i class="bi bi-briefcase me-2"></i>إدارة الباقات
                                </a>
                            </div>
                            <div class="col-6">
                                <a href="users.php?action=add" class="btn btn-warning w-100">
                                    <i class="bi bi-person-plus me-2"></i>إضافة مستخدم
                                </a>
                            </div>
                            <div class="col-6">
                                <a href="settings.php" class="btn btn-info w-100">
                                    <i class="bi bi-gear me-2"></i>الإعدادات
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // تحديث الوقت تلقائياً
        function updateTime() {
            const now = new Date();
            document.getElementById('currentTime').textContent = 
                now.toLocaleString('ar-SA', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
        }
        
        setInterval(updateTime, 1000);
        updateTime();
        
        // إضافة تأثيرات للبطاقات
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.stats-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = (index * 0.1) + 's';
            });
        });
    </script>
</body>
</html>