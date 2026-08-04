'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Magnetic } from '@/components/cursor/magnetic';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;
uniform float u_spread;
uniform float u_speed;
uniform float u_numRings;
uniform float u_ringWidth;
uniform float u_ringGap;
uniform float u_ringSpeed;
uniform float u_ringsAlpha;
uniform float u_dissolveSpeed;
uniform float u_dissolveEdge;
varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  st.x *= u_resolution.x / u_resolution.y;

  vec2 center = vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5);
  float dist = distance(st, center);

  float ringCycle = u_ringWidth + u_ringGap;
  float ringPos = mod(dist - u_time * u_ringSpeed * 0.1, ringCycle);
  float rings = smoothstep(0.0, u_ringWidth, ringPos) * smoothstep(ringCycle, ringCycle - u_ringWidth, ringPos);
  float ringLimit = step(dist, u_numRings * ringCycle);
  rings *= ringLimit * u_ringsAlpha;

  vec3 coord = vec3(st * u_spread, u_time * u_speed * 0.1);
  float n = snoise(coord);
  n = (n + 1.0) * 0.5;

  float dissolvePattern = snoise(vec3(st * 3.0, u_time * u_dissolveSpeed * 0.1));
  dissolvePattern = (dissolvePattern + 1.0) * 0.5;

  float edge = smoothstep(0.3, 0.3 + u_dissolveEdge, dissolvePattern);
  float finalAlpha = n * edge;

  vec3 finalColor = u_color + vec3(rings * 0.2);

  gl_FragColor = vec4(finalColor, finalAlpha * 0.7);
}
`;

const CONFIG = {
  color: '#0F5C4A',
  spread: 0.5,
  speed: 1,
  numRings: 12,
  ringWidth: 0.02,
  ringGap: 0.08,
  ringSpeed: 0.5,
  ringsAlpha: 0.2,
  dissolveSpeed: 0.5,
  dissolveEdge: 0.3,
};

export function Hero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const colorObj = new THREE.Color(CONFIG.color);

    const uniforms = {
      u_resolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
      u_time: { value: 0 },
      u_color: { value: new THREE.Vector3(colorObj.r, colorObj.g, colorObj.b) },
      u_spread: { value: CONFIG.spread },
      u_speed: { value: CONFIG.speed },
      u_numRings: { value: CONFIG.numRings },
      u_ringWidth: { value: CONFIG.ringWidth },
      u_ringGap: { value: CONFIG.ringGap },
      u_ringSpeed: { value: CONFIG.ringSpeed },
      u_ringsAlpha: { value: CONFIG.ringsAlpha },
      u_dissolveSpeed: { value: CONFIG.dissolveSpeed },
      u_dissolveEdge: { value: CONFIG.dissolveEdge },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section id="home" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-28 pb-20 bg-white">
      {/* Background canvas from Ironhill section rebuild */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none opacity-30" />

      {/* Subtle radial ambient gradient blend */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/20 via-slate-50/50 to-white pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        {/* Main Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-light tracking-tight sm:text-7xl lg:text-8xl text-balance text-slate-900"
        >
          Supercharge Your Telecalling.
          <br />
          <span className="gradient-text font-semibold">Close More Deals.</span>
        </motion.h1>

        {/* Subtitle description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-2xl text-lg text-slate-600 sm:text-xl text-balance leading-relaxed"
        >
          An all-in-one Telecalling CRM that helps teams manage leads,
          monitor call logs, automate follow-ups, and convert prospects faster.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
        >
          <Magnetic href="/signup" strength={0.4}>
            <span className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary/90">
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Magnetic>

          <Magnetic href="#book-demo" strength={0.4}>
            <span className="group inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-800 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:scale-105">
              <Calendar className="h-5 w-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
              Book Live Demo
            </span>
          </Magnetic>
        </motion.div>

        {/* Quick Trust Signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-500"
        >
          <span className="flex items-center gap-1.5">✓ No credit card required</span>
          <span className="flex items-center gap-1.5">✓ 14-day free trial</span>
          <span className="flex items-center gap-1.5">✓ Instant 2-minute setup</span>
        </motion.div>
      </div>
    </section>
  );
}
