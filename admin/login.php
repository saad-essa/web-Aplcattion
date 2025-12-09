<?php
session_start();

// إذا كان المستخدم مسجلاً بالفعل، توجيهه للداشبورد
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: dashboard.php');
    exit();
}

// إدراج ملف config
require_once 'config.php';

$error = '';

// معالجة تسجيل الدخول
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = sanitize($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'يرجى ملء جميع الحقول';
    } else {
        // استخدام دالة تسجيل الدخول من config.php
        $user = adminLogin($username, $password);
        
        if ($user) {
            // تسجيل الدخول الناجح
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['full_name'] = $user['full_name'] ?? $user['username'];
            $_SESSION['role'] = $user['role'] ?? 'admin';
            $_SESSION['last_activity'] = time();
            
            // تسجيل النشاط
            logActivity($user['id'], 'تسجيل الدخول', 'تسجيل الدخول إلى لوحة التحكم');
            
            // التوجيه إلى لوحة التحكم
            header('Location: dashboard.php');
            exit();
        } else {
            $error = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - لوحة تحكم Socotra Go</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        :root {
            --primary-color: #0d6efd;
            --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        body {
            background: var(--gradient);
            height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 20px;
        }
        
        .login-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 450px;
            overflow: hidden;
        }
        
        .login-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, #0b5ed7 100%);
            color: white;
            padding: 40px 30px 30px;
            text-align: center;
        }
        
        .login-logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        
        .login-logo i {
            font-size: 40px;
        }
        
        .login-body {
            padding: 40px 30px;
        }
        
        .form-control {
            padding: 15px;
            border-radius: 10px;
            border: 2px solid #eee;
            transition: all 0.3s;
        }
        
        .form-control:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        
        .btn-login {
            background: linear-gradient(135deg, var(--primary-color) 0%, #0b5ed7 100%);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s;
        }
        
        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(13, 110, 253, 0.3);
        }
        
        .login-footer {
            text-align: center;
            padding: 20px;
            border-top: 1px solid #eee;
            background: #f8f9fa;
            color: #666;
        }
        
        .alert-danger {
            border-radius: 10px;
            border: none;
            background: #fee;
            color: #d32f2f;
        }
        
        .password-toggle {
            position: relative;
        }
        
        .password-toggle .toggle-btn {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-header">
                <div class="login-logo">
                    <i class="bi bi-shield-lock"></i>
                </div>
                <h2 class="mb-3">لوحة تحكم Socotra Go</h2>
                <p class="mb-0">أدخل بيانات الدخول للمتابعة</p>
            </div>
            
            <div class="login-body">
                <?php if ($error): ?>
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <?php echo $error; ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>
                
                <form method="POST" action="" id="loginForm">
                    <div class="mb-4">
                        <label for="username" class="form-label">
                            <i class="bi bi-person me-2"></i>اسم المستخدم
                        </label>
                        <input type="text" 
                               class="form-control" 
                               id="username" 
                               name="username" 
                               placeholder="أدخل اسم المستخدم"
                               required
                               autofocus>
                    </div>
                    
                    <div class="mb-4">
                        <label for="password" class="form-label">
                            <i class="bi bi-key me-2"></i>كلمة المرور
                        </label>
                        <div class="password-toggle">
                            <input type="password" 
                                   class="form-control" 
                                   id="password" 
                                   name="password" 
                                   placeholder="أدخل كلمة المرور"
                                   required>
                            <button type="button" class="toggle-btn" onclick="togglePassword()">
                                <i class="bi bi-eye" id="toggleIcon"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3 form-check">
                        <input type="checkbox" class="form-check-input" id="remember" name="remember">
                        <label class="form-check-label" for="remember">تذكرني</label>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-login">
                            <i class="bi bi-box-arrow-in-right me-2"></i>تسجيل الدخول
                        </button>
                    </div>
                </form>
                
                <?php
                // عرض بيانات الدخول الافتراضية في وضع التطوير
                if (defined('DEVELOPMENT_MODE') && DEVELOPMENT_MODE):
                ?>
                <div class="mt-4 p-3 bg-light rounded">
                    <p class="mb-2 text-center">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>بيانات الدخول الافتراضية:</strong>
                    </p>
                    <div class="text-center">
                        <span class="badge bg-primary me-2">admin</span>
                        <span class="badge bg-secondary">admin123</span>
                    </div>
                </div>
                <?php endif; ?>
            </div>
            
            <div class="login-footer">
                <p class="mb-0">
                    <small>
                        <i class="bi bi-c-circle me-1"></i>
                        <?php echo date('Y'); ?> Socotra Go - جميع الحقوق محفوظة
                    </small>
                </p>
                <a href="../index.html" class="text-decoration-none small">
                    <i class="bi bi-arrow-left me-1"></i>العودة للموقع الرئيسي
                </a>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.getElementById('toggleIcon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('bi-eye');
                toggleIcon.classList.add('bi-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('bi-eye-slash');
                toggleIcon.classList.add('bi-eye');
            }
        }
        
        // إضافة تأثير عند إرسال النموذج
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>جاري التسجيل...';
            submitBtn.disabled = true;
        });
        
        // إضافة اختصار لوحة المفاتيح
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.key === 'Enter') {
                document.getElementById('loginForm').submit();
            }
        });
    </script>
</body>
</html>