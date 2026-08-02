/** Load an image from a data-URL */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Wrap text into lines fitting within maxWidth */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Draw a single text element onto the canvas using the element's config */
function drawTextElement(ctx, W, H, el, value) {
  if (!el.enabled || !value) return;

  const x = (el.x / 100) * W;
  const y = (el.y / 100) * H;

  const weight = el.bold   ? 'bold'   : 'normal';
  const style  = el.italic ? 'italic' : 'normal';
  const font   = `${style} ${weight} ${el.fontSize}px '${el.fontFamily}', sans-serif`;

  ctx.save();
  ctx.textAlign    = el.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = el.color || '#000000';
  ctx.font = font;

  // Word-wrap for longer text with generous max width
  const maxW = W * 0.75;
  const lineH = el.fontSize * 1.35;
  const lines = wrapText(ctx, value, maxW);
  const totalH = lines.length * lineH;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y - totalH / 2 + lineH * i + lineH / 2);
  });

  ctx.restore();
}

/** Draw subtle circuit-board watermark (built-in design only) */
function drawCircuitWatermark(ctx, W, H, color = '#8B6914') {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.2;
  const leftPaths = [
    [[80,140],[140,140],[140,180],[200,180]],
    [[80,220],[130,220],[130,260],[170,260],[170,310]],
    [[80,350],[160,350],[160,400]],
    [[80,450],[120,450],[120,490],[180,490],[180,540]],
    [[120,580],[120,620],[180,620]],
    [[40,200],[40,250],[90,250]],
    [[40,400],[90,400],[90,450]],
  ];
  const rightPaths = leftPaths.map(p => p.map(([x,y]) => [W-x, y]));
  [...leftPaths, ...rightPaths].forEach(path => {
    for (let i = 0; i < path.length - 1; i++) {
      ctx.beginPath(); ctx.moveTo(path[i][0], path[i][1]); ctx.lineTo(path[i+1][0], path[i+1][1]); ctx.stroke();
      ctx.beginPath(); ctx.arc(path[i+1][0], path[i+1][1], 3.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(path[0][0], path[0][1], 3.5, 0, Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

/** Draw the built-in Inker Robotics styled background */
async function drawBuiltInBackground(ctx, W, H, cfg) {
  const { primaryColor = '#1B3264', accentColor = '#F47B20', bgColor = '#CECCBF', logoDataUrl = null } = cfg;

  ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H);
  drawCircuitWatermark(ctx, W, H, accentColor);

  const BW = 16;
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, W, BW); ctx.fillRect(0, H-BW, W, BW);
  ctx.fillRect(0, 0, BW, H); ctx.fillRect(W-BW, 0, BW, H);

  const CORNER = 80;
  ctx.fillStyle = accentColor;
  [[0,0,CORNER,0,0,CORNER],[W,0,W-CORNER,0,W,CORNER],[0,H,CORNER,H,0,H-CORNER],[W,H,W-CORNER,H,W,H-CORNER]].forEach(([x1,y1,x2,y2,x3,y3]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.closePath(); ctx.fill();
  });

  const IB = 28;
  ctx.strokeStyle = primaryColor; ctx.lineWidth = 1.5;
  ctx.strokeRect(IB, IB, W-IB*2, H-IB*2);

  const cx = W/2;
  if (logoDataUrl) {
    try {
      const logo = await loadImage(logoDataUrl);
      const lh = 48, lw = Math.min(180, lh*(logo.naturalWidth/logo.naturalHeight));
      ctx.drawImage(logo, cx-lw/2, 42, lw, lh);
    } catch(_){}
  }
}

/** Draw full built-in text content (when no custom template is used) */
async function drawBuiltInContent(ctx, W, H, cfg) {
  const { primaryColor = '#1B3264', signatureDataUrl = null } = cfg;
  const IB = 28, cx = W/2, BODY_MAX = W*0.72;

  // Title
  const certTitle = cfg.certTitle || 'Certificate';
  ctx.save();
  ctx.font = `bold italic 50px 'Dancing Script','Great Vibes',cursive`;
  ctx.fillStyle = primaryColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 2;
  ctx.fillText(certTitle, cx, 100);
  ctx.restore();
  ctx.strokeStyle = primaryColor; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(cx-W*0.27, 162); ctx.lineTo(cx+W*0.27, 162); ctx.stroke();

  let y = 180;
  function ctext(text, font, color, maxW) {
    ctx.save(); ctx.font=font; ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='top';
    if (maxW) {
      const lines = wrapText(ctx, text, maxW);
      lines.forEach((l,i) => ctx.fillText(l, cx, y+i*(parseInt(font)*1.4)));
      ctx.restore();
      return lines.length*(parseInt(font)*1.4);
    }
    ctx.fillText(text, cx, y); ctx.restore();
    return parseInt(font)*1.4;
  }

  ctx.save(); ctx.font='18px Inter,sans-serif'; ctx.fillStyle='#333'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('This is to certify that', cx, y); ctx.restore(); y += 30;

  if (cfg.studentName) {
    ctx.save(); ctx.font='bold 38px Inter,sans-serif'; ctx.fillStyle=primaryColor; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.shadowColor='rgba(0,0,0,0.08)'; ctx.shadowBlur=2;
    const nl = wrapText(ctx, cfg.studentName, BODY_MAX);
    nl.forEach((l,i) => ctx.fillText(l, cx, y+i*46)); ctx.restore(); y += nl.length*46+12;
  }
  if (cfg.department) {
    ctx.save(); ctx.font='17px Inter,sans-serif'; ctx.fillStyle='#444'; ctx.textAlign='center'; ctx.textBaseline='top';
    const dl = wrapText(ctx, `from ${cfg.department}`, BODY_MAX);
    dl.forEach((l,i) => ctx.fillText(l, cx, y+i*24)); ctx.restore(); y += dl.length*24+2;
  }
  if (cfg.college) {
    ctx.save(); ctx.font='bold 18px Inter,sans-serif'; ctx.fillStyle='#333'; ctx.textAlign='center'; ctx.textBaseline='top';
    const cl = wrapText(ctx, cfg.college, BODY_MAX);
    cl.forEach((l,i) => ctx.fillText(l, cx, y+i*26)); ctx.restore(); y += cl.length*26+4;
  }
  ctx.save(); ctx.font='17px Inter,sans-serif'; ctx.fillStyle='#444'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillText('has successfully completed the', cx, y); ctx.restore(); y += 28;

  if (cfg.courseName) {
    ctx.save(); ctx.font='bold 28px Inter,sans-serif'; ctx.fillStyle=primaryColor; ctx.textAlign='center'; ctx.textBaseline='top';
    const crl = wrapText(ctx, cfg.courseName, BODY_MAX);
    crl.forEach((l,i) => ctx.fillText(l, cx, y+i*36)); ctx.restore(); y += crl.length*36+10;
  }
  if (cfg.description) {
    ctx.save(); ctx.font='16px Inter,sans-serif'; ctx.fillStyle='#444'; ctx.textAlign='center'; ctx.textBaseline='top';
    const dl2 = wrapText(ctx, cfg.description, BODY_MAX);
    dl2.forEach((l,i) => ctx.fillText(l, cx, y+i*22)); ctx.restore(); y += dl2.length*22+6;
  }
  if (cfg.companyName) {
    ctx.save(); ctx.font='bold 18px Inter,sans-serif'; ctx.fillStyle='#333'; ctx.textAlign='center'; ctx.textBaseline='top';
    const cn = wrapText(ctx, `at ${cfg.companyName}`, BODY_MAX);
    cn.forEach((l,i) => ctx.fillText(l, cx, y+i*26)); ctx.restore(); y += cn.length*26+6;
  }
  if (cfg.registrationId) {
    ctx.save(); ctx.font='15px Inter,sans-serif'; ctx.fillStyle='#444'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(`Registration ID: ${cfg.registrationId}`, cx, y); ctx.restore(); y += 24;
  }

  // Bottom rule
  const BOTTOM_RULE_Y = H-160;
  ctx.strokeStyle=primaryColor; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.moveTo(IB+12,BOTTOM_RULE_Y); ctx.lineTo(W-IB-12,BOTTOM_RULE_Y); ctx.stroke();

  const SIG_TOP = BOTTOM_RULE_Y+8, SIG_H = 55, SIG_LINE = BOTTOM_RULE_Y+8+SIG_H+4;
  if (signatureDataUrl) {
    try {
      const sig = await loadImage(signatureDataUrl);
      const sw = Math.min(160, SIG_H*(sig.naturalWidth/sig.naturalHeight));
      ctx.drawImage(sig, cx-sw/2, SIG_TOP, sw, SIG_H);
    } catch(_){}
  }
  ctx.strokeStyle=primaryColor; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx-75, SIG_LINE); ctx.lineTo(cx+75, SIG_LINE); ctx.stroke();
  ctx.save(); ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.font='bold 15px Inter,sans-serif'; ctx.fillStyle=primaryColor; ctx.fillText(cfg.ceoName||'', cx, SIG_LINE+7);
  ctx.font='13px Inter,sans-serif'; ctx.fillStyle='#666'; ctx.fillText(cfg.ceoTitle||'', cx, SIG_LINE+26);
  ctx.restore();

  const BLY = BOTTOM_RULE_Y+20;
  ctx.save(); ctx.textAlign='left'; ctx.textBaseline='top'; ctx.font='bold 14px Inter,sans-serif'; ctx.fillStyle=primaryColor;
  const dlw = ctx.measureText('Date of Issue: ').width;
  ctx.fillText('Date of Issue: ', IB+24, BLY); ctx.font='14px Inter,sans-serif'; ctx.fillText(cfg.dateOfIssue||'', IB+24+dlw, BLY); ctx.restore();
  ctx.save(); ctx.textAlign='right'; ctx.textBaseline='top'; ctx.font='bold 14px Inter,sans-serif'; ctx.fillStyle=primaryColor;
  const plw = ctx.measureText('Place: ').width; const pvw = ctx.measureText(cfg.place||'').width;
  ctx.fillText('Place: ', W-IB-24-pvw, BLY); ctx.font='14px Inter,sans-serif'; ctx.fillText(cfg.place||'', W-IB-24, BLY); ctx.restore();
}

/**
 * Main export: generates one certificate canvas.
 *
 * ─ Template mode ─────────────────────────────────────────────────────────────
 *   When cfg.templateDataUrl is set, the uploaded image is drawn as background.
 *   Each text field is then overlaid using the position/font/size settings in
 *   cfg.textElements (array of { id, x%, y%, fontSize, fontFamily, bold, italic,
 *   color, align, enabled }).
 *   Value mapping: textElement.id → cfg data field (studentName, courseName, etc.)
 *
 * ─ Built-in design mode ──────────────────────────────────────────────────────
 *   When no template is uploaded, the full Inker Robotics branded design is drawn.
 */
export async function generateCertificate(cfg) {
  await document.fonts.ready;

  const W = 1120, H = 793;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (cfg.templateDataUrl) {
    // ── Template mode: draw uploaded background ────────────────────────────────
    try {
      const img = await loadImage(cfg.templateDataUrl);
      ctx.drawImage(img, 0, 0, W, H);
    } catch (e) {
      console.warn('Template load failed, using built-in design', e);
      await drawBuiltInBackground(ctx, W, H, cfg);
      await drawBuiltInContent(ctx, W, H, cfg);
      return canvas;
    }

    // Draw each configured text element on top of the template
    // Fall back to DEFAULT_TEXT_ELEMENTS for cert types saved before this feature existed
    let elements = Array.isArray(cfg.textElements) && cfg.textElements.length > 0
      ? cfg.textElements
      : null;

    // Lazy-load DEFAULT_TEXT_ELEMENTS without a hard import (avoids circular dep)
    if (!elements) {
      elements = [
        { id: 'certTitle',     label: 'Certificate Title',    x: 50, y: 20, fontSize: 40, fontFamily: 'Dancing Script', bold: true, italic: true, color: '#1B3264', align: 'center', enabled: true },
        { id: 'introLine',     label: 'Intro Line (This is to certify that)', x: 50, y: 28, fontSize: 18, fontFamily: 'Inter', bold: false, italic: false, color: '#333333', align: 'center', enabled: true },
        { id: 'studentName',   label: 'Student Name',         x: 50, y: 36, fontSize: 38, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'center', enabled: true },
        { id: 'department',    label: 'Department (from …)',  x: 50, y: 44, fontSize: 18, fontFamily: 'Inter', bold: false, italic: false, color: '#444444', align: 'center', enabled: true },
        { id: 'college',       label: 'College / Institution', x: 50, y: 50, fontSize: 18, fontFamily: 'Inter', bold: true,  italic: false, color: '#333333', align: 'center', enabled: true },
        { id: 'completedLine', label: 'Completed Line (has successfully completed the)', x: 50, y: 56, fontSize: 18, fontFamily: 'Inter', bold: false, italic: false, color: '#333333', align: 'center', enabled: true },
        { id: 'courseName',    label: 'Course / Program',     x: 50, y: 62, fontSize: 26, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'center', enabled: true },
        { id: 'description',   label: 'Description / Program Details', x: 50, y: 68, fontSize: 16, fontFamily: 'Inter', bold: false, italic: false, color: '#444444', align: 'center', enabled: true },
        { id: 'companyName',   label: 'Company Name (at …)',  x: 50, y: 74, fontSize: 18, fontFamily: 'Inter', bold: true,  italic: false, color: '#333333', align: 'center', enabled: true },
        { id: 'registrationId', label: 'Registration ID',     x: 10, y: 80, fontSize: 14, fontFamily: 'Inter', bold: false, italic: false, color: '#555555', align: 'left',   enabled: true },
        { id: 'dateOfIssue',   label: 'Date of Issue',        x: 10, y: 83, fontSize: 14, fontFamily: 'Inter', bold: false, italic: false, color: '#1B3264', align: 'left',   enabled: true },
        { id: 'place',         label: 'Place',                x: 90, y: 83, fontSize: 14, fontFamily: 'Inter', bold: false, italic: false, color: '#1B3264', align: 'right',  enabled: true },
        { id: 'ceoName',       label: 'CEO Name',             x: 50, y: 88, fontSize: 15, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'center', enabled: true },
        { id: 'ceoTitle',      label: 'CEO Title',            x: 50, y: 93, fontSize: 13, fontFamily: 'Inter', bold: false, italic: false, color: '#555555', align: 'center', enabled: true },
        { id: 'certNumber',    label: 'Cert Number',          x: 88, y:  6, fontSize: 13, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'right',  enabled: true },
        { id: 'logo',          label: 'Company Logo',         x: 50, y:  7, fontSize: 48, fontFamily: 'Inter', bold: false, italic: false, color: '#000000', align: 'center', enabled: true },
      ];
    }

    const dataMap = {
      certTitle:     cfg.certTitle     || '',
      introLine:     'This is to certify that',
      studentName:   cfg.studentName || cfg.name || '',
      department:    cfg.department ? `from ${cfg.department}` : '',
      college:       cfg.college       || '',
      completedLine: 'has successfully completed the',
      courseName:    cfg.courseName    || '',
      description:   cfg.description   || '',
      companyName:   cfg.companyName ? `at ${cfg.companyName}` : '',
      registrationId: cfg.registrationId ? `Registration ID: ${cfg.registrationId}` : '',
      dateOfIssue:   cfg.dateOfIssue   || '',
      place:         cfg.place         || '',
      ceoName:       cfg.ceoName       || '',
      ceoTitle:      cfg.ceoTitle      || '',
      certNumber:    cfg.certNumber    || '',
    };

    // ── Draw company logo (template mode) ────────────────────────────────────
    const logoEl = elements.find(e => e.id === 'logo');
    if (cfg.logoDataUrl && logoEl && logoEl.enabled) {
      try {
        const logo = await loadImage(cfg.logoDataUrl);
        // Height (px) from element.fontSize; width preserves aspect ratio
        const logoH = logoEl.fontSize || 48;
        const logoW = Math.min(W * 0.45, logoH * (logo.naturalWidth / logo.naturalHeight));
        const lx = (logoEl.x / 100) * W;
        const ly = (logoEl.y / 100) * H;
        const ax = logoEl.align === 'left' ? 0 : logoEl.align === 'right' ? 1 : 0.5;
        ctx.drawImage(logo, lx - logoW * ax, ly - logoH / 2, logoW, logoH);
      } catch (_) {}
    }

    for (const el of elements) {
      if (el.id === 'logo') continue; // already drawn above
      drawTextElement(ctx, W, H, el, dataMap[el.id] || '');
    }

    // Draw signature image if provided (at configured CEO position)
    if (cfg.signatureDataUrl) {
      const ceoEl = elements.find(e => e.id === 'ceoName');
      const sigY  = ceoEl ? ((ceoEl.y - 8) / 100) * H : H * 0.80;
      try {
        const sig = await loadImage(cfg.signatureDataUrl);
        const cx  = W / 2, SH = 55, SW = Math.min(160, SH*(sig.naturalWidth/sig.naturalHeight));
        ctx.drawImage(sig, cx-SW/2, sigY - SH - 4, SW, SH);
      } catch(_){}
    }

  } else {
    // ── Built-in design mode ──────────────────────────────────────────────────
    await drawBuiltInBackground(ctx, W, H, cfg);
    await drawBuiltInContent(ctx, W, H, { ...cfg, studentName: cfg.name });
  }

  return canvas;
}

/** Convert canvas to PNG Blob */
export function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
}
