'use client';
// Scrolls the home page to the box named in the URL hash (/#weekly-insights).
// Boxes carry data-anchor instead of an id because each box is rendered
// twice (phone and wide layouts); this picks the copy that is visible.
import { useEffect } from 'react';

export default function ScrollToBoxAnchor() {
  useEffect(() => {
    const scroll = () => {
      const name = decodeURIComponent(window.location.hash.slice(1));
      if (!name) return;
      const target = Array.from(document.querySelectorAll<HTMLElement>('[data-anchor]'))
        .find((el) => el.dataset.anchor === name && el.offsetParent !== null);
      target?.scrollIntoView({ block: 'start' });
    };
    scroll();
    window.addEventListener('hashchange', scroll);
    return () => window.removeEventListener('hashchange', scroll);
  }, []);

  return null;
}
