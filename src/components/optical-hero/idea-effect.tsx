"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * .5 + .5;
  gl_Position = vec4(position, 0., 1.);
}`;

const fragmentSource = `
precision highp float;
uniform sampler2D ink;
uniform vec2 size;
uniform vec2 lens;
uniform vec3 color;
uniform float strength;
uniform float phase;
varying vec2 uv;
void main() {
  vec2 pixel = uv * size;
  vec2 q = pixel - lens;
  float radius = max(size.y * .48, 20.);
  float rn = length(q) / radius;
  float envelope = 1. - smoothstep(.25, 1., rn);
  float ripple = sin(rn * 13. - phase) * .048;
  float mag = 1. + strength * envelope * (.075 * rn * rn + ripple);
  vec2 source = (lens + q / mag) / size;
  vec2 split = q / max(length(q), 1.) * .85 / size * strength * envelope;
  float r = texture2D(ink, source + split).a;
  float g = texture2D(ink, source).a;
  float b = texture2D(ink, source - split).a;
  float alpha = max(r, max(g, b));
  vec3 edge = vec3(r, g, b);
  vec3 chroma = mix(color * alpha, edge, .28 * strength);
  gl_FragColor = vec4(chroma, alpha);
}`;

export function IdeaEffect() {
  const word = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const arrived = useRef(false);
  const reducedMotion = useReducedMotion();
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    let frame = 0;
    const afterLoad = () => {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setPainted(true));
      });
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", afterLoad);
    };
  }, []);

  useEffect(() => {
    const element = word.current;
    const surface = canvas.current;
    if (!element || !surface || reducedMotion || !painted) return;
    const gl = surface.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return;

    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    const shaders: WebGLShader[] = [];
    let frame = 0;
    let disposed = false;
    let ready = false;
    let visible = true;
    let hovering = false;
    let strength = 0;
    let elapsed = arrived.current ? 1100 : 0;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    let lensX = 0;
    let lensY = 0;
    let targetX = 0;
    let targetY = 0;
    const padding = 12;

    function restoreText() {
      element!.removeAttribute("data-lens-ready");
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function dispose() {
      disposed = true;
      restoreText();
      shaders.forEach((shader) => gl!.deleteShader(shader));
      gl!.deleteTexture(texture);
      gl!.deleteBuffer(buffer);
      gl!.deleteProgram(program);
    }

    if (!program || !buffer || !texture) {
      dispose();
      return;
    }
    try {
      for (const [type, source] of [
        [gl.VERTEX_SHADER, vertexSource],
        [gl.FRAGMENT_SHADER, fragmentSource],
      ] as const) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Shader allocation failed");
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw new Error("Shader compilation failed");
        gl.attachShader(program, shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Shader linking failed");
    } catch {
      dispose();
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const uniforms = {
      size: gl.getUniformLocation(program, "size"),
      lens: gl.getUniformLocation(program, "lens"),
      color: gl.getUniformLocation(program, "color"),
      strength: gl.getUniformLocation(program, "strength"),
      phase: gl.getUniformLocation(program, "phase"),
    };

    function draw(time: number) {
      frame = 0;
      if (
        !ready ||
        disposed ||
        !visible ||
        document.hidden ||
        gl!.isContextLost()
      )
        return;
      const delta = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;
      elapsed = Math.min(1100, elapsed + delta);
      const opening = elapsed < 1100;
      const targetStrength = opening
        ? Math.sin((elapsed / 1100) * Math.PI)
        : hovering
          ? 0.8
          : 0;
      strength += (targetStrength - strength) * (1 - Math.exp(-delta / 45));
      lensX += (targetX - lensX) * (1 - Math.exp(-delta / 65));
      lensY += (targetY - lensY) * (1 - Math.exp(-delta / 65));
      if (!opening && !hovering && strength < 0.008) strength = 0;
      gl!.uniform2f(
        uniforms.lens,
        opening ? width * (0.2 + (elapsed / 1100) * 0.65) : lensX,
        opening ? height * 0.52 : lensY,
      );
      gl!.uniform1f(uniforms.strength, strength);
      gl!.uniform1f(uniforms.phase, elapsed / 180);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (gl!.getError() !== gl!.NO_ERROR) {
        ready = false;
        restoreText();
        return;
      }
      if (strength === 0) restoreText();
      else element!.setAttribute("data-lens-ready", "true");
      if (!opening) arrived.current = true;
      const moving =
        Math.abs(lensX - targetX) + Math.abs(lensY - targetY) > 0.1;
      if (
        opening ||
        Math.abs(targetStrength - strength) > 0.008 ||
        (hovering && moving)
      )
        frame = requestAnimationFrame(draw);
    }

    function wake() {
      if (frame || !ready || disposed || !visible || document.hidden) return;
      lastTime = 0;
      frame = requestAnimationFrame(draw);
    }

    function rasterize() {
      if (disposed || gl!.isContextLost()) return;
      const style = getComputedStyle(element!);
      const bounds = element!.getBoundingClientRect();
      width = bounds.width + padding * 2;
      height = bounds.height + padding * 2;
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 2;
      const bitmap = document.createElement("canvas");
      bitmap.width = Math.ceil(width * scale);
      bitmap.height = Math.ceil(height * scale);
      const context = bitmap.getContext("2d");
      if (!context) return;
      context.scale(scale, scale);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.letterSpacing = style.letterSpacing;
      context.fillStyle = "white";
      const metrics = context.measureText("idea");
      const baseline =
        (bounds.height -
          metrics.fontBoundingBoxAscent -
          metrics.fontBoundingBoxDescent) /
          2 +
        metrics.fontBoundingBoxAscent;
      context.fillText("idea", padding, padding + baseline);
      surface!.width = Math.ceil(width * Math.min(devicePixelRatio || 1, 2));
      surface!.height = Math.ceil(height * Math.min(devicePixelRatio || 1, 2));
      gl!.viewport(0, 0, surface!.width, surface!.height);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        bitmap,
      );
      const rgb = style.color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number);
      gl!.uniform3f(uniforms.color, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
      gl!.uniform2f(uniforms.size, width, height);
      lensX = targetX = width * 0.7;
      lensY = targetY = height * 0.5;
      ready = true;
      wake();
    }

    function pointerMove(event: PointerEvent) {
      if (
        event.pointerType !== "mouse" ||
        !matchMedia("(hover: hover) and (pointer: fine)").matches
      )
        return;
      const bounds = element!.getBoundingClientRect();
      targetX = event.clientX - bounds.left + padding;
      targetY = height - (event.clientY - bounds.top + padding);
      hovering = true;
      wake();
    }
    function pointerLeave() {
      hovering = false;
      wake();
    }
    function visibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else wake();
    }
    function contextLost(event: Event) {
      event.preventDefault();
      ready = false;
      restoreText();
    }
    const resize = new ResizeObserver(rasterize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    document.fonts.ready.then(() => {
      if (disposed) return;
      rasterize();
      resize.observe(element);
    });
    intersection.observe(element);
    document.fonts.addEventListener("loadingdone", rasterize);
    element.addEventListener("pointermove", pointerMove);
    element.addEventListener("pointerleave", pointerLeave);
    document.addEventListener("visibilitychange", visibilityChange);
    surface.addEventListener("webglcontextlost", contextLost);
    return () => {
      resize.disconnect();
      intersection.disconnect();
      document.fonts.removeEventListener("loadingdone", rasterize);
      element.removeEventListener("pointermove", pointerMove);
      element.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", visibilityChange);
      surface.removeEventListener("webglcontextlost", contextLost);
      dispose();
    };
  }, [reducedMotion, painted]);

  return (
    <span className="idea-word" ref={word}>
      <span className="idea-fallback">idea</span>
      <canvas ref={canvas} aria-hidden="true" />
    </span>
  );
}
