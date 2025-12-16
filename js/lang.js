/* ==========================================
   Вспомогательная функция для JSON
   ========================================== */
function getNested(data, key) {
  return key.split(".").reduce((o, k) => (o ? o[k] : undefined), data);
}

/* ==========================================
   1. ГЛОБАЛЬНАЯ функция выбора (для onclick в HTML)
   ========================================== */
// Мы привязываем её к window, чтобы HTML мог её увидеть
window.selectLang = function (langCode, langLabel) {
  // 1. Находим наш Dropdown (по правильному ID из вашего HTML)
  const langDropdown = document.getElementById("langDropdown");

  // 2. Закрываем меню, если оно есть (убираем класс is-open)
  if (langDropdown) {
    langDropdown.classList.remove("is-open");
  }

  // 3. Запускаем основную функцию смены языка
  loadLang(langCode);
};

/* ==========================================
   2. Основная функция загрузки языка
   ========================================== */
function loadLang(lang) {
  // --- А. Логика Dropdown (Desktop) ---
  const langDropdown = document.getElementById("langDropdown");

  // Проверяем, существует ли элемент, чтобы не было ошибки "Cannot read properties of null"
  if (langDropdown) {
    const currentLangText = langDropdown.querySelector(".current-lang"); // Ваш класс в HTML
    const langOptions = langDropdown.querySelectorAll(".lang-option");

    langOptions.forEach((btn) => {
      btn.classList.remove("active");

      // Если это выбранный язык
      if (btn.dataset.value === lang) {
        btn.classList.add("active");

        // Обновляем текст на главной кнопке (UA -> EN)
        // Берем текст из тега <span> внутри кнопки (EN, UA, DE...)
        const spanLabel = btn.querySelector("span");
        if (currentLangText && spanLabel) {
          currentLangText.textContent = spanLabel.textContent;
        }
      }
    });
  }

  // --- Б. Логика кнопок (Mobile / Footer) ---
  // Это для нижнего меню в мобилке, чтобы там тоже переключался класс active
  const simpleButtons = document.querySelectorAll(".lang-switch button");
  simpleButtons.forEach((btn) => {
    if (btn.getAttribute("data-lang") === lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // --- В. Загрузка JSON файла перевода ---
  // Add a slash at the beginning to always start from root
  fetch("/js/lang/" + lang + ".json")
    .then((res) => res.json())
    .then((data) => {
      // Перевод текстов
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const value = getNested(data, el.dataset.i18n);
        if (value) el.innerHTML = value;
      });

      // Перевод плейсхолдеров (для инпутов)
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const value = getNested(data, el.dataset.i18nPlaceholder);
        if (value) el.placeholder = value;
      });

      // Сохраняем выбор пользователя
      localStorage.setItem("lang", lang);
      // Меняем атрибут языка у HTML тега
      document.documentElement.lang = lang;
    })
    .catch((err) => console.error("Language file error:", err));
}

/* ==========================================
   3. Инициализация событий (при загрузке страницы)
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
  const langDropdown = document.getElementById("langDropdown");

  // Проверяем, существует ли элемент
  if (langDropdown) {
    langDropdown.addEventListener("click", (e) => {
      if (e.target.closest(".lang-dropdown__btn")) {
        langDropdown.classList.toggle("is-open");
      }
    });

    document.addEventListener("click", (e) => {
      if (!langDropdown.contains(e.target)) {
        langDropdown.classList.remove("is-open");
      }
    });
  }

  // --- ЛОГИКА АВТОДЕТЕКТА ---

  // 1. Список поддерживаемых языков (чтобы не пытаться загрузить 'fr' или 'es', которых нет)
  const supportedLangs = ["uk", "en", "de", "ru"];

  // 2. Проверяем, выбирал ли пользователь язык раньше
  let langToUse = localStorage.getItem("lang");

  // 3. Если в памяти ничего нет (первый визит), определяем язык браузера
  if (!langToUse) {
    // Получаем язык браузера (например, "en-US", "uk-UA", "ru")
    const browserLang = navigator.language || navigator.userLanguage;

    // Берем первые 2 буквы (en, uk, ru)
    const shortLang = browserLang
      ? browserLang.slice(0, 2).toLowerCase()
      : "uk";

    // Если этот язык у нас поддерживается — используем его, иначе — 'uk'
    if (supportedLangs.includes(shortLang)) {
      langToUse = shortLang;
    } else {
      langToUse = "uk"; // Язык по умолчанию, если браузер на китайском/испанском и т.д.
    }
  }

  // 4. Запускаем загрузку
  loadLang(langToUse);
});
