'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
}

/**
 * Preloader built from scratch for Vocalyze CRM.
 * Recreation of Animmaster/Insane-PRELOADER in React JSX + GSAP.
 * Preserves Vocalyze CRM brand colors (#0F5C4A primary dark green, #10B981 accent emerald).
 * Renders cleanly in React JSX without raw DOM manipulation.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const c1Ref = useRef<HTMLDivElement>(null);
  const c2Ref = useRef<HTMLDivElement>(null);
  const c3Ref = useRef<HTMLDivElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      onCompleteRef.current?.();
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setDone(true);
      onCompleteRef.current?.();
    };

    const ctx = gsap.context(() => {
      const c1 = c1Ref.current;
      const c2 = c2Ref.current;
      const c3 = c3Ref.current;
      const l1 = l1Ref.current;
      const l2 = l2Ref.current;
      const loader = loaderRef.current;

      if (!c1 || !c2 || !c3 || !l1 || !l2 || !loader) return;

      const isMobile = window.innerWidth <= 640;
      const numHeight = isMobile ? 64 : 100;

      const c1Dist = (2 - 1) * numHeight; // 100px (0 -> 1)
      const c2Dist = (11 - 1) * numHeight; // 1000px (0 -> 9 -> 0)
      const c3Dist = (21 - 1) * numHeight; // 2000px (0 -> 9 -> 0 -> 9 -> 0)

      const tl = gsap.timeline({
        onComplete: finish,
      });

      // 1. Ones digit continuous roll (0..100) over 5 seconds
      tl.to(c3, {
        y: -c3Dist,
        duration: 5,
        ease: 'power2.inOut',
      }, 0);

      // 2. Tens digit continuous roll (0..90..0) over 6 seconds
      tl.to(c2, {
        y: -c2Dist,
        duration: 6,
        ease: 'power2.inOut',
      }, 0);

      // 3. Hundreds digit roll (0 -> 1) starting at 4s, completing at 6s
      tl.to(c1, {
        y: -c1Dist,
        duration: 2,
        ease: 'power2.inOut',
      }, 4);

      // 4. Loader bar 1 smooth fill (0 -> 100%) over 6 seconds
      tl.fromTo(l1, 
        { width: 0 },
        { width: isMobile ? 150 : 200, duration: 6, ease: 'power2.inOut' },
        0
      );

      // 5. Loader bar 2 smooth fill starting at 1.9s over 2 seconds
      tl.fromTo(l2,
        { width: 0 },
        { width: isMobile ? 70 : 100, duration: 2, ease: 'power2.inOut' },
        1.9
      );

      // 6. At 6s (100% reached): Digits slide up & loader bars split
      const digits = root.querySelectorAll('.pl-digit');
      if (digits.length > 0) {
        tl.to(digits, {
          y: -150,
          stagger: { amount: 0.25 },
          duration: 1,
          ease: 'power4.inOut',
        }, 6);
      }

      tl.to(loader, {
        background: 'none',
        duration: 0.1,
      }, 6);

      tl.to(l1, {
        rotate: 90,
        y: -50,
        duration: 0.5,
      }, 6);

      tl.to(l2, {
        x: -75,
        y: 75,
        duration: 0.5,
      }, 6);

      // 7. At 7s: Loader container expands & exits offscreen
      tl.to(loader, {
        scale: 40,
        rotate: 45,
        y: 500,
        x: 2000,
        duration: 1,
        ease: 'power2.inOut',
      }, 7);

      // 8. At 7.5s: Screen overlay fades out to reveal landing page
      tl.to(root, {
        opacity: 0,
        duration: 0.5,
        ease: 'power1.inOut',
      }, 7.5);
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, [done]);

  if (done) return null;

  const counter1Digits = [0, 1];
  const counter2Digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const counter3Digits = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    0
  ];

  return (
    <div ref={rootRef} className="pl-loading-screen">
      <div ref={loaderRef} className="pl-loader">
        <div ref={l1Ref} className="pl-loader-1 pl-bar" />
        <div ref={l2Ref} className="pl-loader-2 pl-bar" />
      </div>
      <div className="pl-counter">
        <div className="pl-counter-1 pl-digit">
          <div ref={c1Ref}>
            {counter1Digits.map((n, idx) => (
              <div key={idx} className={`pl-num ${idx === 1 ? 'pl-num1offset1' : ''}`}>
                {n}
              </div>
            ))}
          </div>
        </div>
        <div className="pl-counter-2 pl-digit">
          <div ref={c2Ref}>
            {counter2Digits.map((n, idx) => (
              <div key={idx} className={`pl-num ${idx === 1 ? 'pl-num1offset2' : ''}`}>
                {n}
              </div>
            ))}
          </div>
        </div>
        <div className="pl-counter-3 pl-digit">
          <div ref={c3Ref}>
            {counter3Digits.map((n, idx) => (
              <div key={idx} className="pl-num">
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .pl-loading-screen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #ffffff;
          color: #0f172a;
          z-index: 10000;
          overflow: hidden;
          pointer-events: auto;
        }
        .pl-counter {
          position: fixed;
          left: 50px;
          bottom: 50px;
          display: flex;
          height: 100px;
          font-size: 100px;
          line-height: 100px;
          clip-path: polygon(0 0, 100% 0, 100% 100px, 0 100px);
          font-weight: 500;
          font-family: var(--font-inter), sans-serif;
          color: #0F5C4A;
        }
        .pl-counter-1,
        .pl-counter-2,
        .pl-counter-3 {
          position: relative;
          top: 0;
        }
        .pl-num {
          height: 100px;
          line-height: 100px;
        }
        .pl-num1offset1 { position: relative; right: -25px; }
        .pl-num1offset2 { position: relative; right: -10px; }
        .pl-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 50px;
          transform: translate(-50%, -50%);
          display: flex;
          background: #e2e8f0;
          border-radius: 9999px;
          overflow: hidden;
        }
        .pl-loader-1 {
          position: relative;
          background: #0F5C4A;
          width: 200px;
        }
        .pl-loader-2 {
          position: relative;
          width: 100px;
          background: #10b981;
        }
        .pl-bar { height: 50px; }
        @media (max-width: 640px) {
          .pl-counter { left: 20px; bottom: 20px; font-size: 64px; line-height: 64px; clip-path: polygon(0 0, 100% 0, 100% 64px, 0 64px); }
          .pl-num { height: 64px; line-height: 64px; }
          .pl-loader { width: 220px; height: 40px; }
          .pl-loader-1 { width: 150px; }
          .pl-loader-2 { width: 70px; }
          .pl-bar { height: 40px; }
        }
      `}</style>
    </div>
  );
}
