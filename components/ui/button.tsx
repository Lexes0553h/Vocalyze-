'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] hover:shadow-md hover:scale-[1.02]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-xs',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base font-semibold',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  magnetic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, magnetic = true, ...props }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.35 });
    const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.35 });
    const [isTouch, setIsTouch] = React.useState(false);

    React.useEffect(() => {
      setIsTouch(
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0
      );
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (props.disabled || isTouch || !magnetic) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      const maxShift = 12;
      x.set(Math.max(-maxShift, Math.min(maxShift, relX * 0.35)));
      y.set(Math.max(-maxShift, Math.min(maxShift, relY * 0.35)));
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      x.set(0);
      y.set(0);
      if (props.onMouseLeave) props.onMouseLeave(e);
    };

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <motion.button
        style={{ x: isTouch ? 0 : springX, y: isTouch ? 0 : springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as any}
        data-cursor="magnetic"
        {...(props as any)}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
