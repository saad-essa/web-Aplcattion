<?php
session_start();

// تسجيل نشاط الخروج إذا كان المستخدم مسجلاً
if (isset($_SESSION['user_id'])) {
    require_once 'config.php';
    logActivity($_SESSION['user_id'], 'تسجيل الخروج', 'تسجيل الخروج من لوحة التحكم');
}

// تدمير جميع بيانات الجلسة
$_SESSION = array();

// إذا كنت تريد تدمير الجلسة تماماً، احذف أيضاً كوكي الجلسة
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// أخيراً، دمر الجلسة
session_destroy();

// التوجيه إلى صفحة تسجيل الدخول
header('Location: login.php?logout=1');
exit();
?>