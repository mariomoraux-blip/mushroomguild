// Fondo vivo: shader WebGL con luz cálida entre las copas, haces de luz, esporas que flotan y grano
// de papel. Va detrás de la interfaz, a media resolución. Con movimiento reducido pinta un solo
// cuadro; se pausa al ocultar la pestaña. Si no hay WebGL, queda el fondo CSS.
// Es parte del escenario: recibe la luz de la estación y la saturación del progreso (003).
import { mixGrade, type Grade } from '../scenes/light';
import { LIGHT_TRANSITION_MS, vec3, type ColorToken } from '../theme';

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_top;
uniform vec3 u_bottom;
uniform vec3 u_glow;
uniform vec3 u_leaf;
uniform vec3 u_leafDark;
uniform vec3 u_spore;
uniform vec3 u_tint;
uniform float u_bright;
uniform float u_sat;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec3 col = mix(u_bottom, u_top, smoothstep(0.0, 1.0, uv.y));

  // Copas del bosque arriba: manchas de follaje con borde orgánico.
  float canopy = fbm(vec2(uv.x * aspect * 2.2, uv.y * 2.0) + vec2(0.0, u_time * 0.01));
  float edge = smoothstep(0.80, 0.92, uv.y + canopy * 0.22);
  col = mix(col, mix(u_leaf, u_leafDark, canopy), edge * 0.55);

  // Haces de luz que entran entre las hojas.
  float shaft = sin((uv.x * aspect * 1.4 - uv.y * 0.9) * 7.0 + u_time * 0.12) * 0.5 + 0.5;
  shaft = pow(shaft, 6.0) * smoothstep(0.15, 0.95, uv.y) * (0.6 + 0.4 * noise(uv * 3.0 + u_time * 0.05));
  col = mix(col, u_glow, shaft * 0.14);

  // Pasto lejano abajo.
  float grass = fbm(vec2(uv.x * aspect * 6.0, uv.y * 3.0));
  col = mix(col, u_leaf, smoothstep(0.16, 0.0, uv.y - grass * 0.06) * 0.35);

  // Esporas y luciérnagas que suben despacio.
  for (int i = 0; i < 28; i++) {
    float fi = float(i);
    float speed = 0.008 + 0.012 * hash(vec2(fi, 3.0));
    vec2 p = vec2(
      fract(hash(vec2(fi, 1.0)) + sin(u_time * 0.07 + fi) * 0.025),
      fract(hash(vec2(fi, 2.0)) + u_time * speed)
    );
    vec2 d = (uv - p) * vec2(aspect, 1.0);
    float size = 900.0 + 2600.0 * hash(vec2(fi, 4.0));
    float twinkle = 0.55 + 0.45 * sin(u_time * (1.0 + hash(vec2(fi, 5.0))) + fi * 2.7);
    vec3 tint = mod(fi, 3.0) < 1.0 ? u_spore : u_glow;
    col += tint * exp(-dot(d, d) * size) * twinkle * 0.55;
  }

  // Luz de la estación: saturación del progreso, después tinte × brillo.
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, u_sat) * u_tint * u_bright;

  // Viñeta suave y grano de papel.
  vec2 c = uv - 0.5;
  col *= 1.0 - dot(c, c) * 0.12;
  col += (hash(gl_FragCoord.xy + fract(u_time) * 17.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}`;

/** Monta el fondo vivo. Devuelve cómo cambiarle la luz (no hace nada si no hay WebGL). */
export function mountAmbient(canvas: HTMLCanvasElement): (g: Grade) => void {
  const none = () => {};
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return none;
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return none;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return none;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const colors: [string, ColorToken][] = [
    ['u_glow', 'glow'],
    ['u_leaf', 'leaf'],
    ['u_leafDark', 'leafDark'],
    ['u_spore', 'mycelium'],
  ];
  for (const [name, token] of colors) gl.uniform3fv(u(name), vec3(token));
  const uRes = u('u_res');
  const uTime = u('u_time');
  const uTop = u('u_top');
  const uBottom = u('u_bottom');
  const uTint = u('u_tint');
  const uBright = u('u_bright');
  const uSat = u('u_sat');
  const setGrade = (g: Grade) => {
    gl.uniform3fv(uTop, [...g.skyTop]);
    gl.uniform3fv(uBottom, [...g.skyBottom]);
    gl.uniform3fv(uTint, [...g.tint]);
    gl.uniform1f(uBright, g.brightness);
    gl.uniform1f(uSat, g.saturation);
  };
  gl.uniform3fv(uTop, vec3('peach'));
  gl.uniform3fv(uBottom, vec3('cream'));
  gl.uniform3fv(uTint, [1, 1, 1]);
  gl.uniform1f(uBright, 1);
  gl.uniform1f(uSat, 1);
  // Transición de luz: de `from` a `to` desde `since` (ms).
  let from: Grade | null = null;
  let to: Grade | null = null;
  let since = 0;

  const resize = () => {
    const scale = 0.5; // media resolución: es un fondo difuso
    canvas.width = Math.max(1, Math.round(innerWidth * scale));
    canvas.height = Math.max(1, Math.round(innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const start = performance.now();
  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    raf = 0;
    if (now - last >= 33) {
      // ~30 fps: el fondo no necesita más.
      last = now;
      gl.uniform1f(uTime, (now - start) / 1000);
      if (from && to) {
        const t = Math.min(1, (now - since) / LIGHT_TRANSITION_MS);
        setGrade(mixGrade(from, to, t));
        if (t >= 1) from = null;
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if ((!reduce.matches || from) && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  resize();
  gl.uniform1f(uTime, 12.0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  addEventListener('resize', () => {
    resize();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    kick();
  });
  document.addEventListener('visibilitychange', kick);
  reduce.addEventListener('change', kick);
  canvas.dataset.ready = 'true';
  if (!reduce.matches) kick();

  return (g: Grade) => {
    if (!to || reduce.matches) {
      from = null;
      to = g;
      setGrade(g);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }
    from = from && to ? mixGrade(from, to, Math.min(1, (performance.now() - since) / LIGHT_TRANSITION_MS)) : to;
    to = g;
    since = performance.now();
    kick();
  };
}
