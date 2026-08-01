/**
 * Guo (Jerry) Cheng — site interactions
 * Theme (system + toggle), nav highlight, sticky header, scroll reveal
 */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const yearEl = document.getElementById("year");
  const themeToggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  const isDataPage = document.body.classList.contains("page-data");
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  // Year may already be set by i18n.js; keep in sync if the node exists
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Theme: system default + manual override ---------- */
  const THEME_KEY = "theme";
  const mediaDark = window.matchMedia("(prefers-color-scheme: dark)");

  const systemTheme = () => (mediaDark.matches ? "dark" : "light");

  const getStoredTheme = () => {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  };

  const resolveTheme = () => getStoredTheme() || systemTheme();

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    if (themeToggle) {
      const next = theme === "dark" ? "light" : "dark";
      themeToggle.setAttribute("aria-label", `Switch to ${next} theme`);
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.title = `Theme: ${theme} (click for ${next})`;
    }
  };

  applyTheme(resolveTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = resolveTheme() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* private mode / blocked storage */
      }
      applyTheme(next);
    });
  }

  const onSystemThemeChange = () => {
    // Only follow OS when the visitor has not set an explicit preference
    if (getStoredTheme() === null) {
      applyTheme(systemTheme());
    }
  };

  if (typeof mediaDark.addEventListener === "function") {
    mediaDark.addEventListener("change", onSystemThemeChange);
  } else if (typeof mediaDark.addListener === "function") {
    mediaDark.addListener(onSystemThemeChange);
  }

  /* Sticky header border after scroll */
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  /* Active nav based on scroll position (home page only) */
  const setActiveNav = () => {
    if (isDataPage || !sections.length) return;

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

  /* ---------- Abstract drawers ---------- */
  document.querySelectorAll(".abstract-toggle").forEach((btn) => {
    const panelId = btn.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      const nextOpen = !open;

      btn.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      panel.classList.toggle("is-open", nextOpen);
      panel.setAttribute("aria-hidden", nextOpen ? "false" : "true");
    });
  });
})();
