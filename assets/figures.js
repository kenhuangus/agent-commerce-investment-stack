/* Agent Commerce Investment Stack — hand-drawn figures */
(function () {
  const S = window.SKETCH;
  if (!S) return;

  const SANS = "'Inter', system-ui, sans-serif";
  const MONO = "'JetBrains Mono', ui-monospace, monospace";

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
    const w = 460, h = 500;
    const s = S.scene(host, w, h);
    const x = 28, bw = 404, bh = 58, gap = 8;
    let y0 = 36;

    S.txt(s, w / 2, 20, 'AGENT COMMERCE INVESTMENT STACK', {
      size: 13, weight: 700, col: S.COL.muted, anchor: 'middle', font: SANS
    });

    LAYERS.forEach((L, i) => {
      const yy = y0 + i * (bh + gap);
      S.rect(s, x, yy, bw, bh, {
        fill: S.tint(L.col, 0.10),
        stroke: L.col,
        strokeWidth: 1.5,
        fillStyle: 'solid'
      });
      /* Number column — left, start-anchored, mono */
      S.txt(s, x + 14, yy + 36, L.n, {
        size: 15, weight: 700, col: L.col, anchor: 'start', font: MONO
      });
      /* Title + sub — start-anchored so they never collide with the number */
      S.txt(s, x + 52, yy + 24, L.label, {
        size: 14.5, weight: 700, col: S.COL.ink, anchor: 'start', font: SANS
      });
      S.txt(s, x + 52, yy + 44, L.sub, {
        size: 11.5, weight: 500, col: S.COL.muted, anchor: 'start', font: SANS
      });
      if (L.tag) {
        S.txt(s, x + bw - 14, yy + 36, L.tag, {
          size: 11, weight: 700, col: L.col, anchor: 'end', font: SANS
        });
      }
    });
  });

  S.register('value-flow', host => {
    const s = S.scene(host, 420, 200);
    const boxes = [
      { x: 20,  label: 'Model', sub: 'commoditizes', col: S.COL.green },
      { x: 155, label: 'Data / ID', sub: 'durable value', col: S.COL.teal },
      { x: 290, label: 'Ecosystem', sub: 'sets ceiling', col: S.COL.grape }
    ];
    S.txt(s, 210, 28, 'Value migrates upward over time', {
      size: 14, weight: 700, col: S.COL.ink, anchor: 'middle', font: SANS
    });
    boxes.forEach((b, i) => {
      S.chip(s, b.x, 58, 110, 52, b.label, b.col, { size: 14, weight: 700 });
      S.txt(s, b.x + 55, 138, b.sub, {
        size: 12.5, weight: 600, col: S.COL.muted, anchor: 'middle', font: SANS
      });
      if (i < boxes.length - 1) {
        S.arrow(s, b.x + 114, 84, boxes[i + 1].x - 4, 84, {
          stroke: S.COL.accent, strokeWidth: 2
        });
      }
    });
  });
})();
