"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.);
  }
`;

const fragmentShader = `
  #define PI 3.14159265359

  uniform float u_ratio;
  uniform vec2 u_cursor;
  uniform float u_stop_time;
  uniform float u_clean;
  uniform vec2 u_stop_randomizer;

  uniform sampler2D u_texture;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
  }

  float get_flower_shape(vec2 _p, float _pet_n, float _angle, float _outline) {
      _angle *= 3.;
      _p = vec2(_p.x * cos(_angle) - _p.y * sin(_angle),
                _p.x * sin(_angle) + _p.y * cos(_angle));
      float a = atan(_p.y, _p.x);
      float flower_sectoral_shape = pow(abs(sin(a * _pet_n)), .4) + .25;
      vec2 flower_size_range = vec2(.08, .2);
      float size = flower_size_range[0] + u_stop_randomizer[0] * flower_size_range[1];
      float flower_radial_shape = pow(length(_p) / size, 2.);
      flower_radial_shape -= .1 * sin(8. * a);
      flower_radial_shape = max(.1, flower_radial_shape);
      flower_radial_shape += smoothstep(0., 0.03, -_p.y + .2 * abs(_p.x));
      float grow_time = step(.25, u_stop_time) * pow(u_stop_time, .3);
      float flower_shape = 1. - smoothstep(0., flower_sectoral_shape, _outline * flower_radial_shape / max(grow_time, 1e-4));
      flower_shape *= step(1e-4, grow_time) * (1. - step(1., grow_time));
      return flower_shape;
  }

  float get_stem_shape(vec2 _p, vec2 _uv, float _w, float _angle) {
      _w = max(.006, _w);
      float x_offset = _p.y * sin(_angle);
      x_offset *= pow(3. * _uv.y, 2.);
      _p.x -= x_offset;
      float noise_power = .5;
      float cursor_horizontal_noise = noise_power * snoise(2. * _uv * u_stop_randomizer[0]);
      cursor_horizontal_noise *= pow(dot(_p.y, _p.y), .6);
      cursor_horizontal_noise *= pow(dot(_uv.y, _uv.y), .3);
      _p.x += cursor_horizontal_noise;
      float left = smoothstep(-_w, 0., _p.x);
      float right = 1. - smoothstep(0., _w, _p.x);
      float stem_shape = left * right;
      float grow_time = 1. - smoothstep(0., .2, u_stop_time);
      float stem_top_mask = smoothstep(0., pow(grow_time, .5), .03 -_p.y);
      stem_shape *= stem_top_mask;
      stem_shape *= (1. - step(.17, u_stop_time));
      return stem_shape;
  }

// Inside fragmentShader:

