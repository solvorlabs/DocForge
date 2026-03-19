import { useEffect, useRef } from 'react';
import { Renderer, Program, Geometry, Mesh } from 'ogl';

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VERT = `
precision highp float;
attribute vec3 position;
attribute float size;
attribute vec3 color;
attribute float alpha;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime;
uniform float uSpread;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = color;
  vAlpha = alpha;
  vec3 pos = position;
  // Gentle floating motion
  pos.x += sin(uTime * 0.5 + position.y * 2.0) * 0.02;
  pos.y += cos(uTime * 0.4 + position.x * 2.0) * 0.02;
  pos.z += sin(uTime * 0.3 + position.x + position.y) * 0.01;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * (300.0 / -mvPosition.z);
}
`;

const FRAG = `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, d));
  gl_FragColor = vec4(vColor, alpha);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255];
}

export function Particles({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.5,
  particleColors = ['#a855f7', '#ef4444', '#06b6d4', '#ffffff'],
  moveParticlesOnHover = false,
  particleHoverFactor = 0.5,
  alphaParticles = true,
  particleBaseSize = 80,
  sizeRandomness = 1.5,
  cameraDistance = 20,
  className = '',
  style,
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

    // Build particle data
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const alphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * particleSpread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * particleSpread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * particleSpread;
      sizes[i] = particleBaseSize * (0.5 + Math.random() * sizeRandomness);
      const c = hexToRgb(particleColors[Math.floor(Math.random() * particleColors.length)]);
      colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
      alphas[i] = alphaParticles ? 0.2 + Math.random() * 0.6 : 1.0;
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      size:     { size: 1, data: sizes },
      color:    { size: 3, data: colors },
      alpha:    { size: 1, data: alphas },
    });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    // Simple camera setup
    const camera = {
      view: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-cameraDistance,1]),
      projection: new Float32Array(16),
    };

    function setProjection(w: number, h: number) {
      const fov = Math.PI / 4;
      const aspect = w / h;
      const near = 0.1, far = 1000;
      const f = 1 / Math.tan(fov / 2);
      camera.projection.fill(0);
      camera.projection[0] = f / aspect;
      camera.projection[5] = f;
      camera.projection[10] = -(far + near) / (far - near);
      camera.projection[11] = -1;
      camera.projection[14] = -(2 * far * near) / (far - near);
    }

    function resize() {
      const w = container!.offsetWidth, h = container!.offsetHeight;
      renderer.setSize(w, h);
      setProjection(w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let animId: number;

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
  }, [particleCount, particleSpread, speed, particleColors, particleBaseSize, sizeRandomness, alphaParticles, cameraDistance]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}
    />
  );
}
