document.addEventListener("DOMContentLoaded", () => {
  // Регистрируем плагины
  gsap.registerPlugin(ScrollTrigger);

  // --- 1. АНИМАЦИЯ ГЕРОЯ (Заголовок и телефон) ---
  const tl = gsap.timeline();

  tl.from(".pwa-hero__text", {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  }).from(
    ".pwa-hero__visual",
    {
      x: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    },
    "-=0.7" // Запускаем чуть раньше, чем закончится анимация текста
  );

  // --- 2. АНИМАЦИЯ КАРТОЧЕК (ИСПРАВЛЕННАЯ) ---

  // Сначала устанавливаем начальное состояние (скрыты и опущены)
  gsap.set(".benefit-card", { y: 50, opacity: 0 });

  // Используем batch для умной анимации сетки
  ScrollTrigger.batch(".benefit-card", {
    start: "top 85%", // Начинать, когда верх карточки на 85% экрана
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15, // Задержка между карточками в одном ряду
        ease: "back.out(1.2)",
        overwrite: true,
      });
    },
    // (Опционально) Если хотите, чтобы они исчезали при скролле вверх, раскомментируйте onLeaveBack
    // onLeaveBack: (batch) => gsap.to(batch, { opacity: 0, y: 50, overwrite: true })
  });

  // --- 3. АНИМАЦИЯ СПИСКА "КОМУ ЦЕ ПОТРІБНО" ---
  gsap.from(".info-list li", {
    scrollTrigger: {
      trigger: ".info-section",
      start: "top 80%",
    },
    x: -30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
  });

  // --- 4. ЛОГИКА ФАЙЛА И МОДАЛКИ (Оставляем как было) ---
  const form = document.getElementById("telegramForm");
  const modal = document.getElementById("successModal");
  const modalCloseBtns = document.querySelectorAll(
    ".modal-close-btn, .modal-action-btn"
  );
  const fileInput = document.getElementById("fileInput");
  const fileLabel = document.querySelector(".custom-file-label");
  const fileLabelText = fileLabel ? fileLabel.querySelector("span") : null;
  const defaultLabelText = "Прикріпити файл";

  if (fileInput && fileLabelText) {
    fileInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        const fileName = this.files[0].name;
        const truncatedName =
          fileName.length > 20 ? fileName.substring(0, 18) + "..." : fileName;
        fileLabelText.textContent = truncatedName;
        fileLabel.classList.add("file-selected");
      } else {
        fileLabelText.textContent = defaultLabelText;
        fileLabel.classList.remove("file-selected");
      }
    });
  }

  function openModal() {
    if (modal) {
      const checkmark = modal.querySelector(".checkmark");
      if (checkmark) {
        checkmark.classList.remove("animate-start");
        void checkmark.offsetWidth;
        checkmark.classList.add("animate-start");
      }
      gsap.to(modal, { autoAlpha: 1, duration: 0.3 });
      gsap.to(".modal-window", {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.2)",
      });
    }
  }

  function closeModal() {
    if (modal) {
      gsap.to(modal, { autoAlpha: 0, duration: 0.3 });
      gsap.to(".modal-window", { scale: 0.9, duration: 0.3 });
    }
  }

  modalCloseBtns.forEach((btn) => btn.addEventListener("click", closeModal));
  if (modal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData();
      formData.append("name", document.getElementById("name").value);
      formData.append("email", document.getElementById("email").value);
      formData.append("site", document.getElementById("site").value);
      formData.append("message", document.getElementById("message").value);
      if (fileInput && fileInput.files[0])
        formData.append("file", fileInput.files[0]);

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = "Отправка...";
      btn.disabled = true;

      // Путь с корня сайта, чтобы работало из папки catalog
      fetch("/send.php", { method: "POST", body: formData })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok) {
            openModal();
            form.reset();
            if (fileLabelText) {
              fileLabelText.textContent = defaultLabelText;
              fileLabel.classList.remove("file-selected");
            }
          } else {
            alert("Помилка відправки.");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Помилка мережі.");
        })
        .finally(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        });
    });
  }
});

// ВАЖНО: Принудительное обновление ScrollTrigger после полной загрузки страницы (картинок и шрифтов)
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
