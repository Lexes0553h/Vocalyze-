'use client';

import { type ReactNode, useRef, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="font-display text-2xl font-light tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon,
  index = 0,
}: {
  label: string;
  value: string;
  change?: number;
  icon: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl glass-card p-5 transition-all duration-300 hover:border-primary/30"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              change >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="relative text-2xl font-semibold tracking-tight">{value}</div>
      <div className="relative mt-0.5 text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-200 text-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function Card({
  children,
  className,
  title,
  action,
  delay = 0,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  delay?: number;
  padding?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('rounded-2xl glass-card', padding && 'p-5', className)}
    >
      {(title || action) && (
        <div className={cn('flex items-center justify-between', !padding && 'p-5 pb-0', padding && 'mb-4')}>
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'cyan' | 'green' | 'red' | 'yellow' | 'muted';
  className?: string;
}) {
  const variants = {
    default: 'bg-white/8 text-foreground',
    primary: 'bg-primary/15 text-primary ring-1 ring-primary/20',
    cyan: 'bg-cyan/15 text-cyan ring-1 ring-cyan/20',
    green: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/20',
    red: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20',
    yellow: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/20',
    muted: 'bg-white/5 text-muted-foreground',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.3 });

  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30',
    secondary: 'bg-white/8 text-foreground hover:bg-white/12',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-white/5',
    outline: 'border border-white/15 bg-transparent text-foreground hover:bg-white/5',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-sm',
    icon: 'h-10 w-10',
  };

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    const strength = variant === 'primary' ? 0.25 : 0.12;
    x.set(relX * strength);
    y.set(relY * strength);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      disabled={disabled}
      data-cursor="magnetic"
      data-magnetic="true"
      style={{ x: springX, y: springY }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.button>
  );
}

export function Avatar({ src, name, size = 40, ring }: { src?: string; name: string; size?: number; ring?: boolean }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn('rounded-full object-cover', ring && 'ring-2 ring-primary/30')}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn('flex items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary', ring && 'ring-2 ring-primary/30')}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export function StatusDot({ status }: { status: 'online' | 'away' | 'offline' }) {
  const colors = { online: 'bg-green-400', away: 'bg-yellow-400', offline: 'bg-muted-foreground/40' };
  return <span className={cn('h-2 w-2 rounded-full', colors[status])} />;
}

export function ProgressBar({ value, className, color = 'primary' }: { value: number; className?: string; color?: 'primary' | 'cyan' }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn('h-full rounded-full', color === 'primary' ? 'bg-primary' : 'bg-cyan')}
      />
    </div>
  );
}

export function EmptyState({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-medium">{title}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function SectionTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-white/5 p-1 overflow-x-auto max-w-full no-scrollbar whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            active === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {active === tab && (
            <motion.span
              layoutId="section-tab"
              className="absolute inset-0 rounded-lg bg-primary/20 ring-1 ring-primary/30"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
