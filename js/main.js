document.addEventListener("DOMContentLoaded", () => {
  // --- ПРЕМІАЛЬНИЙ ПРЕЛОАДЕР (SPLIT EFFECT) ---
  // --- 1. ЛОГІКА ЗАВАНТАЖЕННЯ (ВХІД НА СТОРІНКУ) ---
  const initApp = () => {
    if (typeof gsap === "undefined") return;

    // Перевіряємо: ми прийшли сюди через клік по посиланню?
    const isInternalTransition =
      sessionStorage.getItem("isInternalTransition") === "true";

    // Одразу очищаємо мітку.
    // Якщо користувач натисне F5 зараз, мітки вже не буде -> покажеться Логотип (як ви і хотіли).
    sessionStorage.removeItem("isInternalTransition");

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove("is-loading");
      },
    });

    // === СЦЕНАРІЙ 1: ПОВНИЙ ВХІД (F5, Нова вкладка, Введення URL) ===
    // Показуємо повну красу з логотипом
    if (!isInternalTransition) {
      // Скидаємо стилі, щоб все було видно
      gsap.set(".pr-panel", { yPercent: 0, opacity: 1 });
      gsap.set(".preloader__wrap", { opacity: 1, scale: 1, display: "flex" });
      gsap.set(".svg-text", { opacity: 1, fill: "#050505", stroke: "#ffffff" });

      tl
        // 1. Малюємо контур
        .to(".svg-text", {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power2.inOut",
        })

        // 2. Заливка білим
        .to(".svg-text", {
          fill: "#ffffff",
          stroke: "#ffffff",
          duration: 0.5,
          ease: "power2.out",
        })

        // 3. Пауза
        .to({}, { duration: 0.2 })

        // 4. Політ крізь лого + Зникнення шторок
        .to(".preloader__wrap", {
          scale: 10,
          opacity: 0,
          duration: 1.0,
          ease: "expo.in",
        })
        .to(
          ".pr-panel",
          {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "<+=0.2"
        ) // Зникають одночасно з польотом

        .set(".preloader", { display: "none" });
    }

    // === СЦЕНАРІЙ 2: ВНУТРІШНІЙ ПЕРЕХІД (Клік по меню) ===
    // Тільки шторки, без лого
    else {
      // Ховаємо логотип, він не потрібен
      gsap.set(".preloader__wrap", { display: "none" });

      // Переконуємось, що шторки закриті (чорні)
      gsap.set(".pr-panel", { opacity: 1, yPercent: 0 });
      gsap.set(".preloader", { display: "flex" }); // Показуємо блок

      // Відкриваємо шторки
      tl.to(".pr-top", { yPercent: -100, duration: 1.0, ease: "expo.inOut" })
        .to(
          ".pr-bot",
          { yPercent: 100, duration: 1.0, ease: "expo.inOut" },
          "<"
        )
        .set(".preloader", { display: "none" });
    }
  };

  // --- 2. ОБРОБКА КЛІКІВ (ВИХІД ЗІ СТОРІНКИ) ---
  const initPageLinks = () => {
    const links = document.querySelectorAll("a");

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        const target = link.getAttribute("target");

        // Ігноруємо якоря, телефони, нові вкладки
        if (
          !href ||
          href.startsWith("#") ||
          target === "_blank" ||
          href.includes("mailto:") ||
          href.includes("tel:")
        ) {
          return;
        }

        e.preventDefault();

        // !!! ВАЖЛИВО: Ставимо мітку "Це внутрішній перехід" !!!
        sessionStorage.setItem("isInternalTransition", "true");

        // 1. Повертаємо прелоадер (тільки шторки)
        const preloader = document.querySelector(".preloader");
        preloader.style.display = "flex";

        gsap.set(".pr-panel", { opacity: 1 }); // Шторки непрозорі
        gsap.set(".preloader__wrap", { display: "none" }); // Лого приховане

        // 2. ЗАКРИВАЄМО ШТОРКИ
        const tl = gsap.timeline({
          onComplete: () => {
            window.location.href = href;
          },
        });

        // Старт: шторки відкриті
        tl.set(".pr-top", { yPercent: -100 })
          .set(".pr-bot", { yPercent: 100 })

          // Анімація закриття
          .to(".pr-top", {
            yPercent: 0,
            duration: 0.7,
            ease: "expo.inOut",
          })
          .to(
            ".pr-bot",
            {
              yPercent: 0,
              duration: 0.7,
              ease: "expo.inOut",
            },
            "<"
          );
      });
    });
  };

  // ЗАПУСК
  initApp();
  initPageLinks();
  // --- SMOOTH SCROLL (LENIS) ---
  const initSmoothScroll = () => {
    const lenis = new Lenis({
      duration: 1.2, // Тривалість скролу (чим більше, тим плавніше)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Функція плавності
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1, // Чутливість миші
      smoothTouch: false, // На мобільних краще залишати нативний скрол
      touchMultiplier: 2,
    });

    // Інтеграція з анімацією кадрів
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Це щоб якоря (посилання в меню) теж працювали плавно через Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        lenis.scrollTo(this.getAttribute("href"));
      });
    });
  };

  initSmoothScroll();
  /* ========================================================================
     1. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
     ======================================================================== */
  const burger = document.querySelector(".burger-btn");
  const navContent = document.querySelector(".nav-content");
  const body = document.body;

  if (burger && navContent) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      navContent.classList.toggle("active");
      // Блокируем скролл страницы при открытом меню
      if (body) body.classList.toggle("lock");
    });
  }
  // 1. Ищем все ссылки внутри меню (включая кнопку "Залишити заявку")
  const menuLinks = document.querySelectorAll(".nav-content a");

  // 2. Проходимся по каждой ссылке
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // 3. Принудительно убираем классы активности (закрываем меню)
      if (burger) burger.classList.remove("active");
      if (navContent) navContent.classList.remove("active");
      if (body) body.classList.remove("lock");
    });
  });

  /* ========================================================================
     2. КНОПКА СКРОЛЛА ВВЕРХ
     ======================================================================== */
  const scrollBtn = document.querySelector(".scroll-up-btn");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /* ========================================================================
     3. THREE.JS (3D Сцена)
     ======================================================================== */
  const container = document.getElementById("contact-3d-scene");
  if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const gyroscopeGroup = new THREE.Group();
    scene.add(gyroscopeGroup);

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

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 25;
    }
    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x8c7eff, 2, 20);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0x404040));

    let mouseX = 0,
      mouseY = 0,
      targetX = 0,
      targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    });

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = false;

    window.addEventListener("resize", () => {
      if (getComputedStyle(container).display === "none") return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      core.rotation.y += 0.005;
      core.rotation.x -= 0.002;
      ring1.rotation.x += 0.01;
      ring1.rotation.y += 0.005;
      ring2.rotation.y += 0.01;
      ring2.rotation.z += 0.002;
      ring3.rotation.x -= 0.005;
      ring3.rotation.z -= 0.01;
      particlesMesh.rotation.y -= 0.0005;

      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;
      gyroscopeGroup.rotation.y += 0.05 * (targetX - gyroscopeGroup.rotation.y);
      gyroscopeGroup.rotation.x += 0.05 * (targetY - gyroscopeGroup.rotation.x);

      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }

  /* ========================================================================
     4. GSAP ANIMATIONS
     ======================================================================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // 1. Skills
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

  // 2. Numbers
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

  // 3. Product
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

  // Mobile Product Observer
  if (window.innerWidth < 769) {
    const productItems = document.querySelectorAll(".product__item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
          else entry.target.classList.remove("active");
        });
      },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    productItems.forEach((item) => observer.observe(item));
  }

  // 4. Leader
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

  // 5. Portfolio
  ScrollTrigger.matchMedia({
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
    all: function () {
      gsap.from(".portfolio__footer", {
        scrollTrigger: {
          trigger: ".portfolio__wrapper",
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

  // 6. Contact
  gsap.from(".contact__item", {
    scrollTrigger: {
      trigger: ".contact",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
    },
    y: 80,
    opacity: 0,
    filter: "blur(15px)",
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out",
    clearProps: "all",
  });

  // Refresh GSAP
  function refresh() {
    ScrollTrigger.refresh();
  }
  window.addEventListener("load", () => {
    refresh();
    setTimeout(refresh, 200);
    setTimeout(refresh, 1000);
  });
  if (document.querySelector(".pwa-hero")) {
    const heroTl = gsap.timeline({ delay: 0.2 }); // Небольшая задержка после прелоадера

    heroTl
      .from(".pwa-hero__text > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        clearProps: "all",
      })
      .from(
        ".pwa-hero__visual",
        {
          x: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          clearProps: "all",
        },
        "-=0.8"
      );
  }

  // 2. Benefits Grid (Карточки)
  const benefitCards = document.querySelectorAll(".benefit-card");
  if (benefitCards.length > 0) {
    gsap.from(benefitCards, {
      scrollTrigger: {
        trigger: ".benefits-grid",
        start: "top 85%", // Анимация начнется, когда верх сетки будет на 85% высоты экрана
        toggleActions: "play none none none",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15, // Задержка между появлением карточек
      ease: "power2.out",
      clearProps: "all",
    });
  }

  // 3. Info Section (Список внизу)
  if (document.querySelector(".info-section")) {
    gsap.from(".info-title", {
      scrollTrigger: {
        trigger: ".info-section",
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.from(".info-list li", {
      scrollTrigger: {
        trigger: ".info-list",
        start: "top 90%",
      },
      x: -20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });
  }
});
