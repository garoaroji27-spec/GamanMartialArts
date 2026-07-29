document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuOverlay = document.querySelector(".menu-overlay");
  const menuLinks = document.querySelectorAll(".mobile-menu a");
  const carousel = document.getElementById("carouselWrapper");
  const buyButtons = document.querySelectorAll(".buy-btn");
  const promoTrack = document.querySelector(".promo-track");

  function cerrarMenu() {
    if (!menuToggle || !mobileMenu || !menuOverlay) return;
    menuToggle.classList.remove("active");
    mobileMenu.classList.remove("is-open");
    menuOverlay.classList.remove("is-open");
  }

  if (menuToggle && mobileMenu && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      mobileMenu.classList.toggle("is-open");
      menuOverlay.classList.toggle("is-open");
    });

    menuOverlay.addEventListener("click", cerrarMenu);
  }

  menuLinks.forEach(link => link.addEventListener("click", cerrarMenu));

  buyButtons.forEach(button => {
    button.addEventListener("click", () => {
      alert("La compra se realiza directamente en el gimnasio GAMAN.");
    });
  });


  const appDownloadLinks = document.querySelectorAll("[data-app-download]");
  const appleAppUrl = "https://apps.apple.com/es/app/maat/id1471462737";
  const androidAppUrl = "https://play.google.com/store/apps/details?id=com.arya.checkin";

  appDownloadLinks.forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const ua = navigator.userAgent || navigator.vendor || window.opera || "";
      const isAndroid = /android/i.test(ua);
      const targetUrl = isAndroid ? androidAppUrl : appleAppUrl;
      window.open(targetUrl, "_blank", "noopener");
    });
  });

  if (promoTrack) {
    const texto = promoTrack.textContent.trim() || "HIERRO AFILA HIERRO";
    promoTrack.innerHTML = "";
    for (let i = 0; i < 14; i++) {
      const span = document.createElement("span");
      span.textContent = texto;
      promoTrack.appendChild(span);
    }
  }

  if (carousel) {
    updateActiveSlide();
    let carouselFrame = null;
    carousel.addEventListener("scroll", () => {
      if (carouselFrame) cancelAnimationFrame(carouselFrame);
      carouselFrame = requestAnimationFrame(() => {
        updateActiveSlide();
        carouselFrame = null;
      });
    });
  }

  const revealItems = document.querySelectorAll(".category-title, .product-card, .footer-brand, .footer-column");
  revealItems.forEach(item => item.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach(item => observer.observe(item));


  const productModal = document.getElementById("productModal") || document.getElementById("combatModal");
  const productModalImage = document.getElementById("productModalImage") || document.getElementById("combatModalImage");
  const productModalTitle = document.getElementById("productModalTitle") || document.getElementById("combatModalTitle");
  const productModalClose = document.querySelector(".product-modal-close, .combat-modal-close");
  const productImageButtons = document.querySelectorAll(".product-image-btn, .combat-image-btn");

  function closeProductModal() {
    if (!productModal) return;
    modalRequestId++;
    productModal.classList.remove("is-open");
    productModal.setAttribute("aria-hidden", "true");
    if (productModalImage) productModalImage.classList.remove("is-ready");
    document.body.style.overflow = "";
  }

  // Precarga las imágenes ampliadas para evitar el parpadeo al abrirlas.
  const modalImageCache = new Map();

  productImageButtons.forEach(button => {
    const fullImage = button.dataset.full;
    if (!fullImage || modalImageCache.has(fullImage)) return;

    const preloadImage = new Image();
    preloadImage.decoding = "async";
    preloadImage.src = fullImage;
    modalImageCache.set(fullImage, preloadImage);
  });

  let modalRequestId = 0;

  productImageButtons.forEach(button => {
    button.addEventListener("click", async () => {
      if (!productModal || !productModalImage || !productModalTitle) return;

      const fullImage = button.dataset.full;
      const title = button.dataset.title || "Producto GAMAN";
      if (!fullImage) return;

      const requestId = ++modalRequestId;
      const loadedImage = modalImageCache.get(fullImage) || new Image();
      loadedImage.decoding = "async";

      if (!loadedImage.src) {
        loadedImage.src = fullImage;
        modalImageCache.set(fullImage, loadedImage);
      }

      try {
        if (!loadedImage.complete || loadedImage.naturalWidth === 0) {
          await new Promise((resolve, reject) => {
            loadedImage.addEventListener("load", resolve, { once: true });
            loadedImage.addEventListener("error", reject, { once: true });
          });
        }

        if (typeof loadedImage.decode === "function") {
          await loadedImage.decode().catch(() => {});
        }
      } catch (error) {
        return;
      }

      if (requestId !== modalRequestId) return;

      productModalImage.classList.remove("is-ready");
      productModalImage.src = fullImage;
      productModalImage.alt = title;
      productModalTitle.textContent = title;

      requestAnimationFrame(() => {
        productModalImage.classList.add("is-ready");
        productModal.classList.add("is-open");
        productModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });
  });

  if (productModalClose) {
    productModalClose.addEventListener("click", closeProductModal);
  }

  if (productModal) {
    productModal.addEventListener("click", (event) => {
      if (event.target === productModal) closeProductModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProductModal();
  });

});

function updateActiveSlide() {
  const carousel = document.getElementById("carouselWrapper");
  const slides = document.querySelectorAll(".hero-slide");
  if (!carousel || slides.length === 0) return;

  const center = carousel.scrollLeft + carousel.offsetWidth / 2;

  slides.forEach(slide => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(center - slideCenter);
    slide.classList.toggle("active", distance < slide.offsetWidth / 2);
  });
}

function moveSlide(direction) {
  const carousel = document.getElementById("carouselWrapper");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  if (!slides.length) return;

  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let currentIndex = 0;
  let minDistance = Infinity;

  slides.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(center - slideCenter);
    if (distance < minDistance) {
      minDistance = distance;
      currentIndex = index;
    }
  });

  const targetIndex = Math.max(0, Math.min(slides.length - 1, currentIndex + direction));
  const target = slides[targetIndex];
  const left = target.offsetLeft - (carousel.clientWidth - target.offsetWidth) / 2;

  carousel.scrollTo({ left, behavior: "smooth" });
}
