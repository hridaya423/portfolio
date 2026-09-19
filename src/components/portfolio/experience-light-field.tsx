"use client";

import { useEffect, useRef } from "react";

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 resolution;
uniform vec2 size;
uniform float slit;
uniform int count;
uniform sampler2D rows;
out vec4 color;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
void main() {
  vec2 p = vec2(gl_FragCoord.x / resolution.x, 1.0 - gl_FragCoord.y / resolution.y) * size;
  float scale = 1536.0 / size.x;
  p *= scale;
  float height = size.y * scale;
  float seam = slit * scale;
  vec3 background = vec3(239.0/255.0,239.0/255.0,240.0/255.0);
  vec3 surface = background;
  float cloud = noise(p * .004) * .6 + noise(p * .013) * .4;
  surface += (cloud - .5) * .006;
  float grain = (hash(p * 1.37) - .5) * .005;
  surface += grain;
  float first = texelFetch(rows, ivec2(0,0), 0).x * scale;
  vec4 lastRow = texelFetch(rows, ivec2(count-1,0), 0) * scale;
  float beginning = max(20.0, first - 110.0);
  float ending = lastRow.x + lastRow.y * .65;
  float along = smoothstep(beginning, beginning + 90.0, p.y) * (1.0 - smoothstep(ending - 35.0, ending + 100.0, p.y));
  float bow = 3.0 * sin(clamp((p.y-beginning)/(ending-beginning),0.0,1.0)*3.14159);
  float dx = p.x - seam + bow;
  float recess = exp(-pow((dx + 4.0) / 3.4, 2.0)) * along;
  float occlusion = exp(-pow((dx + 10.0) / 15.0, 2.0)) * along;
  surface -= recess * .17 + occlusion * .032;
  float lip = exp(-pow((dx - .7) / 1.35, 2.0)) * along;
  surface += vec3(.025,.022,.014) * lip;
  float emitted = 0.0;
  for (int i = 0; i < count; i++) {
    vec4 row = texelFetch(rows, ivec2(i,0), 0) * scale;
    float start = row.x + row.y * .11;
    float end = row.x + row.y * (i == 0 ? .43 : .36);
    float x = max(0.0, dx);
    float upper = start - x * .145;
    float lower = end + x * .64;
    float penumbra = 2.0 + x * .052;
    float visibility = smoothstep(upper - penumbra, upper + penumbra, p.y) * (1.0 - smoothstep(lower - penumbra * 1.7, lower + penumbra * 1.7, p.y));
    float falloff = exp(-x / 940.0);
    float bounce = exp(-x / 120.0) * exp(-pow((p.y - (start + end)*.5) / (row.y*.42),2.0));
    float nearSource = exp(-x / 270.0);
    float light = visibility * falloff * (.74 + nearSource * .26) * smoothstep(-1.0, 3.0, dx);
    float beamCenter = (upper + lower) * .5;
    float centerWidth = max(42.0, (lower-upper) * .48);
    float centerGlow = visibility * exp(-pow((p.y-beamCenter) / centerWidth, 2.0)) * exp(-x / 720.0);
    float shadowWidth = 11.0 + x * .045;
    float outsideLowerEdge = smoothstep(lower - penumbra * .2, lower + penumbra * .65, p.y);
    float edgeShadow = outsideLowerEdge * exp(-max(0.0, p.y-lower) / shadowWidth) * exp(-x / 1050.0) * smoothstep(1.0, 14.0, x);
    float lightTexture = (noise(p * .018) - .5) * .004 * visibility;
    surface += vec3(.082, .066, .019) * light;
    surface += vec3(.020, .015, .002) * centerGlow;
    surface += vec3(.017, .013, .003) * bounce * smoothstep(-2.0, 5.0, dx);
    surface += lightTexture;
    surface -= vec3(.021, .022, .024) * edgeShadow;
    float opening = smoothstep(start-5.0, start+5.0, p.y) * (1.0-smoothstep(end-5.0,end+5.0,p.y));
    emitted += opening;
  }
  float coreWidth = max(2.6, .95 * scale);
  float aperture = (1.0 - smoothstep(coreWidth * .45, coreWidth, abs(dx - 1.2))) * along;
  float emission = .95 + min(1.0, emitted) * .05;
  surface = mix(surface, vec3(1.0,.998,.972), aperture * emission);
  float halo = exp(-abs(dx - 1.2)/10.0) * along * (.8 + emitted * .2);
  surface += vec3(.044,.033,.009) * halo;
  float edge = max(160.0, 72.0 * scale);
  float fade = smoothstep(0.0, edge, p.y) * (1.0-smoothstep(height-edge*1.5,height,p.y));
  float sides = smoothstep(-180.0,240.0,p.x) * (1.0-smoothstep(1296.0,1716.0,p.x));
  color = vec4(mix(background, surface, fade*sides),1.0);
}
`;

export function ExperienceLightField({ count }: { count: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const section = canvas?.parentElement;
    if (!canvas || !section || !count) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl) return;
    let dispose = () => {};
    let stopped = false;

    function initialize() {
      if (!gl || !canvas || !section) return;
      let active = true;
      const shaders: WebGLShader[] = [];
      const program = gl.createProgram();
      if (!program) return;
      for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
        const shader = gl.createShader(type);
        if (!shader) {
          shaders.forEach(item => gl.deleteShader(item));
          gl.deleteProgram(program);
          return;
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error("Experience light shader:", gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          shaders.forEach(item => gl.deleteShader(item));
          gl.deleteProgram(program);
          return;
        }
        shaders.push(shader);
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      shaders.forEach(shader => gl.deleteShader(shader));
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Experience light program:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return;
      }
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const uniforms = Object.fromEntries(["resolution", "size", "slit", "count", "rows"].map(name => [name, gl.getUniformLocation(program, name)]));
      let frame = 0;
      const draw = () => {
        if (!active || stopped || gl.isContextLost()) return;
        const bounds = section.getBoundingClientRect();
        const entries = Array.from(section.querySelectorAll<HTMLElement>(".experience-entry"));
        if (!bounds.width || !bounds.height || !entries.length) return;
        const maximum = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number;
        const ratio = Math.min(devicePixelRatio, 2, maximum / bounds.height, maximum / bounds.width, Math.sqrt(8000000 / (bounds.width * bounds.height)));
        canvas.width = Math.round(bounds.width * ratio);
        canvas.height = Math.round(bounds.height * ratio);
        gl.viewport(0, 0, canvas.width, canvas.height);
        const data = new Float32Array(entries.length * 4);
        entries.forEach((entry, index) => {
          const box = entry.getBoundingClientRect();
          data[index * 4] = box.top - bounds.top;
          data[index * 4 + 1] = box.height;
        });
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, entries.length, 1, 0, gl.RGBA, gl.FLOAT, data);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform2f(uniforms.size, bounds.width, bounds.height);
        gl.uniform1f(uniforms.slit, bounds.width * (bounds.width < 480 ? .15 : .2018));
        gl.uniform1i(uniforms.count, entries.length);
        gl.uniform1i(uniforms.rows, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        canvas.dataset.ready = "true";
      };
      const schedule = () => { if (!active) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
      const observer = new ResizeObserver(schedule);
      observer.observe(section);
      window.addEventListener("resize", schedule);
      section.querySelectorAll(".experience-entry").forEach(entry => observer.observe(entry));
      document.fonts.ready.then(() => { if (!stopped) schedule(); });
      schedule();
      dispose = () => {
        active = false;
        window.removeEventListener("resize", schedule);
        cancelAnimationFrame(frame);
        observer.disconnect();
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      };
    }
    const lost = (event: Event) => { event.preventDefault(); delete canvas.dataset.ready; dispose(); };
    initialize();
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", initialize);
    return () => {
      stopped = true;
      dispose();
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", initialize);
    };
  }, [count]);

  return <canvas ref={ref} className="experience-light-field" aria-hidden="true" />;
}
