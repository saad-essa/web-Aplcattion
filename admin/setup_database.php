<?php
// إعداد قاعدة البيانات وتأسيس الجداول
require_once 'config.php';

$sql_queries = [
    // جدول الحجوزات
    "CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        package VARCHAR(100) NOT NULL,
        travelers INT NOT NULL DEFAULT 1,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    
    // جدول المستخدمين (للعملاء)
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        role ENUM('admin', 'customer') DEFAULT 'customer',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    
    // جدول الباقات (إذا كان النظام يحتاجها)
    "CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        duration INT NOT NULL COMMENT 'عدد الأيام',
        price DECIMAL(10,2) NOT NULL,
        features TEXT COMMENT 'ميزات الباقة',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    
    // إضافة بيانات تجريبية
    "INSERT INTO packages (name, description, duration, price, features) VALUES
        ('باقة 5 أيام', 'رحلة شاملة لأهم معالم سقطرى', 5, 650.00, 'جولة شاملة, مرشد سياحي, وجبات محلية'),
        ('باقة 7 أيام', 'تجربة شاملة تشمل جميع المواقع السياحية', 7, 950.00, 'جميع المعالم, أنشطة مغامرة, نقل خاص'),
        ('باقة المغامرين', 'للمغامرين الذين يبحثون عن تجارب فريدة', 8, 1200.00, 'تسلق الجبال, تخييم صحراوي, غوص حر')
    ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        description = VALUES(description)",
    
    // إضافة مستخدم مدير إذا لم يكن موجوداً
    "INSERT INTO users (username, email, password, full_name, role) VALUES
        ('admin', 'admin@socotrago.com', MD5('admin123'), 'مدير النظام', 'admin'),
        ('customer1', 'customer1@example.com', MD5('customer123'), 'عميل تجريبي', 'customer')
    ON DUPLICATE KEY UPDATE 
        email = VALUES(email),
        full_name = VALUES(full_name)"
];

echo "<div class='container mt-5'>";
echo "<h2 class='mb-4'>إعداد قاعدة البيانات</h2>";

try {
    foreach ($sql_queries as $query) {
        $result = $pdo->exec($query);
        echo "<div class='alert alert-success'>✅ تم تنفيذ الاستعلام بنجاح</div>";
        echo "<pre class='bg-light p-2 rounded'><code>" . htmlspecialchars(substr($query, 0, 150)) . "...</code></pre>";
    }
    
    echo "<div class='alert alert-info mt-4'>";
    echo "<h4>🎉 تم إعداد النظام بنجاح!</h4>";
    echo "<p><strong>بيانات الدخول:</strong></p>";
    echo "<ul>";
    echo "<li><strong>اسم المستخدم:</strong> admin</li>";
    echo "<li><strong>كلمة المرور:</strong> admin123</li>";
    echo "</ul>";
    echo "</div>";
    
    echo '<div class="mt-4">';
    echo '<a href="login.php" class="btn btn-primary me-2">تسجيل الدخول الآن</a>';
    echo '<a href="dashboard.php" class="btn btn-success me-2">لوحة التحكم</a>';
    echo '<a href="../index.html" class="btn btn-secondary">الصفحة الرئيسية</a>';
    echo '</div>';
    
} catch(PDOException $e) {
    echo "<div class='alert alert-danger'>";
    echo "<h4>❌ حدث خطأ!</h4>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "</div>";
?>