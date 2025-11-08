import { useEffect, useRef } from "react";

const THREE_CDN_URL = "https://unpkg.com/three@0.161.0/build/three.min.js";

const globalWithThree = () => window as typeof window & { THREE?: any };

let threeLoader: Promise<any> | null = null;

const loadThree = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  const global = globalWithThree();
  if (global.THREE) return Promise.resolve(global.THREE);

  if (!threeLoader) {
    threeLoader = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${THREE_CDN_URL}"]`,
      );

      if (existingScript && global.THREE) {
        resolve(global.THREE);
        return;
      }

      const script = existingScript ?? document.createElement("script");
      script.src = THREE_CDN_URL;
      script.async = true;
      script.onload = () => {
        if (global.THREE) {
          resolve(global.THREE);
        } else {
          reject(new Error("Three.js failed to load"));
        }
      };
      script.onerror = () => reject(new Error("Unable to load Three.js"));

      if (!existingScript) {
        document.body.appendChild(script);
      }
    });
  }

  return threeLoader;
};

const NebulaCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let animationFrame = 0;
    const disposables: Array<{ dispose: () => void }> = [];

    const setupScene = async () => {
      const THREE = await loadThree();
      if (!THREE || disposed || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setClearColor("#050813", 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 1.8;

      const ambientLight = new THREE.AmbientLight("#88a6ff", 0.3);
      const lightA = new THREE.PointLight("#88a6ff", 0.7, 6);
      lightA.position.set(1.5, 1.2, 1.2);
      const lightB = new THREE.PointLight("#2f3b80", 0.5, 6);
      lightB.position.set(-1.1, -0.7, 0.8);

      scene.add(ambientLight, lightA, lightB);

      const uniforms = {
        uTime: { value: 0 },
        uIntensity: { value: 0.6 },
        uInnerColor: { value: new THREE.Color("#bed8ff") },
        uOuterColor: { value: new THREE.Color("#0b1742") },
        uAccentColor: { value: new THREE.Color("#5474ff") },
      };

      const fragmentShader = `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uIntensity;
        uniform vec3 uInnerColor;
        uniform vec3 uOuterColor;
        uniform vec3 uAccentColor;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);

          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;

          for (int i = 0; i < 6; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.55;
          }

          return value;
        }

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          float len = length(uv);

          float swirl = atan(uv.y, uv.x);
          float radial = smoothstep(1.15, 0.2, len);

          float time = uTime * 0.08;
          float nebulaLayer = fbm(uv * 2.4 + vec2(time * 0.35, -time * 0.2));
          float nebulaDetail = fbm(uv * 5.5 - vec2(time * 0.65, time * 0.45));

          float glow = pow(1.0 - len, 3.4);
          float accent = smoothstep(0.45, 0.13, abs(len - 0.32 + sin(swirl * 2.2 - time * 0.45) * 0.12));
          float gas = mix(nebulaLayer, nebulaDetail, 0.5);

          vec3 baseColor = mix(uOuterColor, uInnerColor, clamp(gas * radial * uIntensity + glow * 0.6, 0.0, 1.0));
          vec3 accentColor = uAccentColor * accent * 0.65;
          vec3 color = baseColor + accentColor + glow * 1.2;

          color = mix(color, uOuterColor * 0.35, smoothstep(1.4, 0.7, len));

          gl_FragColor = vec4(color, clamp(radial + glow * 1.2, 0.0, 1.0));
        }
      `;

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms,
        fragmentShader,
        vertexShader,
        transparent: true,
        depthWrite: false,
      });

      const nebulaPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), nebulaMaterial);
      nebulaPlane.position.set(0, 0, -0.2);
      scene.add(nebulaPlane);
      disposables.push(nebulaMaterial, nebulaPlane.geometry);

      const starGeometry = new THREE.BufferGeometry();
      const starCount = 900;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i += 1) {
        const radius = Math.random() * 1.6 + 0.1;
        const angle = Math.random() * Math.PI * 2;
        const depth = (Math.random() - 0.5) * 1.2;
        const offset = i * 3;

        positions[offset] = Math.cos(angle) * radius * 0.8;
        positions[offset + 1] = Math.sin(angle) * radius * 0.8;
        positions[offset + 2] = depth;

        const twinkle = 0.75 + Math.random() * 0.25;
        colors[offset] = 0.8 * twinkle;
        colors[offset + 1] = 0.86 * twinkle;
        colors[offset + 2] = 1.0 * twinkle;
      }

      starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const starMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const stars = new THREE.Points(starGeometry, starMaterial);
      stars.position.set(0, 0, -0.35);
      scene.add(stars);
      disposables.push(starGeometry, starMaterial);

      const glowGeometry = new THREE.PlaneGeometry(1.6, 1.6);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#3054ff"),
        transparent: true,
        opacity: 0.18,
      });

      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.set(0.18, -0.12, -0.45);
      glow.scale.set(2.8, 2.8, 1);
      scene.add(glow);
      disposables.push(glowGeometry, glowMaterial);

      const resizeRenderer = () => {
        if (!canvas.parentElement) return;
        const { clientWidth, clientHeight } = canvas.parentElement;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      };

      resizeRenderer();
      window.addEventListener("resize", resizeRenderer);

      const animate = (time: number) => {
        if (disposed) return;
        uniforms.uTime.value = time * 0.001;
        stars.rotation.z = uniforms.uTime.value * 0.2;
        starMaterial.opacity = 0.7 + Math.sin(uniforms.uTime.value * 1.2) * 0.1;
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);

      disposables.push({ dispose: () => window.removeEventListener("resize", resizeRenderer) });
      disposables.push({ dispose: () => renderer.dispose() });
    };

    setupScene();

    return () => {
      disposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      disposables.forEach((item) => {
        if (typeof item.dispose === "function") item.dispose();
      });
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050813]/35 to-[#050813]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(61,97,255,0.32),transparent_55%)]" />
    </div>
  );
};

export default NebulaCanvas;
