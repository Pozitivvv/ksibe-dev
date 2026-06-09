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
/* ==========================================
   2. Основная функция загрузки языка (ОБНОВЛЕННАЯ)
   ========================================== */
function loadLang(lang) {
  // --- А. Логика Dropdown (Desktop) ---
  const langDropdown = document.getElementById("langDropdown");

  if (langDropdown) {
    const currentLangText = langDropdown.querySelector(".current-lang");
    const langOptions = langDropdown.querySelectorAll(".lang-option");

    langOptions.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.value === lang) {
        btn.classList.add("active");
        const spanLabel = btn.querySelector("span");
        if (currentLangText && spanLabel) {
          currentLangText.textContent = spanLabel.textContent;
        }
      }
    });
  }

  // --- Б. Логика кнопок (Mobile / Footer) ---
  const simpleButtons = document.querySelectorAll(".lang-switch button");
  simpleButtons.forEach((btn) => {
    if (btn.getAttribute("data-lang") === lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // --- В. Загрузка JSON файла перевода ---
  fetch("/js/lang/" + lang + ".json")
    .then((res) => res.json())
    .then((data) => {
      // 1. Перевод текстов в теле страницы
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const value = getNested(data, el.dataset.i18n);
        if (value) el.innerHTML = value;
      });

      // 2. Перевод плейсхолдеров
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const value = getNested(data, el.dataset.i18nPlaceholder);
        if (value) el.placeholder = value;
      });

      // --- НОВОЕ: SEO ОПТИМИЗАЦИЯ ---

      // 3. Обновляем Title (Название вкладки)
      // Берем ключ, который вы использовали в HTML: "header.titleMainPage"
      // 3. Обновляем Title (Название вкладки)
      const titleElement = document.querySelector("title");
      let titleValue;

      if (titleElement && titleElement.hasAttribute("data-i18n")) {
        titleValue = getNested(data, titleElement.getAttribute("data-i18n"));
      }

      // Якщо ключа немає (або переклад не знайдено), беремо дефолтний від головної сторінки
      if (!titleValue) {
        titleValue = getNested(data, "header.titleMainPage");
      }

      if (titleValue) document.title = titleValue;

      // 4. Обновляем Meta Description (Описание для Google)
      // ВАЖНО: Добавьте ключ "header.metaDescription" в ваши JSON файлы!
      const descValue = getNested(data, "header.metaDescription");
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && descValue) {
        metaDesc.setAttribute("content", descValue);
      }
      // 1. Обновляем OG:Title (Заголовок для соцсетей)
      const ogTitleValue = getNested(data, "header.ogTitle");
      const ogTitleTag = document.querySelector('meta[property="og:title"]');
      if (ogTitleTag && ogTitleValue) {
        ogTitleTag.setAttribute("content", ogTitleValue);
      }

      // 2. Обновляем OG:Description (Описание для соцсетей)
      const ogDescValue = getNested(data, "header.ogDescription");
      const ogDescTag = document.querySelector(
        'meta[property="og:description"]',
      );
      if (ogDescTag && ogDescValue) {
        ogDescTag.setAttribute("content", ogDescValue);
      }

      // 5. Обновляем URL без перезагрузки страницы
      // URL станет вида: yoursite.com/?lang=en
      const newUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?lang=" +
        lang;
      window.history.pushState({ path: newUrl }, "", newUrl);

      // --- КОНЕЦ НОВОГО ---

      // Сохраняем выбор
      localStorage.setItem("lang", lang);
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

  // --- ЛОГИКА АВТОДЕТЕКТА (С УЧЕТОМ URL) ---

  const supportedLangs = ["uk", "en", "de", "ru"];
  let langToUse = localStorage.getItem("lang");

  // 1. Сначала проверяем URL (это самый высокий приоритет)
  const urlParams = new URLSearchParams(window.location.search);
  const langFromUrl = urlParams.get("lang");

  if (langFromUrl && supportedLangs.includes(langFromUrl)) {
    langToUse = langFromUrl;
  }
  // 2. Если в URL нет, и в памяти нет - берем язык браузера
  else if (!langToUse) {
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang
      ? browserLang.slice(0, 2).toLowerCase()
      : "uk";
    langToUse = supportedLangs.includes(shortLang) ? shortLang : "uk";
  }

  loadLang(langToUse);
});
