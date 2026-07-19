(() => {
  "use strict";
  const cfg = window.WEDDING_CONFIG || {};
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const safe = (value, fallback = "") => String(value ?? fallback).replace(/[<>]/g, "").trim();
  const setAll = (selector, value) => $$(selector).forEach((el) => { el.textContent = value; });
  const couple = cfg.couple || {};
  const params = new URLSearchParams(location.search);
  const guest = safe(params.get("guest") || params.get("to") || params.get("khach") || cfg.defaultGuest, "Quý khách");

  setAll("[data-guest]", guest);
  setAll("[data-bride-first]", couple.brideFirst || "Thu Hằng");
  setAll("[data-bride-full]", couple.brideFull || "Phan Thu Hằng");
  setAll("[data-groom-first]", couple.groomFirst || "Xuân Trường");
  setAll("[data-groom-full]", couple.groomFull || "Đoàn Xuân Trường");
  if ($("#guestName")) $("#guestName").value = guest;

  const toast = $("#toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  // Opening and music
  const opening = $("#opening");
  const audio = $("#weddingMusic");
  const musicToggle = $("#musicToggle");
  let isPlaying = false;

  async function setMusic(shouldPlay) {
    if (!audio || !musicToggle) return;
    try {
      if (shouldPlay) {
        await audio.play();
        isPlaying = true;
        musicToggle.classList.add("is-playing");
        musicToggle.setAttribute("aria-label", "Tắt nhạc");
      } else {
        audio.pause();
        isPlaying = false;
        musicToggle.classList.remove("is-playing");
        musicToggle.setAttribute("aria-label", "Bật nhạc");
      }
    } catch (_) {
      isPlaying = false;
      musicToggle.classList.remove("is-playing");
      showToast("Hãy chạm nút nhạc để phát âm thanh");
    }
  }

  $("#openInvitation")?.addEventListener("click", () => {
    opening?.classList.add("is-open");
    document.body.classList.remove("is-locked");
    setMusic(true);
    setTimeout(() => opening?.remove(), 1300);
  });
  musicToggle?.addEventListener("click", () => setMusic(!isPlaying));
  $("#scrollTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Countdown
  const weddingDate = new Date(cfg.ceremony?.start || "2026-08-02T08:00:00+07:00").getTime();
  function updateCountdown() {
    const diff = Math.max(0, weddingDate - Date.now());
    const values = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      minutes: Math.floor(diff / 60000) % 60,
      seconds: Math.floor(diff / 1000) % 60
    };
    Object.entries(values).forEach(([id, value]) => {
      const el = $("#" + id);
      if (el) el.textContent = String(value).padStart(2, "0");
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Reveal
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: "0px 0px -40px" });
    $$(".reveal").forEach((el, index) => {
      el.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
      observer.observe(el);
    });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  // Parallax
  const parallaxItems = $$('[data-parallax]');
  let ticking = false;
  function updateParallax() {
    const center = innerHeight / 2;
    parallaxItems.forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const speed = Number(el.dataset.parallax || .1);
      const offset = (rect.top + rect.height / 2 - center) * -speed;
      el.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
    });
    ticking = false;
  }
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
  updateParallax();

  // Maps
  $$(".map-link").forEach((link) => {
    const event = cfg[link.dataset.map] || cfg.reception || {};
    const query = event.mapQuery || event.address || "";
    link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  });

  // ICS calendar
  const toIcs = (value) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const escapeIcs = (value) => String(value || "").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
  function downloadCalendar(key) {
    const event = cfg[key];
    if (!event) return;
    const content = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "CALSCALE:GREGORIAN",
      "PRODID:-//Thiep Vu Quy Thu Hang Xuan Truong//VI",
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${key}@thiep-vu-quy.local`,
      `DTSTAMP:${toIcs(new Date())}`,
      `DTSTART:${toIcs(event.start)}`,
      `DTEND:${toIcs(event.end)}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `LOCATION:${escapeIcs(`${event.venue}, ${event.address}`)}`,
      `DESCRIPTION:${escapeIcs(`Trân trọng kính mời ${guest} đến chung vui cùng gia đình Thu Hằng và Xuân Trường.`)}`,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${key}-thu-hang-xuan-truong.ics`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Đã tạo file lịch");
  }
  $$(".add-calendar").forEach((button) => button.addEventListener("click", () => downloadCalendar(button.dataset.event)));

  // Gallery modal
  const imageModal = $("#imageModal");
  const modalImage = $("#modalImage");
  $$(".gallery-item").forEach((button) => button.addEventListener("click", () => {
    if (!imageModal || !modalImage) return;
    modalImage.src = button.dataset.image || button.querySelector("img")?.src || "";
    imageModal.showModal();
  }));
  $("[data-close-image]")?.addEventListener("click", () => imageModal?.close());
  imageModal?.addEventListener("click", (e) => { if (e.target === imageModal) imageModal.close(); });

  // Gift modal
  const giftModal = $("#giftModal");
  const bankCards = $("#bankCards");
  (cfg.banks || []).forEach((bank) => {
    const card = document.createElement("article");
    card.className = "bank-card";
    const label = document.createElement("span"); label.textContent = safe(bank.label);
    const bankName = document.createElement("strong"); bankName.textContent = safe(bank.bank, "Bổ sung sau");
    const owner = document.createElement("p"); owner.textContent = safe(bank.accountName);
    const number = document.createElement("p"); number.className = "account-number"; number.textContent = safe(bank.accountNumber, "Bổ sung sau");
    const copy = document.createElement("button"); copy.className = "copy-account"; copy.type = "button"; copy.textContent = "Sao chép số tài khoản";
    const usable = bank.accountNumber && !/bổ sung/i.test(bank.accountNumber);
    copy.disabled = !usable;
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(bank.accountNumber); showToast("Đã sao chép số tài khoản"); }
      catch (_) { showToast("Không thể sao chép trên trình duyệt này"); }
    });
    card.append(label, bankName, owner, number, copy);
    bankCards?.append(card);
  });
  $("#openGift")?.addEventListener("click", () => giftModal?.showModal());
  $("[data-close-gift]")?.addEventListener("click", () => giftModal?.close());
  giftModal?.addEventListener("click", (e) => { if (e.target === giftModal) giftModal.close(); });

  // RSVP
  const form = $("#rsvpForm");
  const status = $("#formStatus");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.submittedAt = new Date().toISOString();
    data.pageGuest = guest;
    localStorage.setItem("rsvp-thu-hang-xuan-truong", JSON.stringify(data));

    if (cfg.rsvpEndpoint) {
      try {
        const response = await fetch(cfg.rsvpEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("submit failed");
        status.textContent = "Cảm ơn bạn! Xác nhận đã được gửi.";
        form.reset();
        $("#guestName").value = guest;
      } catch (_) {
        status.textContent = "Chưa gửi được. Vui lòng thử lại hoặc liên hệ trực tiếp gia đình.";
      }
    } else {
      status.textContent = "Đã lưu phản hồi trên thiết bị này. Hãy cấu hình rsvpEndpoint để nhận trực tuyến.";
    }
  });

  // Flower rain canvas
  const canvas = $("#petalCanvas");
  const ctx = canvas?.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let flowers = [];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createFlower(initial = false) {
    const size = 6 + Math.random() * 8;
    return {
      x: Math.random() * innerWidth,
      y: initial ? Math.random() * innerHeight : -30,
      size,
      vx: -0.45 + Math.random() * 0.9,
      vy: 0.5 + Math.random() * 0.9,
      swing: 0.4 + Math.random() * 0.8,
      driftSeed: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      spin: -0.03 + Math.random() * 0.06,
      alpha: 0.35 + Math.random() * 0.45,
      petalCount: Math.random() > 0.5 ? 5 : 6,
      petalColor: pick(["#ff7a96", "#f05f7b", "#f7b2c2", "#ffd2dc", "#f4d98d"]),
      centerColor: pick(["#fff4c4", "#ffe28a", "#fff8dd"]),
      shadowColor: "rgba(121,27,56,.18)"
    };
  }

  function drawFlower(flower) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(flower.x, flower.y);
    ctx.rotate(flower.angle);
    ctx.globalAlpha = flower.alpha;
    ctx.shadowColor = flower.shadowColor;
    ctx.shadowBlur = 10;

    for (let i = 0; i < flower.petalCount; i += 1) {
      ctx.save();
      ctx.rotate((Math.PI * 2 / flower.petalCount) * i);
      ctx.fillStyle = flower.petalColor;
      ctx.beginPath();
      ctx.ellipse(0, -flower.size * 0.72, flower.size * 0.42, flower.size * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = flower.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, flower.size * 0.34, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.arc(0, 0, flower.size * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function animateFlowers() {
    if (!ctx || reduced) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    flowers.forEach((flower, i) => {
      flower.x += flower.vx + Math.sin(flower.driftSeed + flower.y * 0.012) * flower.swing;
      flower.y += flower.vy;
      flower.angle += flower.spin;
      if (flower.y > innerHeight + 40 || flower.x < -40 || flower.x > innerWidth + 40) {
        flowers[i] = createFlower();
      }
      drawFlower(flower);
    });
    requestAnimationFrame(animateFlowers);
  }

  if (canvas && ctx && !reduced) {
    resizeCanvas();
    flowers = Array.from({ length: Math.min(28, Math.max(14, Math.floor(innerWidth / 55))) }, () => createFlower(true));
    animateFlowers();
    addEventListener("resize", resizeCanvas);
  }
})();
