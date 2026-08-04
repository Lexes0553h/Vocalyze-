'use client';

import { useEffect, useRef } from 'react';

type CursorMode = 'default' | 'button' | 'card' | 'input';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine if device has a desktop fine pointer
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!mediaQuery.matches || isTouch) {
      document.documentElement.classList.remove('custom-cursor-active');
      return;
    }

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    document.documentElement.classList.add('custom-cursor-active');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetRingX = mouseX;
    let targetRingY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = 0;
    let mode: CursorMode = 'default';
    let pressed = false;
    let isVisible = false;

    const setMode = (next: CursorMode) => {
      if (next === mode) return;
      mode = next;

      let size = 32;
      let border = 'rgba(15, 92, 74, 0.45)';
      let bg = 'transparent';
      let shadow = 'none';

      if (next === 'button') {
        size = 52;
        border = 'rgba(15, 92, 74, 0.85)';
        bg = 'rgba(15, 92, 74, 0.12)';
        shadow = '0 0 20px rgba(15, 92, 74, 0.2)';
      } else if (next === 'card') {
        size = 64;
        border = 'rgba(15, 92, 74, 0.55)';
        bg = 'rgba(15, 92, 74, 0.05)';
        shadow = '0 0 25px rgba(15, 92, 74, 0.12)';
      } else if (next === 'input') {
        size = 40;
        border = 'rgba(14, 165, 233, 0.8)';
        bg = 'rgba(14, 165, 233, 0.08)';
        shadow = '0 0 15px rgba(14, 165, 233, 0.2)';
      }

      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.borderColor = border;
      ring.style.backgroundColor = bg;
      ring.style.boxShadow = shadow;
    };

    const updateVisibility = (visible: boolean) => {
      isVisible = visible;
      const opacityStr = visible ? '1' : '0';
      cursor.style.opacity = opacityStr;
      ring.style.opacity = opacityStr;
    };

    const onPointerMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        updateVisibility(true);
      }

      // Check element under cursor for magnetic / hover target
      const target = (e.target as HTMLElement | null) || document.elementFromPoint(mouseX, mouseY);
      if (!target) {
        targetRingX = mouseX;
        targetRingY = mouseY;
        setMode('default');
        return;
      }

      const magneticEl = target.closest<HTMLElement>('[data-cursor="magnetic"], [data-magnetic]');
      const buttonEl = target.closest<HTMLElement>(
        'a, button, [role="button"], label, .btn, .cursor-pointer, [data-cursor="hover"]'
      );
      const cardEl = target.closest<HTMLElement>('[data-cursor="card"], .glass-card, .glass, .card');
      const inputEl = target.closest<HTMLElement>('input, textarea, select, [role="textbox"]');

      const interactiveEl = magneticEl || buttonEl;

      if (interactiveEl) {
        // Magnetic pull towards element center
        const rect = interactiveEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distSq = (mouseX - centerX) ** 2 + (mouseY - centerY) ** 2;

        // Apply magnetic pull if close enough
        if (distSq < 16000) {
          targetRingX = mouseX + (centerX - mouseX) * 0.35;
          targetRingY = mouseY + (centerY - mouseY) * 0.35;
        } else {
          targetRingX = mouseX;
          targetRingY = mouseY;
        }
        setMode('button');
      } else if (cardEl) {
        targetRingX = mouseX;
        targetRingY = mouseY;
        setMode('card');
      } else if (inputEl) {
        targetRingX = mouseX;
        targetRingY = mouseY;
        setMode('input');
      } else {
        targetRingX = mouseX;
        targetRingY = mouseY;
        setMode('default');
      }
    };

    const onPointerDown = () => {
      pressed = true;
    };

    const onPointerUp = () => {
      pressed = false;
    };

    const onMouseLeave = () => {
      updateVisibility(false);
    };

    const onMouseEnter = () => {
      updateVisibility(true);
    };

    const loop = () => {
      ringX += (targetRingX - ringX) * 0.22;
      ringY += (targetRingY - ringY) * 0.22;

      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${
        pressed ? 0.8 : 1
      })`;

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mousedown', onPointerDown, { passive: true });
    window.addEventListener('mouseup', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      {/* Center dot */}
      <div
        ref={cursorRef}
        className="fixed left-0 top-0 z-[999999] pointer-events-none rounded-full"
        style={{
          width: '7px',
          height: '7px',
          backgroundColor: '#0F5C4A',
          opacity: 0,
          transition: 'opacity 0.2s ease, width 0.2s ease, height 0.2s ease',
          willChange: 'transform',
        }}
      />
      {/* Following outer ring */}
      <div
        ref={ringRef}
        className="fixed left-0 top-0 z-[999998] pointer-events-none rounded-full"
        style={{
          width: '32px',
          height: '32px',
          border: '1.5px solid rgba(15, 92, 74, 0.45)',
          opacity: 0,
          transition:
            'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), height 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
          willChange: 'transform',
        }}
      />
    </>
  );
}

