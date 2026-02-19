<script lang="ts">
  let canvasEl: HTMLCanvasElement;
  let ready = $state(false);

  const VERTEX_SHADER = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const FRAGMENT_SHADER = /* glsl */ `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.08;

      float n1 = snoise(uv * 1.2 + vec2(t * 0.3, t * 0.15));
      float n2 = snoise(uv * 2.2 + vec2(-t * 0.2, t * 0.35) + n1 * 0.45);
      float n3 = snoise(uv * 0.9 + vec2(t * 0.15, -t * 0.25) + n2 * 0.35);

      float noise = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
      noise = noise * 0.5 + 0.5;

      float hue = 0.58 + noise * 0.20 + t * 0.04;

      vec3 hsv = vec3(fract(hue), 0.35, 0.70);
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(hsv.xxx + K.xyz) * 6.0 - K.www);
      vec3 color = hsv.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), hsv.y);

      vec3 sky = vec3(0.03, 0.03, 0.06);
      float bandMask = smoothstep(0.0, 0.42, uv.y) * smoothstep(1.0, 0.52, uv.y);
      float glow = smoothstep(0.28, 0.72, noise);
      color = mix(sky, color, glow * bandMask * 0.75);

      vec2 c = uv - 0.5;
      float vignette = 1.0 - dot(c, c) * 1.6;
      color *= clamp(vignette, 0.0, 1.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  async function initScene(canvas: HTMLCanvasElement) {
    const { Clock, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer } =
      await import('three');

    const renderer = new WebGLRenderer({ canvas, antialias: false });
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new Vector2() }
    };

    scene.add(
      new Mesh(
        new PlaneGeometry(2, 2),
        new ShaderMaterial({ vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER, uniforms })
      )
    );

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }

    resize();
    window.addEventListener('resize', resize);

    const clock = new Clock();
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    }

    animate();
    ready = true;

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  }

  $effect(() => {
    const cleanup = initScene(canvasEl);
    return () => {
      cleanup.then((dispose) => dispose());
    };
  });
</script>

<!-- Dark fallback behind canvas so there's no white flash -->
<div class="fixed inset-0 -z-10 bg-[#080810]">
  <canvas
    bind:this={canvasEl}
    class="h-full w-full transition-[filter,opacity] duration-1000"
    class:opacity-0={!ready}
    class:opacity-100={ready}
    class:blur-lg={!ready}
    class:blur-0={ready}
  ></canvas>
</div>
