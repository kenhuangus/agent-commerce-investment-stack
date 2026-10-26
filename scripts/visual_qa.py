"""Screenshot every slide and run layout/readability checks."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "screenshots"
AUDIT_JS = ROOT / "scripts" / "audit-deck.js"
INDEX = ROOT / "index.html"

sys.stdout.reconfigure(encoding="utf-8")
SHOTS.mkdir(exist_ok=True)

VIEWPORTS = [
    {"name": "1280x720", "width": 1280, "height": 720},
    {"name": "1920x1080", "width": 1920, "height": 1080},
]

OVERFLOW_JS = """() => {
  const slide = document.querySelector('.slide.is-active');
  if (!slide) return null;
  const wrap = slide.querySelector('.slide__in') || slide;
  const deck = document.querySelector('.deck');
  const sr = slide.getBoundingClientRect();
  const wr = wrap.getBoundingClientRect();
  const overflowY = wrap.scrollHeight > wrap.clientHeight + 2
    || slide.scrollHeight > slide.clientHeight + 2
    || wr.bottom > sr.bottom + 2;
  const overflowX = wr.right > sr.right + 4;
  // text under 14px
  const under = [];
  wrap.querySelectorAll('*').forEach(el => {
    if (!el.childNodes.length) return;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs && fs < 14 - 0.05) {
      under.push({tag: el.tagName, cls: el.className, fs: Math.round(fs*10)/10, text: el.textContent.trim().slice(0,60)});
    }
  });
  // svg text bbox — compare rendered px (viewBox size × scale), not raw attr
  const svgIssues = [];
  wrap.querySelectorAll('svg').forEach((svg) => {
    const vb = svg.viewBox.baseVal;
    const W = vb && vb.width ? vb.width : svg.clientWidth;
    const H = vb && vb.height ? vb.height : svg.clientHeight;
    const scale = (svg.clientWidth && W) ? svg.clientWidth / W : 1;
    svg.querySelectorAll('text').forEach(t => {
      let b;
      try { b = t.getBBox(); } catch(e) { return; }
      const fsAttr = parseFloat(t.getAttribute('font-size') || 0);
      const fsPx = fsAttr * scale;
      const out = b.x < -2 || b.y < -2 || (b.x+b.width) > W+4 || (b.y+b.height) > H+4;
      if (out || (fsPx && fsPx < 13.5)) {
        svgIssues.push({
          text: (t.textContent||'').trim().slice(0,40),
          fs: Math.round(fsPx*10)/10,
          out
        });
      }
    });
  });
  return {
    title: slide.dataset.title,
    deckH: deck ? deck.clientHeight : null,
    slideH: slide.clientHeight,
    wrapH: wrap.clientHeight,
    wrapScrollH: wrap.scrollHeight,
    overflowY, overflowX,
    under14: under.slice(0, 12),
    svgIssues: svgIssues.slice(0, 12)
  };
}"""


def main() -> None:
    report = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for vp in VIEWPORTS:
            page = browser.new_page(viewport={"width": vp["width"], "height": vp["height"]})
            page.goto(INDEX.as_uri(), wait_until="networkidle")
            page.wait_for_selector(".slide.is-active")
            page.wait_for_function("document.fonts && document.fonts.status === 'loaded'")
            page.wait_for_timeout(400)

            n = page.evaluate("document.querySelectorAll('.slide').length")
            print(f"\n=== {vp['name']} · {n} slides ===")

            for i in range(1, n + 1):
                page.evaluate(f"location.hash = '#{i}'")
                page.wait_for_timeout(450)
                # ensure figure redraw
                page.evaluate(
                    """() => {
                      const s = document.querySelector('.slide.is-active');
                      document.dispatchEvent(new CustomEvent('deck:slide', {detail:{slide:s, index:0}}));
                    }"""
                )
                page.wait_for_timeout(200)

                info = page.evaluate(OVERFLOW_JS)
                path = SHOTS / f"{vp['name']}_slide_{i:02d}.png"
                page.screenshot(path=str(path), full_page=False)

                bad = (
                    info["overflowY"]
                    or info["overflowX"]
                    or info["under14"]
                    or info["svgIssues"]
                )
                flag = "FAIL" if bad else "ok  "
                print(
                    f"  [{flag}] {i:02d} {info['title']!r} "
                    f"scrollH={info['wrapScrollH']} clientH={info['wrapH']} "
                    f"under14={len(info['under14'])} svg={len(info['svgIssues'])}"
                )
                if bad:
                    report.append({"viewport": vp["name"], "slide": i, **info})

            # inject AUDIT if present
            if AUDIT_JS.exists():
                page.add_script_tag(path=str(AUDIT_JS))
                page.wait_for_timeout(200)
                audit = page.evaluate(
                    """async () => {
                      await document.fonts.ready;
                      if (!window.AUDIT) return null;
                      return AUDIT.run({verbose:1});
                    }"""
                )
                print(f"  AUDIT {vp['name']}: {json.dumps(audit, ensure_ascii=False)[:800] if audit else 'n/a'}")
                if audit:
                    report.append({"viewport": vp["name"], "audit": audit})

            page.close()
        browser.close()

    out = SHOTS / "qa_report.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {out} ({len(report)} issue records)")


if __name__ == "__main__":
    main()
