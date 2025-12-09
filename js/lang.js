// Получение значения из вложенного объекта
function getNested(data, key) {
  return key.split(".").reduce((o, k) => (o ? o[k] : undefined), data);
}

function loadLang(lang) {
  // === НОВОЕ: Логика переключения кнопок ===
  // 1. Находим все кнопки внутри .lang-switch
  const buttons = document.querySelectorAll(".lang-switch button");

  buttons.forEach((btn) => {
    // 2. Сравниваем data-lang кнопки с текущим языком
    if (btn.getAttribute("data-lang") === lang) {
      btn.classList.add("active"); // Добавляем класс активной кнопке
    } else {
      btn.classList.remove("active"); // Убираем у остальных
    }
  });
  // ==========================================

  fetch("/js/lang/" + lang + ".json")
    .then((res) => res.json())
    .then((data) => {
      // Перевод текста
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const value = getNested(data, el.dataset.i18n);
        if (value) el.innerHTML = value;
      });

      // Перевод плейсхолдеров
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const value = getNested(data, el.dataset.i18nPlaceholder);
        if (value) el.placeholder = value;
      });

      // Сохраняем выбор
      localStorage.setItem("lang", lang);

      // Меняем <html lang="">
      document.documentElement.lang = lang;
    })
    .catch((err) => console.error("Language file error:", err));
}

// Загрузка сохраненного языка при старте
const savedLang = localStorage.getItem("lang") || "uk";
loadLang(savedLang);
