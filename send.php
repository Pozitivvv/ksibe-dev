<?php
// send.php

// Отключаем вывод ошибок в браузер (они ломают JSON), но включаем их логирование
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Указываем браузеру, что ответ будет в формате JSON
header('Content-Type: application/json');

// --- НАСТРОЙКИ ---
$botToken = "7735035116:AAF-YqHZNv7JGzEB-rn6_-VTiaBo8h8Dqxo"; // ВАШ ТОКЕН
$chatId = "5515335481"; // ВАШ CHAT ID

try {
    // 1. Проверка метода
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Метод должен быть POST');
    }

    // 2. Сбор данных
    $name = $_POST['name'] ?? 'Не указано';
    $email = $_POST['email'] ?? 'Не указано';
    $site = $_POST['site'] ?? 'Не указано';
    $message = $_POST['message'] ?? '';

    // 3. Формирование текста
    $textMessage = "
<b>Заявка с сайта!</b> 🚀

👤 <b>Имя:</b> $name
📧 <b>Email:</b> $email
🌐 <b>Сайт:</b> $site
💬 <b>Сообщение:</b>
$message
";

    $data = [
        'chat_id' => $chatId,
        'parse_mode' => 'HTML'
    ];

    $method = 'sendMessage';

    // 4. Обработка файла
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $method = 'sendDocument';
        $filePath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        
        // Используем CURLFile
        $data['document'] = new CURLFile($filePath, $_FILES['file']['type'], $fileName);
        $data['caption'] = $textMessage;
    } else {
        $data['text'] = $textMessage;
    }

    // 5. Инициализация cURL
    if (!function_exists('curl_init')) {
        throw new Exception('Библиотека cURL не установлена на сервере!');
    }

    $ch = curl_init("https://api.telegram.org/bot$botToken/$method");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Важно для локалки
    curl_setopt($ch, CURLOPT_HEADER, false);

    $result = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

    // 6. Проверка результата отправки
    if ($result === false) {
        throw new Exception("Ошибка cURL: " . $curlError);
    }

    // Возвращаем то, что ответил Telegram
    echo $result;

} catch (Exception $e) {
    // Если произошла ошибка PHP, возвращаем её как JSON
    echo json_encode([
        'ok' => false,
        'description' => 'Server Error: ' . $e->getMessage()
    ]);
}
?>