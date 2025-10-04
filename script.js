function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

  function openModal(id) {
    document.getElementById(id).style.display = 'block';
  }

  function closeModal(id) {
    document.getElementById(id).style.display = 'none';
  }

  // Close on outside click
  window.onclick = function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  };


  // ===== Header graph background (nodes & edges) =====
(function() {
  const canvas = document.getElementById('bg-graph');
  const header = document.querySelector('header');
  if (!canvas || !header) return;
  const ctx = canvas.getContext('2d');

  // اندازه بوم = اندازه واقعی هدر
  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = header.clientWidth;
    const h = header.clientHeight;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bounds.w = w; bounds.h = h;
  }

  const bounds = { w: 0, h: 0 };
  resize();
  window.addEventListener('resize', resize);

  // تولید نودها (تراکم بیشتر سمت راست)
  const TOTAL = 60;                // تعداد کل
  const RIGHT_BIAS_RATIO = 0.65;   // 65% نودها سمت راست
  const SPEED = 0.35;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnNodes() {
    nodes.length = 0;
    const rightCount = Math.floor(TOTAL * RIGHT_BIAS_RATIO);
    const leftCount  = TOTAL - rightCount;

    // سمت راست (x از نیمهٔ دوم)
    for (let i = 0; i < rightCount; i++) {
      nodes.push({
        x: rand(bounds.w * 0.55, bounds.w),
        y: rand(0, bounds.h),
        vx: rand(-SPEED, SPEED),
        vy: rand(-SPEED, SPEED)
      });
    }
    // سمت چپ/میانی
    for (let i = 0; i < leftCount; i++) {
      nodes.push({
        x: rand(0, bounds.w * 0.6),
        y: rand(0, bounds.h),
        vx: rand(-SPEED, SPEED),
        vy: rand(-SPEED, SPEED)
      });
    }
  }

  const nodes = [];
  spawnNodes();
  window.addEventListener('resize', spawnNodes);

  // پاک‌کردن محل عکس
  function clearAroundPhoto() {
    const img = document.querySelector('.header-pic');
    if (!img) return;
    const imgRect = img.getBoundingClientRect();
    const canRect = canvas.getBoundingClientRect();
    const x = imgRect.left - canRect.left;
    const y = imgRect.top  - canRect.top;
    const pad = 10; // کمی حاشیه
    ctx.clearRect(x - pad, y - pad, imgRect.width + pad*2, imgRect.height + pad*2);
  }

  function step() {
    ctx.clearRect(0, 0, bounds.w, bounds.h);

    // رسم یال‌ها
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          ctx.globalAlpha = Math.max(0, 1 - dist / 110) * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // رسم نودها
    ctx.fillStyle = '#fff';
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > bounds.w) n.vx *= -1;
      if (n.y < 0 || n.y > bounds.h) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // عدم نمایش روی عکس
    clearAroundPhoto();

    requestAnimationFrame(step);
  }
  step();
})();
