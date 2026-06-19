/* ===========================================================
   Alex Carter — Portfolio · interactions
   =========================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Theme toggle (persisted) ---------- */
  const themeToggle = $("#themeToggle");
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = stored || (prefersLight ? "light" : "dark");
  if (initial === "light") root.setAttribute("data-theme", "light");

  themeToggle.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  });

  /* ---------- Mobile nav ---------- */
  const burger = $("#navBurger");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  };
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav__link").forEach((l) => l.addEventListener("click", closeMenu));

  /* ---------- Sticky nav + scroll progress ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll + skill bars ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        $$(".skill-bar", entry.target).forEach((b) => b.classList.add("animate"));
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Active nav link via section observer ---------- */
  const links = new Map($$(".nav__link").map((l) => [l.getAttribute("href").slice(1), l]));
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove("active"));
        links.get(entry.target.id)?.classList.add("active");
      });
    },
    { threshold: 0.5 }
  );
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Contact form validation ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address."),
    message: (v) => (v.trim().length >= 3 ? "" : "Message should be at least 3 characters."),
  };

  const setError = (field, msg) => {
    const wrap = field.closest(".field");
    const errEl = $(`.field__error[data-for="${field.name}"]`);
    wrap.classList.toggle("invalid", Boolean(msg));
    if (errEl) errEl.textContent = msg;
  };

  $$("#contactForm [name]").forEach((field) => {
    field.addEventListener("blur", () => setError(field, validators[field.name](field.value)));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("invalid")) {
        setError(field, validators[field.name](field.value));
      }
    });
  });

  // Messages are delivered to this email via FormSubmit (no signup, no key).
  // To receive at a different address, just change the email below.
  // NOTE: the very first submission triggers a one-time confirmation email
  // from FormSubmit — click the link in it once to activate delivery.
  const CONTACT_EMAIL = "sanjaychowdry11@gmail.com";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    $$("#contactForm [name]").forEach((field) => {
      const msg = validators[field.name](field.value);
      setError(field, msg);
      if (msg) valid = false;
    });

    status.className = "form-status";
    if (!valid) {
      status.textContent = "Please fix the errors above.";
      status.classList.add("error");
      return;
    }

    const submitBtn = $("#contactForm button[type='submit']");
    status.textContent = "Sending…";
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(CONTACT_EMAIL), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: $("#name").value.trim(),
          email: $("#email").value.trim(),
          message: $("#message").value.trim(),
          _subject: "New message from your portfolio site",
          _template: "table",
        }),
      });
      const data = await res.json();
      if (data.success === "true" || data.success === true) {
        form.reset();
        status.textContent = "Thanks! Your message has been sent. 🎉";
        status.classList.add("success");
      } else {
        throw new Error(data.message || "Send failed");
      }
    } catch (err) {
      status.textContent =
        "Sorry, something went wrong. Please email " + CONTACT_EMAIL + " directly.";
      status.classList.add("error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
