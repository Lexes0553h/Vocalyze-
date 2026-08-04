'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: 'div' | 'span' | 'section' | 'h2' | 'p' | 'li';
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  as = 'div',
}: RevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-80px' });

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
  once?: boolean;
}

export function Stagger({ children, className, once = true }: StaggerProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export const fadeUpItem = itemVariants;
export const staggerContainer = containerVariants;
