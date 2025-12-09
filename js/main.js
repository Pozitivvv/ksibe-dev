document.addEventListener("DOMContentLoaded", () => {
  const scrollBtn = document.querySelector(".scroll-up-btn");

  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Это и делает прокрутку плавной
      });
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("langToggle");
  const menu = document.getElementById("langMenu");
  const currentLangText = toggleBtn.querySelector(".current-lang-text");

  // 1. Открытие/Закрытие меню
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Чтобы клик не ушел на document
    menu.classList.toggle("show");
    toggleBtn.classList.toggle("active");
  });

  // 2. Закрытие при клике в любом месте страницы
  document.addEventListener("click", (e) => {
    if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("show");
      toggleBtn.classList.remove("active");
    }
  });
});

// 3. Функция выбора языка (обновите вашу функцию loadLang или используйте эту обертку)
function selectLang(lang) {
  const toggleBtn = document.getElementById("langToggle");
  const menu = document.getElementById("langMenu");
  const currentLangText = toggleBtn.querySelector(".current-lang-text");

  // Здесь вызывайте вашу логику смены языка
  // loadLang(lang);
  console.log("Language changed to:", lang);

  // Визуальное обновление
  currentLangText.textContent = lang.toUpperCase();

  // Закрываем меню
  menu.classList.remove("show");
  toggleBtn.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("contact-3d-scene");
  if (!container) return;

  // === СЦЕНА ===
  const scene = new THREE.Scene();

  // Камера
  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 14);

  // Рендерер
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // === ОБ'ЄКТИ ===
  const gyroscopeGroup = new THREE.Group();
  scene.add(gyroscopeGroup);

  // Матеріали
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x595aad,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });

  const coreGeo = new THREE.IcosahedronGeometry(2, 2);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x2e2d5f,
    emissive: 0x111122,
    shininess: 100,
    flatShading: true,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  gyroscopeGroup.add(core);

  // Кільця
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(3.5, 0.05, 16, 100),
    ringMaterial
  );
  gyroscopeGroup.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(5, 0.05, 16, 100),
    ringMaterial
  );
  gyroscopeGroup.add(ring2);

  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(6.5, 0.05, 16, 100),
    ringMaterial
  );
  gyroscopeGroup.add(ring3);

  // Частинки
  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 400;
  const posArray = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 25;
  }
  particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
  const particlesMat = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
  });
  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particlesMesh); // Частинки додаємо окремо від групи, щоб вони не нахилялися

  // === ОСВІТЛЕННЯ ===
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0x8c7eff, 2, 20);
  pointLight.position.set(-5, -5, 5);
  scene.add(pointLight);

  scene.add(new THREE.AmbientLight(0x404040));

  // === 🖱️ ЛОГІКА МИШІ (MOUSE TRACKING) ===
  let mouseX = 0;
  let mouseY = 0;

  // Цільові координати для плавності
  let targetX = 0;
  let targetY = 0;

  // Центр вікна
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener("mousemove", (event) => {
    // Обчислюємо позицію миші відносно центру екрана
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  });

  // === КЕРУВАННЯ ===
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  // 🔥 Вимикаємо авто-обертання камери, щоб вона не заважала мишці
  controls.autoRotate = false;

  // === АДАПТИВНІСТЬ ===
  window.addEventListener("resize", () => {
    if (getComputedStyle(container).display === "none") return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // === АНІМАЦІЯ ===
  function animate() {
    requestAnimationFrame(animate);

    // 1. Внутрішня механіка (об'єкт живе своїм життям)
    core.rotation.y += 0.005;
    core.rotation.x -= 0.002;
    ring1.rotation.x += 0.01;
    ring1.rotation.y += 0.005;
    ring2.rotation.y += 0.01;
    ring2.rotation.z += 0.002;
    ring3.rotation.x -= 0.005;
    ring3.rotation.z -= 0.01;
    particlesMesh.rotation.y -= 0.0005;

    // 2. 🔥 Слідкування за мишею (Плавний нахил)
    // Ми використовуємо формулу інтерполяції, щоб об'єкт не дьоргався, а плив
    // 0.001 - чутливість (чим менше, тим менший кут нахилу)
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    // Група нахиляється за курсором
    // 0.05 - швидкість реакції (плавність)
    gyroscopeGroup.rotation.y += 0.05 * (targetX - gyroscopeGroup.rotation.y);
    gyroscopeGroup.rotation.x += 0.05 * (targetY - gyroscopeGroup.rotation.x);

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
});
document.addEventListener("DOMContentLoaded", () => {
  // === НАСТРОЙКА ===
  gsap.registerPlugin(ScrollTrigger);

  // 🔥 ФИКС ДЛЯ МОБИЛЬНЫХ: Игнорируем скачки адресной строки
  ScrollTrigger.config({ ignoreMobileResize: true });

  // ... (Ваши секции SKILLS, NUMBERS, PRODUCT, LEADER без изменений) ...
  // (Я их пропущу для краткости, они у вас правильные)

  // ============================================
  // 1. СЕКЦИЯ SKILLS
  // ============================================
  gsap.from(".skills h2", {
    scrollTrigger: { trigger: ".skills", start: "top 80%" },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    clearProps: "all",
  });

  gsap.from(".skills__item", {
    scrollTrigger: { trigger: ".skills__wrapper", start: "top 85%" },
    scale: 0.8,
    filter: "blur(20px)",
    opacity: 0,
    duration: 1.0,
    stagger: 0.15,
    ease: "power2.out",
    clearProps: "all",
  });

  // ============================================
  // 2. СЕКЦИЯ NUMBERS
  // ============================================
  const numbers = document.querySelectorAll(".numbers__title");
  numbers.forEach((num) => {
    let rawVal = num.getAttribute("data-num");
    if (!rawVal) rawVal = num.innerText.trim();
    const match = rawVal.toString().match(/\d+/);

    if (match) {
      const endValue = parseInt(match[0], 10);
      const prefix = num.getAttribute("data-prefix") || "";
      const suffix = num.getAttribute("data-suffix") || "%";
      let counter = { val: 0 };

      gsap.to(counter, {
        val: endValue,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".numbers",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        onUpdate: () =>
          (num.innerText = prefix + Math.ceil(counter.val) + suffix),
      });
    }
  });

  gsap.from(".numbers__item", {
    scrollTrigger: { trigger: ".numbers", start: "top 85%" },
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "back.out(1.7)",
  });

  // ============================================
  // 3. СЕКЦИЯ PRODUCT
  // ============================================
  gsap.from(".product h2", {
    scrollTrigger: { trigger: ".product", start: "top 80%" },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    clearProps: "all",
  });

  gsap.from(".product__item", {
    scrollTrigger: { trigger: ".product__wrapper", start: "top 80%" },
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power2.out",
    clearProps: "all",
  });

  gsap.from(".product .container > a:last-child", {
    scrollTrigger: { trigger: ".product__wrapper", start: "bottom 90%" },
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.4,
    ease: "power3.out",
    clearProps: "all",
  });

  if (window.innerWidth < 769) {
    const productItems = document.querySelectorAll(".product__item");
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("active");
        else entry.target.classList.remove("active");
      });
    }, observerOptions);
    productItems.forEach((item) => observer.observe(item));
  }

  // ============================================
  // 4. СЕКЦИЯ LEADER
  // ============================================
  gsap.from(".leader h2", {
    scrollTrigger: {
      trigger: ".leader",
      start: "top 80%",
      end: "top 50%",
      scrub: 1,
    },
    y: 50,
    opacity: 0,
    ease: "none",
  });

  const leaderItems = document.querySelectorAll(".leader__item");
  leaderItems.forEach((item, index) => {
    item.style.setProperty("--line-progress", 0);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top 75%",
        end: "center 45%",
        scrub: 1,
      },
    });
    tl.fromTo(
      item,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );

    if (index !== leaderItems.length - 1) {
      tl.fromTo(
        item,
        { "--line-progress": 0 },
        { "--line-progress": 1, duration: 1.5, ease: "none" },
        ">-0.2"
      );
    }
  });

  // ============================================
  // 5. СЕКЦИЯ PORTFOLIO (ФИКС)
  // ============================================
  ScrollTrigger.matchMedia({
    // --- DESKTOP (ПК) ---
    "(min-width: 769px)": function () {
      gsap.to(".portfolio__title", {
        scrollTrigger: {
          trigger: ".portfolio",
          start: "top 85%",
          end: "top 50%",
          scrub: 1,
        },
        y: 0,
        opacity: 1,
        autoAlpha: 1,
        ease: "none",
      });

      const portItems = gsap.utils.toArray(".portfolio__item");
      portItems.forEach((item, i) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: ".portfolio__wrapper",
            start: "top 85%",
            end: "bottom 70%",
            scrub: 1.2,
          },
          y: 150 + i * 40,
          opacity: 0,
          scale: 0.9,
          ease: "none",
        });
      });
    },

    // --- MOBILE (ТЕЛЕФОН) ---
    "(max-width: 768px)": function () {
      gsap.to(".portfolio__title", {
        scrollTrigger: {
          trigger: ".portfolio",
          start: "top 90%",
          end: "top 70%",
          scrub: 1,
        },
        y: 0,
        opacity: 1,
        autoAlpha: 1,
      });

      gsap.from(".portfolio__item", {
        scrollTrigger: {
          trigger: ".portfolio__wrapper",
          start: "top 85%",
          end: "bottom 85%",
          scrub: 1,
        },
        y: 60,
        opacity: 0,
        stagger: 0.2,
      });
    },

    // --- ОБЩЕЕ (Кнопка внизу) ---
    all: function () {
      // 🔥 ВАЖНО: Анимируем кнопку от положения "y: 50" до "y: 0"
      gsap.from(".portfolio__footer", {
        scrollTrigger: {
          trigger: ".portfolio__wrapper", // Триггер - конец списка карточек
          start: "bottom 100%",
          end: "bottom 85%",
          scrub: 1,
        },
        y: 50,
        opacity: 0,
        scale: 0.8,
      });
    },
  });
  // ============================================
  // 6. СЕКЦИЯ CONTACT (НОВОЕ 🔥)
  // ============================================

  // Анимация появления блоков (Текст слева и Форма справа)
  gsap.from(".contact__item", {
    scrollTrigger: {
      trigger: ".contact",
      start: "top 80%", // Починаємо, коли верх секції на 80% екрану
      end: "bottom 20%",
      // play: грати при скролі вниз
      // reverse: плавно ховати при скролі вгору
      toggleActions: "play none none reverse",
    },
    y: 80, // Їдуть знизу (довший шлях для плавності)
    opacity: 0, // З прозорості
    filter: "blur(15px)", // 🔥 ЕФЕКТ: З'являються з розмиття
    duration: 1.5, // 🔥 Повільніша анімація (було 1)
    stagger: 0.2, // Затримка між лівою і правою частиною
    ease: "power4.out", // Дуже м'яке гальмування
    clearProps: "all", // Очистити стилі після завершення
  });
  // ============================================
  // 🔥 ФИНАЛЬНЫЙ ФИКС ПОЗИЦИЙ (Refresh)
  // ============================================
  // Это заставит GSAP пересчитать высоту после загрузки всех картинок
  function refresh() {
    ScrollTrigger.refresh();
  }

  window.addEventListener("load", () => {
    refresh();
    setTimeout(refresh, 200); // Для быстрых мобилок
    setTimeout(refresh, 1000); // Для медленных (подстраховка)
  });
});
