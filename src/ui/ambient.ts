// Fondo vivo: shader WebGL con esporas y luciérnagas que flotan, transparente sobre el bosque
// pintado del fondo (011). Va detrás de la interfaz, a media resolución. Con movimiento reducido
// pinta un solo cuadro; se pausa al ocultar la pestaña. Si no hay WebGL, queda solo el fondo pintado.
import { vec3, type ColorToken } from '../theme';

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_glow;
uniform vec3 u_spore;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  // Capa transparente sobre el bosque pintado (011): solo esporas y luciérnagas que suben despacio.
  vec3 col = vec3(0.0);
  float alpha = 0.0;
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
    float a = exp(-dot(d, d) * size) * twinkle * 0.85;
    col += tint * a; // premultiplicado
    alpha += a;
  }
  gl_FragColor = vec4(min(col, vec3(1.0)), clamp(alpha, 0.0, 1.0));
}`;

export function mountAmbient(canvas: HTMLCanvasElement): void {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
  if (!gl) return;
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
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
    ['u_spore', 'mycelium'],
  ];
  for (const [name, token] of colors) gl.uniform3fv(u(name), vec3(token));
  const uRes = u('u_res');
  const uTime = u('u_time');

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
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (!reduce.matches && !document.hidden) raf = requestAnimationFrame(frame);
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
}
