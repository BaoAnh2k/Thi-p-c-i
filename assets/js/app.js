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

  // Petals canvas
  const canvas = $("#petalCanvas");
  const ctx = canvas?.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let petals = [];
  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function createPetal(initial = false) {
    return {
      x: Math.random() * innerWidth,
      y: initial ? Math.random() * innerHeight : -20,
      r: 3 + Math.random() * 5,
      vx: -.35 + Math.random() * .7,
      vy: .35 + Math.random() * .7,
      angle: Math.random() * Math.PI,
      spin: -.025 + Math.random() * .05,
      alpha: .22 + Math.random() * .42,
      color: ["#ed5875", "#d83b5c", "#f4b9c5", "#d7aa45"][Math.floor(Math.random() * 4)]
    };
  }
  function drawPetal(p) {
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle); ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color || "#ed5875";
    ctx.beginPath(); ctx.ellipse(0,0,p.r,p.r*1.8,.5,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  function animatePetals() {
    if (!ctx || reduced) return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    petals.forEach((p,i) => {
      p.x += p.vx + Math.sin(p.y*.01)*.18; p.y += p.vy; p.angle += p.spin;
      if (p.y > innerHeight + 30 || p.x < -30 || p.x > innerWidth + 30) petals[i] = createPetal();
      drawPetal(p);
    });
    requestAnimationFrame(animatePetals);
  }
  if (canvas && ctx && !reduced) {
    resizeCanvas();
    petals = Array.from({ length: Math.min(34, Math.max(16, Math.floor(innerWidth/45))) }, () => createPetal(true));
    animatePetals();
    addEventListener("resize", resizeCanvas);
  }
})();
