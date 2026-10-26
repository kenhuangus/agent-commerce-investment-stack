/* Agent Commerce Investment Stack — hand-drawn figures */
(function () {
  const S = window.SKETCH;
  if (!S) return;

  const LAYERS = [
    { n: '07', label: 'Ecosystem', sub: 'Access · Liability · Standards', col: S.COL.grape, tag: 'TOP' },
    { n: '06', label: 'Security & Compliance', sub: 'Guard · Prove · Insure', col: S.COL.red, tag: 'CROSS' },
    { n: '05', label: 'Evaluation', sub: 'Test · Repeat · Certify', col: S.COL.orange, tag: '' },
    { n: '04', label: 'Identity & Hosting', sub: 'Verify · Score · Isolate', col: S.COL.pink, tag: '' },
    { n: '03', label: 'Protocol', sub: 'UCP · ACP · A2A · MCP', col: S.COL.indigo, tag: '' },
    { n: '02', label: 'Data', sub: 'Clean · Consented · Controlled', col: S.COL.teal, tag: '' },
    { n: '01', label: 'Model', sub: 'Cheaper · Tuned · Routed', col: S.COL.green, tag: 'BASE' }
  ];

  S.register('stack', host => {
    const w = 420, h = 460;
    const s = S.scene(host, w, h);
    const x = 36, bw = 348, bh = 48, gap = 8;
    let y = 28;

    S.txt(s, w / 2, 16, 'AGENT COMMERCE INVESTMENT STACK', {
      size: 13, weight: 700, col: S.COL.muted, anchor: 'middle'
    });

    LAYERS.forEach((L, i) => {
      const yy = y + i * (bh + gap);
      S.rect(s, x, yy, bw, bh, {
        fill: S.tint(L.col, 0.12),
        stroke: L.col,
        strokeWidth: 1.6
      });
      S.txt(s, x + 18, yy + 30, L.n, {
        size: 16, weight: 700, col: L.col, font: "'JetBrains Mono', monospace"
      });
      S.txt(s, x + 58, yy + 22, L.label, {
        size: 15, weight: 700, col: S.COL.ink
      });
      S.txt(s, x + 58, yy + 40, L.sub, {
        size: 11.5, weight: 400, col: S.COL.muted
      });
      if (L.tag) {
        S.txt(s, x + bw - 12, yy + 30, L.tag, {
          size: 11, weight: 700, col: L.col, anchor: 'end'
        });
      }
    });
  });

  S.register('value-flow', host => {
    const s = S.scene(host, 420, 200);
    const boxes = [
      { x: 20,  label: 'Model', sub: 'commoditizes', col: S.COL.green },
      { x: 150, label: 'Data / ID', sub: 'durable value', col: S.COL.teal },
      { x: 280, label: 'Ecosystem', sub: 'sets ceiling', col: S.COL.grape }
    ];
    boxes.forEach((b, i) => {
      S.chip(s, b.x, 70, 110, 54, b.label, b.col);
      S.txt(s, b.x + 55, 145, b.sub, {
        size: 12, weight: 700, col: S.COL.muted, anchor: 'middle'
      });
      if (i < boxes.length - 1) {
        S.arrow(s, b.x + 112, 97, boxes[i + 1].x - 4, 97, { stroke: S.COL.accent, strokeWidth: 2 });
      }
    });
    S.txt(s, 210, 30, 'Value migrates upward over time', {
      size: 14, weight: 700, col: S.COL.ink, anchor: 'middle'
    });
  });
})();
