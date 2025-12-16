document.addEventListener("DOMContentLoaded", () => {
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
});
