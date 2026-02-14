
document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const friendNameInput = document.getElementById('friendName');
  const messageText = document.getElementById('messageText');
  const accentColor = document.getElementById('accentColor');
  const cardBgColor = document.getElementById('cardBgColor');
  const bgColor = document.getElementById('bgColor');
  const nameSize = document.getElementById('nameSize');
  const fontSelect = document.getElementById('fontSelect');
  const applyBtn = document.getElementById('applyBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const friendNamePreview = document.getElementById('friendNamePreview');
  const letterPreview = document.getElementById('letterPreview');
  const cardToExport = document.getElementById('cardToExport');
  const heartsLayer = document.getElementById('heartsLayer');

  // Utilidades
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function setRootVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  // Actualiza la vista previa con los valores actuales
  function updatePreview() {
    friendNamePreview.textContent = friendNameInput.value || 'Nana';
    letterPreview.innerHTML = messageText.value
      .split('\n\n')
      .map(p => `<p class="reveal-item">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
      .join('');

    setRootVar('--accent', accentColor.value);
    setRootVar('--card', cardBgColor.value);
    setRootVar('--bg', bgColor.value);
    cardToExport.style.background = `linear-gradient(180deg, ${cardBgColor.value}, ${cardBgColor.value})`;
    friendNamePreview.style.fontSize = nameSize.value;
    cardToExport.style.fontFamily = fontSelect.value;

    // Reiniciar la animación de aparición
    runSimpleReveal();
  }

  // Feedback visual breve para botones
  function flashButton(btn, text, ms = 900) {
    const original = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, ms);
  }

  // Descargar la tarjeta como PNG usando html2canvas
  async function downloadCardAsImage() {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Preparando...';
    const scale = 2;

    try {
      updatePreview();

      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas no está disponible');
      }

      const canvas = await html2canvas(cardToExport, {
        scale,
        backgroundColor: null,
        useCORS: true,
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      const safeName = (friendNameInput.value || 'carta').replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
      link.download = `${safeName}_carta.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al generar la imagen:', err);
      alert('Ocurrió un error al generar la imagen. Intenta nuevamente.');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Descargar como imagen';
    }
  }

  // Generador de corazones flotantes (usa la paleta actual)
  (function heartsGenerator() {
    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    function darken(hex, amount) {
      const c = hex.replace('#', '');
      const r = Math.max(0, Math.min(255, (parseInt(c.substring(0, 2), 16) * (1 - amount)) | 0));
      const g = Math.max(0, Math.min(255, (parseInt(c.substring(2, 4), 16) * (1 - amount)) | 0));
      const b = Math.max(0, Math.min(255, (parseInt(c.substring(4, 6), 16) * (1 - amount)) | 0));
      return `rgb(${r},${g},${b})`;
    }

    function palette() {
      return [
        [accentColor.value, darken(accentColor.value, 0.35)],
        ['#ff6b9a', '#ff9bbd'],
        [accentColor.value, '#ff9bbd']
      ];
    }

    function createHeart() {
      const h = document.createElement('div');
      h.className = 'heart';
      const size = Math.floor(random(12, 36));
      h.style.width = `${size}px`;
      h.style.height = `${size}px`;
      h.style.left = `${Math.floor(random(2, 98))}%`;
      h.style.top = `${Math.floor(random(70, 95))}%`;

      const pal = palette()[Math.floor(random(0, palette().length))];
      h.style.background = `linear-gradient(135deg, ${pal[0]}, ${pal[1]})`;
      h.style.setProperty('--drift', `${Math.floor(random(-20, 20))}vw`);

      const dur = random(6, 14);
      const delay = random(0, 2);
      h.style.animationDuration = `${dur}s`;
      h.style.animationDelay = `${delay}s`;
      h.style.opacity = 0;

      heartsLayer.appendChild(h);

      setTimeout(() => h.remove(), (dur + delay) * 1000 + 500);
    }

    setInterval(() => {
      const count = Math.floor(random(1, 3));
      for (let i = 0; i < count; i++) createHeart();
    }, 700);

    for (let i = 0; i < 8; i++) setTimeout(createHeart, i * 120);
  })();

  // Secuencia simple de revelado sin depender de series.js
  function runSimpleReveal() {
    const items = Array.from(document.querySelectorAll('#letterPreview .reveal-item'));
    if (!items.length) return;

    // Resetear estilos
    items.forEach(it => {
      it.style.opacity = '0';
      it.style.transform = 'translateY(10px) scale(0.98)';
      it.style.transition = 'opacity 480ms cubic-bezier(.2,.8,.2,1), transform 480ms cubic-bezier(.2,.8,.2,1)';
    });

    // Revelar en serie con pequeños estallidos de corazones
    items.forEach((it, i) => {
      const delay = 200 + i * 420;
      setTimeout(() => {
        it.style.opacity = '1';
        it.style.transform = 'translateY(0) scale(1)';

        // pequeño pop visual
        it.animate([
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-4px) scale(1.02)' },
          { transform: 'translateY(0) scale(1)' }
        ], { duration: 220, easing: 'ease-out' });

        // estallido de corazones anclado a la posición del párrafo
        createBurstHeartsAtElement(it, 2);
      }, delay);
    });
  }

  // Crea un pequeño estallido de corazones alrededor de un elemento
  function createBurstHeartsAtElement(el, count = 3) {
    const rect = el.getBoundingClientRect();
    for (let h = 0; h < count; h++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'series-heart';
        const size = Math.floor(Math.random() * 18) + 10;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        heart.style.position = 'fixed';
        heart.style.left = `${rect.left + rect.width * Math.random()}px`;
        heart.style.top = `${rect.top + rect.height * Math.random()}px`;
        heart.style.transform = 'rotate(45deg)';
        heart.style.background = `linear-gradient(135deg, #ff9bbd, ${accentColor.value})`;
        heart.style.borderRadius = '4px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = 9999;
        heart.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
        document.body.appendChild(heart);

        heart.animate([
          { transform: `translateY(0) rotate(45deg) scale(0.6)`, opacity: 0 },
          { transform: `translateY(-40px) translateX(${(Math.random() - 0.5) * 40}px) rotate(45deg) scale(1)`, opacity: 1 },
          { transform: `translateY(-100px) translateX(${(Math.random() - 0.5) * 100}px) rotate(45deg) scale(1.1)`, opacity: 0 }
        ], {
          duration: 1000 + Math.random() * 800,
          easing: 'cubic-bezier(.2,.8,.2,1)'
        });

        setTimeout(() => heart.remove(), 2000 + Math.random() * 800);
      }, h * 120);
    }
  }

  // Eventos
  applyBtn.addEventListener('click', () => {
    updatePreview();
    flashButton(applyBtn, 'Aplicado', 700);
  });

  downloadBtn.addEventListener('click', () => {
    updatePreview();
    downloadCardAsImage();
  });

  // Actualizaciones en tiempo real para campos clave
  friendNameInput.addEventListener('input', () => friendNamePreview.textContent = friendNameInput.value || 'Nana');
  messageText.addEventListener('input', () => {
    letterPreview.innerHTML = messageText.value
      .split('\n\n')
      .map(p => `<p class="reveal-item">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
      .join('');
    runSimpleReveal();
  });

  accentColor.addEventListener('input', () => setRootVar('--accent', accentColor.value));
  bgColor.addEventListener('input', () => setRootVar('--bg', bgColor.value));
  cardBgColor.addEventListener('input', () => cardToExport.style.background = `linear-gradient(180deg, ${cardBgColor.value}, ${cardBgColor.value})`);
  nameSize.addEventListener('change', () => friendNamePreview.style.fontSize = nameSize.value);
  fontSelect.addEventListener('change', () => cardToExport.style.fontFamily = fontSelect.value);

  // Inicializar vista previa y animaciones al cargar
  updatePreview();
  setTimeout(() => runSimpleReveal(), 420);
});
