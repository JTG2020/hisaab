'use strict';

// WCAG 2.x relative-luminance contrast, computed from computed styles only.
// Passed to page.evaluate as a self-contained function.

function contrastFor(selectors) {
  function parseColor(value) {
    const match = /^rgba?\(([^)]+)\)$/.exec(String(value).trim());
    if (!match) return null;
    const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  function luminance(color) {
    function channel(value) {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  }

  function backgroundOf(element) {
    let node = element;
    while (node && node.nodeType === 1) {
      const color = parseColor(getComputedStyle(node).backgroundColor);
      if (color && color.a > 0) return color;
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  return selectors.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return { selector, found: false };
    const style = getComputedStyle(element);
    const foreground = parseColor(style.color);
    const background = backgroundOf(element);
    if (!foreground) return { selector, found: true, ratio: null, color: style.color };
    const first = luminance(foreground);
    const second = luminance(background);
    const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    return {
      selector,
      found: true,
      color: style.color,
      background: 'rgb(' + background.r + ', ' + background.g + ', ' + background.b + ')',
      ratio: Math.round(ratio * 100) / 100,
    };
  });
}

module.exports = { contrastFor };