void main() {
    vec4 prevFrame = texture2D(u_texture, vUv);
    
    // Tailwind bg-amber-50 (#fffbeb) in normalized WebGL float values
    vec3 amber50 = vec3(1.0, 0.984, 0.922);
    
    // Use amber-50 as the unpainted base canvas color
    vec3 base = prevFrame.a < 0.01 ? amber50 : prevFrame.rgb;
    
    vec2 uv = vUv;
    uv.x *= u_ratio;
    vec2 cursor = vUv - u_cursor.xy;
    cursor.x *= u_ratio;
    
    vec3 stem_color = vec3(.1 + u_stop_randomizer[0] * .6, .6, .2);
    vec3 flower_color = vec3(.6 + .5 * u_stop_randomizer[1], .1, .9 - .5 * u_stop_randomizer[1]);
    float angle = .5 * (u_stop_randomizer[0] - .5);

    float stem_shape = get_stem_shape(cursor, uv, .008, angle);
    stem_shape += get_stem_shape(cursor + vec2(0., .2 + .5 * u_stop_randomizer[0]), uv, .008, angle);
    float stem_mask = 1. - get_stem_shape(cursor, uv, .01, angle);
    stem_mask -= get_stem_shape(cursor + vec2(0., .2 + .5 * u_stop_randomizer[0]), uv, .01, angle);

    float petals_back_number = 1. + floor(u_stop_randomizer[0] * 2.);
    float angle_offset = -(2. * step(0., angle) - 1.) * .1 * u_stop_time;
    float flower_back_shape = get_flower_shape(cursor, petals_back_number, angle + angle_offset, 1.5);
    float flower_back_mask = 1. - get_flower_shape(cursor, petals_back_number, angle + angle_offset, 1.6);

    float petals_front_number = 2. + floor(u_stop_randomizer[1] * 2.);
    float flower_front_shape = get_flower_shape(cursor, petals_front_number, angle, 1.);
    float flower_front_mask = 1. - get_flower_shape(cursor, petals_front_number, angle, .95);

    vec3 color = base;
    color *= stem_mask;
    color *= flower_back_mask;
    color *= flower_front_mask;
    color += (stem_shape * stem_color);
    color += (flower_back_shape * (flower_color + vec3(0., .8 * u_stop_time, 0.)));
    color += (flower_front_shape * flower_color);
    color.r *= 1. - (.5 * flower_back_shape * flower_front_shape);
    color.b *= 1. - (flower_back_shape * flower_front_shape);

    // Fade background back to amber-50 when cleanCanvas() is triggered
    color = mix(amber50, color, u_clean);

    gl_FragColor = vec4(color, 1.0);
}    
    `;

export default function FlowerCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    clicked: true,
    vanishCanvas: false,
  });

  const cleanCanvas = () => {
    pointerRef.current.vanishCanvas = true;
    setTimeout(() => {
      pointerRef.current.vanishCanvas = false;
    }, 50);
  };

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const containerEl = containerRef.current;
    if (!canvasEl || !containerEl) return;

    let isTouchScreen = false;
    let animFrameId: number;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      alpha: true,
    });

    const sceneShader = new THREE.Scene();
    const sceneBasic = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    const clock = new THREE.Clock();

    let renderTargets = [
      new THREE.WebGLRenderTarget(1, 1),
      new THREE.WebGLRenderTarget(1, 1),
    ];

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_stop_time: { value: 0 },
        u_stop_randomizer: {
          value: new THREE.Vector2(Math.random(), Math.random()),
        },
        u_cursor: {
          value: new THREE.Vector2(pointerRef.current.x, pointerRef.current.y),
        },
        u_ratio: { value: containerEl.clientWidth / containerEl.clientHeight },
        u_texture: { value: null },
        u_clean: { value: 1 },
      },
      vertexShader,
      fragmentShader,
    });

    const basicMaterial = new THREE.MeshBasicMaterial();
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeBasic = new THREE.Mesh(planeGeometry, basicMaterial);
    const planeShader = new THREE.Mesh(planeGeometry, shaderMaterial);

    sceneBasic.add(planeBasic);
    sceneShader.add(planeShader);

    // Initialize initial canvas background state to clean white
    renderer.setRenderTarget(renderTargets[0]);
    renderer.setClearColor(0xffffff, 1.0);
    renderer.clear();
    renderer.setRenderTarget(renderTargets[1]);
    renderer.clear();
    renderer.setRenderTarget(null);

    const updateSize = () => {
      const width = containerEl.clientWidth;
      const height = containerEl.clientHeight;

      shaderMaterial.uniforms.u_ratio.value = width / height;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);

      const pixelRatio = renderer.getPixelRatio();
      const renderWidth = Math.round(width * pixelRatio);
      const renderHeight = Math.round(height * pixelRatio);
      renderTargets[0].setSize(renderWidth, renderHeight);
      renderTargets[1].setSize(renderWidth, renderHeight);
    };

    updateSize();

    const handleResize = () => {
      updateSize();
      cleanCanvas();
    };

    const handleClick = (e: MouseEvent) => {
      if (!isTouchScreen) {
        const rect = containerEl.getBoundingClientRect();
        pointerRef.current.x = (e.clientX - rect.left) / rect.width;
        pointerRef.current.y = (e.clientY - rect.top + 40) / rect.height;
        pointerRef.current.clicked = true;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      isTouchScreen = true;
      const rect = containerEl.getBoundingClientRect();
      const touch = e.targetTouches[0];
      pointerRef.current.x = (touch.clientX - rect.left) / rect.width;
      pointerRef.current.y = (touch.clientY - rect.top) / rect.height;
      pointerRef.current.clicked = true;
    };

    window.addEventListener("resize", handleResize);
    containerEl.addEventListener("click", handleClick);
    containerEl.addEventListener("touchstart", handleTouchStart);

    const initialTimeout = setTimeout(() => {
      pointerRef.current.x = 0.5;
      pointerRef.current.y = 0.5;
      pointerRef.current.clicked = true;
    }, 700);

    const render = () => {
      const pointer = pointerRef.current;
      shaderMaterial.uniforms.u_clean.value = pointer.vanishCanvas ? 0 : 1;
      shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture;

      if (pointer.clicked) {
        shaderMaterial.uniforms.u_cursor.value = new THREE.Vector2(
          pointer.x,
          1 - pointer.y
        );
        shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector2(
          Math.random(),
          Math.random()
        );
        shaderMaterial.uniforms.u_stop_time.value = 0;
        pointer.clicked = false;
      }
      shaderMaterial.uniforms.u_stop_time.value += clock.getDelta();

      renderer.setRenderTarget(renderTargets[1]);
      renderer.render(sceneShader, camera);
      basicMaterial.map = renderTargets[1].texture;
      renderer.setRenderTarget(null);
      renderer.render(sceneBasic, camera);

      const tmp = renderTargets[0];
      renderTargets[0] = renderTargets[1];
      renderTargets[1] = tmp;

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearTimeout(initialTimeout);
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      containerEl.removeEventListener("click", handleClick);
      containerEl.removeEventListener("touchstart", handleTouchStart);
      renderer.dispose();
      planeGeometry.dispose();
      shaderMaterial.dispose();
      basicMaterial.dispose();
      renderTargets[0].dispose();
      renderTargets[1].dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 w-full h-40 bg-transparent overflow-hidden z-50 flex items-center justify-between px-6 pointer-events-auto"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none mix-blend-multiply"
      />
      <div
        onClick={(e) => {
          e.stopPropagation();
          cleanCanvas();
        }}
        onTouchStart={(e) => e.stopPropagation()}
        className="relative z-10 font-sans text-sm text-gray-800 select-none cursor-pointer underline opacity-70 hover:opacity-100 transition-opacity"
      >
        clean the screen
      </div>
      <div className="relative z-10 text-gray-800 text-sm sm:text-base select-none pointer-events-none font-sans">
        Click To Add Flowers
      </div>
    </div>
  );
}