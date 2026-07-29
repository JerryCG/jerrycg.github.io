/**
 * Guo (Jerry) Cheng — site interactions
 * Smooth-section nav highlight, sticky header state, scroll reveal
 */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const yearEl = document.getElementById("year");
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Sticky header border after scroll */
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  /* Active nav based on scroll position */
  const setActiveNav = () => {
    if (!sections.length) return;

    const marker = window.scrollY + window.innerHeight * 0.28;
    let currentId = sections[0].id;

    for (const section of sections) {
      if (section.offsetTop <= marker) {
        currentId = section.id;
      }
    }

    // Near bottom: highlight last section
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.forEach((link) => {
      const match = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", match);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollHeader();
      setActiveNav();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScrollHeader();
  setActiveNav();

  /* Reveal on enter viewport */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
})();
