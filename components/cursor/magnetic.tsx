'use client';

import { useRef, useEffect, useState, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

export function Magnetic({
  children,
  className,
  strength = 0.35,
  href,
  onClick,
  disabled = false,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.35 });

  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0
      );
    };
    checkTouch();
  }, []);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || isTouch) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;

    const maxShift = 14;
    const shiftX = Math.max(-maxShift, Math.min(maxShift, relX * strength));
    const shiftY = Math.max(-maxShift, Math.min(maxShift, relY * strength));

    x.set(shiftX);
    y.set(shiftY);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        const navOffset = 80;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        if (targetId === 'book-demo') {
          el.classList.add('section-highlight');
          setTimeout(() => el.classList.remove('section-highlight'), 2000);
        }
      }
    }
    if (onClick) {
      onClick(e);
    }
  };

  const content = (
    <motion.div
      ref={ref}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: isTouch ? 0 : springX, y: isTouch ? 0 : springY }}
      className={cn('inline-block cursor-pointer transition-shadow rounded-xl', className)}
      data-cursor="magnetic"
    >
      {children}
    </motion.div>
  );

  if (href) {
    if (href.startsWith('#')) {
      return (
        <a href={href} onClick={handleClick} className="inline-block">
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
