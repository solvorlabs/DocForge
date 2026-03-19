import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = i.x + i.y * 57.0;
  return mix(mix(hash(n), hash(n+1.0), f.x),
             mix(hash(n+57.0), hash(n+58.0), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.3;

  // Aurora bands
  vec2 p = uv * vec2(2.0, 1.0) + vec2(t * 0.1, 0.0);
  float f0 = fbm(p + vec2(0.0, t * 0.15));
  float f1 = fbm(p + vec2(3.14, t * 0.18));
  float f2 = fbm(p * 1.5 + vec2(1.57, t * 0.12));

  // Band positions on Y axis
  float band0 = 1.0 - smoothstep(0.0, 0.5, abs(uv.y - (0.7 + f0 * uAmplitude * 0.3)));
  float band1 = 1.0 - smoothstep(0.0, 0.4, abs(uv.y - (0.5 + f1 * uAmplitude * 0.2)));
  float band2 = 1.0 - smoothstep(0.0, 0.35, abs(uv.y - (0.35 + f2 * uAmplitude * 0.25)));

  // Fade at top/bottom
  float vFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.7, uv.y);

  vec3 col = vec3(0.0);
  col += uColor0 * band0 * (0.4 + f0 * 0.6);
  col += uColor1 * band1 * (0.5 + f1 * 0.5);
  col += uColor2 * band2 * (0.3 + f2 * 0.7);
  col += uColor3 * (band0 * band1 * 0.5);

  // Horizontal shimmer
  float shimmer = 0.85 + 0.15 * sin(uv.x * 12.0 + t * 2.0 + fbm(uv * 3.0 + t) * 3.0);
  col *= shimmer * vFade;

  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)) * 0.85);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export function Aurora({
  colorStops = ['#FCEE09', '#f59e0b', '#ef4444', '#78350f'],
  amplitude = 1.0,
  blend = 0.5,
  speed = 1.0,
  className = '',
  style,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

    const colors = colorStops.slice(0, 4).map(hexToRgb);
    while (colors.length < 4) colors.push([0, 0, 0]);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColor0: { value: new Color(colors[0][0], colors[0][1], colors[0][2]) },
        uColor1: { value: new Color(colors[1][0], colors[1][1], colors[1][2]) },
        uColor2: { value: new Color(colors[2][0], colors[2][1], colors[2][2]) },
        uColor3: { value: new Color(colors[3][0], colors[3][1], colors[3][2]) },
      },
      transparent: true,
    });

    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });

    let animId: number;
    let lastTime = 0;

    function resize() {
      renderer.setSize(container!.offsetWidth, container!.offsetHeight);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    function render(time: number) {
      animId = requestAnimationFrame(render);
      program.uniforms.uTime.value = time * 0.001 * speed;
      renderer.render({ scene: mesh });
    }
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      gl.canvas.remove();
    };
  }, [colorStops, amplitude, speed]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}
    />
  );
}
