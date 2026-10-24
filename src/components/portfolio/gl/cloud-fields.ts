import * as THREE from "three";

const SIZE = 64;

// The recipe from scripts/generate-cloud-noise.mjs, evaluated on the GPU:
// red is tiling value noise, green to alpha are Worley bands of 4, 8 and 16
// cells. The integer hash is bit-identical to the script's Math.imul version.
const fragment = `
precision highp float;
precision highp int;
uniform float layer;
out vec4 color;
float hash(ivec3 c, uint seed) {
  uvec3 u = uvec3(c);
  uint n = (u.x * 374761393u) ^ (u.y * 668265263u) ^ (u.z * 2147483647u) ^ seed;
  n = (n ^ (n >> 13u)) * 1274126177u;
  return float(n ^ (n >> 16u)) / 4294967296.;
}
float worley(vec3 p, int cells) {
  ivec3 i = ivec3(floor(p));
  float d = 3.;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    ivec3 o = i + ivec3(x, y, z);
    ivec3 c = (o + cells) % cells;
    vec3 q = vec3(o) + vec3(hash(c, 71u), hash(c, 239u), hash(c, 997u)) - p;
    d = min(d, dot(q, q));
  }
  return min(1., sqrt(d));
}
float value(vec3 p) {
  ivec3 i = ivec3(floor(p));
  vec3 f = p - vec3(i);
  vec3 s = f * f * f * (f * (f * 6. - 15.) + 10.);
  float result = 0.;
  for (int z = 0; z <= 1; z++) for (int y = 0; y <= 1; y++) for (int x = 0; x <= 1; x++) {
    ivec3 c = (i + ivec3(x, y, z) + 8) % 8;
    vec3 w = mix(1. - s, s, vec3(x, y, z));
    result += hash(c, 427u) * w.x * w.y * w.z;
  }
  return result;
}
void main() {
  vec3 p = vec3(floor(gl_FragCoord.xy), layer) / ${SIZE}.;
  color = vec4(value(p * 8.), worley(p * 4., 4), worley(p * 8., 8), worley(p * 16., 16));
}`;

const fields = new WeakMap<THREE.WebGLRenderer, THREE.Data3DTexture>();

/** Tileable 64³ cloud density fields, made once per renderer in a few draw calls. */
export function cloudFields(renderer: THREE.WebGLRenderer) {
  const cached = fields.get(renderer);
  if (cached) return cached;
  const target = new THREE.WebGL3DRenderTarget(SIZE, SIZE, SIZE, { depthBuffer: false, type: THREE.UnsignedByteType, format: THREE.RGBAFormat });
  const texture = target.texture;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.generateMipmaps = false;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const material = new THREE.RawShaderMaterial({
    vertexShader: "in vec3 position;\nvoid main() { gl_Position = vec4(position, 1.); }",
    fragmentShader: fragment,
    glslVersion: THREE.GLSL3,
    uniforms: { layer: { value: 0 } },
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene().add(mesh);
  const camera = new THREE.Camera();
  const generate = () => {
    const previous = renderer.getRenderTarget();
    for (let layer = 0; layer < SIZE; layer++) {
      material.uniforms.layer.value = layer;
      renderer.setRenderTarget(target, layer);
      renderer.render(scene, camera);
    }
    renderer.setRenderTarget(previous);
  };
  generate();
  // A lost context takes rendered contents with it; the recipe makes them again.
  renderer.domElement.addEventListener("webglcontextrestored", generate);
  fields.set(renderer, texture);
  return texture;
}
