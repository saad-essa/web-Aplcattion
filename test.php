<?php
// افحص ما إذا كان مجلد admin موجوداً
if (is_dir('admin')) {
    echo "مجلد admin موجود<br>";
    
    // اعرض محتويات المجلد
    $files = scandir('admin');
    echo "ملفات في مجلد admin:<br>";
    foreach ($files as $file) {
        echo "- $file<br>";
    }
} else {
    echo "مجلد admin غير موجود";
}
?>