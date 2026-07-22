import '@testing-library/jest-dom/vitest';

// jsdom 缺失的浏览器 API polyfill
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.matchMedia = window.matchMedia || ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));

window.getComputedStyle = window.getComputedStyle || ((elt: Element) => ({
  getPropertyValue: () => '',
}));
