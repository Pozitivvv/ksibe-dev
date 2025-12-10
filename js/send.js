document.addEventListener("DOMContentLoaded", () => {
  /* ========================================================================
     1. ВИЗУАЛИЗАЦИЯ ВЫБОРА ФАЙЛА
     ======================================================================== */
  const fileInput = document.getElementById("fileInput");
  const fileLabel = document.querySelector(".custom-file-label");
  const fileLabelText = fileLabel ? fileLabel.querySelector("span") : null;
  const defaultLabelText = fileLabelText
    ? fileLabelText.textContent
    : "Прикріпити файл";

  if (fileInput && fileLabelText) {
    fileInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        // Если файл выбран
        const fileName = this.files[0].name;
        // Обрезаем имя, если длинное
        const truncatedName =
          fileName.length > 20 ? fileName.substring(0, 18) + "..." : fileName;

        fileLabelText.textContent = truncatedName;
        fileLabel.classList.add("file-selected"); // Добавляем класс для зеленого цвета (в CSS)
      } else {
        // Если выбор отменен
        fileLabelText.textContent = defaultLabelText;
        fileLabel.classList.remove("file-selected");
      }
    });
  }

  /* ========================================================================
     2. ЛОГИКА ОТПРАВКИ И МОДАЛЬНОЕ ОКНО
     ======================================================================== */
  const form = document.getElementById("telegramForm");
  const modal = document.getElementById("successModal");
  const modalCloseBtns = document.querySelectorAll(
    ".modal-close-btn, .modal-action-btn"
  );

  // Функция открытия модалки
  // Функция открытия модалки
  // Функция открытия модалки
  function openModal() {
    if (modal) {
      // 1. Находим нашу SVG галочку
      const checkmark = modal.querySelector(".checkmark");

      if (checkmark) {
        // Убираем класс анимации (если он был)
        checkmark.classList.remove("animate-start");

        // МАГИЯ: Заставляем браузер "пересчитать" стили (Trigger Reflow)
        // Без этой строчки анимация не перезапустится
        void checkmark.offsetWidth;

        // Добавляем класс, который запускает CSS-анимацию
        checkmark.classList.add("animate-start");
      }

      // 2. Показываем само окно через GSAP
      gsap.to(modal, { autoAlpha: 1, duration: 0.3 });
      gsap.to(".modal-window", {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.2)",
      });
    }
  }

  // Функция закрытия модалки
  function closeModal() {
    if (modal) {
      gsap.to(modal, { autoAlpha: 0, duration: 0.3 });
      gsap.to(".modal-window", { scale: 0.8, duration: 0.3 });
    }
  }

  // Вешаем события на закрытие
  modalCloseBtns.forEach((btn) => btn.addEventListener("click", closeModal));
  // Закрытие по клику на фон
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData();
      formData.append("name", document.getElementById("name").value);
      formData.append("email", document.getElementById("email").value);
      formData.append("site", document.getElementById("site").value);
      formData.append("message", document.getElementById("message").value);

      if (fileInput && fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
      }

      // Анимация кнопки
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = "Отправка...";
      btn.style.opacity = "0.7";
      btn.disabled = true;

      fetch("send.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok) {
            // УСПЕХ: Открываем модальное окно вместо alert
            openModal();
            form.reset(); // Очистить форму

            // Сбрасываем лейбл файла
            if (fileLabelText) {
              fileLabelText.textContent = defaultLabelText;
              fileLabel.classList.remove("file-selected");
            }
          } else {
            alert("Помилка відправки. Спробуйте пізніше.");
            console.error("Telegram Error:", data);
          }
        })
        .catch((error) => {
          console.error("Fetch Error:", error);
          alert("Помилка мережі.");
        })
        .finally(() => {
          btn.textContent = originalText;
          btn.style.opacity = "1";
          btn.disabled = false;
        });
    });
  }
});
