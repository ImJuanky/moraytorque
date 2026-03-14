// configurator.ts — 3D MT-07 Configurator con Three.js
import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

type ColorOption = 'black' | 'blue' | 'red';

interface ConfigState {
  color: ColorOption;
  stickers: boolean;
  sportExhaust: boolean;
}

const STORAGE_KEY = 'moray_config_v1';

const COLOR_MAP: Record<ColorOption, number> = {
  black: 0x1a1a1a,
  blue:  0x1565C0,
  red:   0xCC2200,
};

const COLOR_HEX: Record<ColorOption, string> = {
  black: '#1a1a1a',
  blue:  '#1565C0',
  red:   '#CC2200',
};

const COLOR_NAMES: Record<ColorOption, string> = {
  black: 'Negro mate',
  blue:  'Azul racing',
  red:   'Rojo sport',
};

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurator.html',
  styleUrl: './configurator.css'
})
export class Configurator implements AfterViewInit, OnDestroy {

  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  state: ConfigState = this.load();
  loading = true;
  loadProgress = 0;
  hasRotated = false;
  autoRotate = true;

  private THREE: any;
  private scene: any;
  private camera: any;
  private renderer: any;
  private motoMesh: any;
  private bodyMeshes: any[] = [];       // meshes de carrocería (cambian de color)
  private originalMaterials: Map<any, any> = new Map(); // materiales originales
  private animFrameId: number = 0;
  private resizeObserver: ResizeObserver | null = null;
  private rotY = 0;
  private rotX = 0.2;
  private radius = 5;

  constructor(private cartService: CartService, private ngZone: NgZone) {}

  ngAfterViewInit(): void { this.initThree(); }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.renderer?.dispose();
    this.resizeObserver?.disconnect();
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
      document.head.appendChild(s);
    });
  }

  private async initThree(): Promise<void> {
    try {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
      await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
    } catch (e) {
      console.error('Error cargando scripts Three.js:', e);
      this.ngZone.run(() => { this.loading = false; });
      return;
    }

    const THREE = (window as any).THREE;
    if (!THREE) { console.error('THREE no disponible'); this.ngZone.run(() => { this.loading = false; }); return; }
    this.THREE = THREE;

    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement!;
    const W = parent.clientWidth || 600;
    const H = parent.clientHeight || 560;

    // Scene
    const scene = new THREE.Scene();
    this.scene = scene;
    scene.background = new THREE.Color(0x0d0d0d);
    scene.fog = new THREE.FogExp2(0x0d0d0d, 0.02);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    this.updateCamera();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = 3001; // sRGBEncoding en r128
    this.renderer = renderer;

    this.setupLights();
    this.addGround();
    this.setupMouseControls(canvas);
    await this.loadModel();
    this.setupResize(parent);
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  private updateCamera(): void {
    if (!this.camera) return;
    this.camera.position.x = this.radius * Math.sin(this.rotY) * Math.cos(this.rotX);
    this.camera.position.y = this.radius * Math.sin(this.rotX) + 1.5;
    this.camera.position.z = this.radius * Math.cos(this.rotY) * Math.cos(this.rotX);
    this.camera.lookAt(0, 0.8, 0);
  }

  private setupLights(): void {
    const T = this.THREE; const s = this.scene;
    s.add(new T.AmbientLight(0xffffff, 0.5));
    const main = new T.DirectionalLight(0xffffff, 1.8);
    main.position.set(4, 8, 4); main.castShadow = true;
    main.shadow.mapSize.width = main.shadow.mapSize.height = 2048;
    main.shadow.camera.near = 0.5; main.shadow.camera.far = 50;
    main.shadow.camera.left = main.shadow.camera.bottom = -6;
    main.shadow.camera.right = main.shadow.camera.top = 6;
    s.add(main);
    const orange = new T.PointLight(0xFF6B00, 1.5, 25);
    orange.position.set(-5, 3, 2); orange.name = 'orangeLight';
    s.add(orange);
    const rim = new T.DirectionalLight(0x4FC3F7, 0.7);
    rim.position.set(-2, 4, -6); s.add(rim);
  }

  private addGround(): void {
    const T = this.THREE; const s = this.scene;
    const ground = new T.Mesh(
      new T.CircleGeometry(7, 64),
      new T.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 })
    );
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; s.add(ground);
    const ring = new T.Mesh(
      new T.RingGeometry(3.0, 3.15, 80),
      new T.MeshBasicMaterial({ color: 0xFF6B00, side: T.DoubleSide, transparent: true, opacity: 0.2 })
    );
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; s.add(ring);
  }

  private loadModel(): Promise<void> {
    return new Promise((resolve) => {
      const T = this.THREE;
      const GLTFLoader = T.GLTFLoader;

      if (!GLTFLoader) {
        console.error('GLTFLoader no disponible en THREE. Verifica que se cargó el script correctamente.');
        this.ngZone.run(() => { this.loading = false; });
        resolve(); return;
      }

      new GLTFLoader().load(
        'models/mt07.glb',
        (gltf: any) => {
          const model = gltf.scene;
          const box = new T.Box3().setFromObject(model);
          const size = new T.Vector3(); const center = new T.Vector3();
          box.getSize(size); box.getCenter(center);
          const scale = 2.5 / Math.max(size.x, size.y, size.z);
          model.scale.setScalar(scale);
          model.rotation.x = Math.PI / 2;  // levanta la moto de pie
          model.rotation.y = Math.PI;      // gira de frente a la cámara
          // Recalcula bbox tras rotación para centrar bien
          const box2 = new T.Box3().setFromObject(model);
          const center2 = new T.Vector3();
          box2.getCenter(center2);
          model.position.x = -center2.x;
          model.position.y = -box2.min.y;
          model.position.z = -center2.z;
          // STL = mesh único sin separación de piezas.
          // Usamos vertex colors para distinguir carrocería (alto) de mecánica (bajo).
          model.traverse((child: any) => {
            if (!child.isMesh) return;
            child.castShadow = child.receiveShadow = true;

            const geo = child.geometry;
            const pos = geo.attributes.position;
            if (!pos) return;

            // Calcula rango Y del modelo
            let minY = Infinity, maxY = -Infinity;
            for (let i = 0; i < pos.count; i++) {
              const y = pos.getY(i);
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
            const rangeY = maxY - minY;

            // Crea vertex colors
            const colors = new Float32Array(pos.count * 3);
            const bodyCol  = new T.Color(COLOR_MAP[this.state.color]);
            const mechCol  = new T.Color(0x1e1e1e); // motor/ruedas: gris muy oscuro
            const wheelCol = new T.Color(0x111111); // zona baja: negro goma

            for (let i = 0; i < pos.count; i++) {
              const y = pos.getY(i);
              const norm = (y - minY) / rangeY; // 0 = suelo, 1 = top

              let col: any;
              if (norm < 0.18) {
                col = wheelCol;      // ruedas y bajos
              } else if (norm < 0.45) {
                col = mechCol;       // motor y chasis
              } else {
                col = bodyCol;       // carrocería alta
              }

              colors[i * 3]     = col.r;
              colors[i * 3 + 1] = col.g;
              colors[i * 3 + 2] = col.b;
            }

            geo.setAttribute('color', new T.BufferAttribute(colors, 3));

            child.material = new T.MeshStandardMaterial({
              vertexColors: true,
              metalness: 0.5,
              roughness: 0.38,
            });

            // Guarda referencia para cambio de color
            child.userData['minY']   = minY;
            child.userData['rangeY'] = rangeY;
            this.bodyMeshes.push(child);
          });
          this.motoMesh = model;
          this.scene.add(model);
          this.ngZone.run(() => { this.loading = false; });
          resolve();
        },
        (progress: any) => {
          if (progress.total > 0)
            this.ngZone.run(() => { this.loadProgress = Math.round(progress.loaded / progress.total * 100); });
        },
        (error: any) => {
          console.error('Error cargando mt07.glb:', error);
          console.warn('¿Está el archivo en src/assets/models/mt07.glb?');
          this.ngZone.run(() => { this.loading = false; });
          resolve();
        }
      );
    });
  }

  private setupMouseControls(canvas: HTMLCanvasElement): void {
    let down = false, lx = 0, ly = 0;
    const start = (x: number, y: number) => {
      down = true; lx = x; ly = y;
      this.ngZone.run(() => { this.hasRotated = true; this.autoRotate = false; });
    };
    const move = (x: number, y: number) => {
      if (!down) return;
      this.rotY += (x - lx) * 0.01;
      this.rotX = Math.max(-0.3, Math.min(0.8, this.rotX + (y - ly) * 0.005));
      lx = x; ly = y; this.updateCamera();
    };
    const end = () => { down = false; };
    canvas.addEventListener('mousedown',  (e) => start(e.clientX, e.clientY));
    canvas.addEventListener('mousemove',  (e) => move(e.clientX, e.clientY));
    canvas.addEventListener('mouseup',    end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', (e) => start(e.touches[0].clientX, e.touches[0].clientY));
    canvas.addEventListener('touchmove',  (e) => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    canvas.addEventListener('touchend',   end);
    canvas.addEventListener('wheel', (e) => { this.radius = Math.max(2, Math.min(10, this.radius + e.deltaY * 0.01)); this.updateCamera(); });
  }

  private setupResize(parent: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(() => {
      const w = parent.clientWidth, h = parent.clientHeight;
      this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    this.resizeObserver.observe(parent);
  }

  private animate(): void {
    this.animFrameId = requestAnimationFrame(() => this.animate());
    if (this.autoRotate) { this.rotY += 0.004; this.updateCamera(); }
    this.renderer.render(this.scene, this.camera);
  }

  setColor(color: ColorOption): void {
    this.state.color = color;
    this.save();
    if (!this.THREE || this.bodyMeshes.length === 0) return;

    const T = this.THREE;
    const targetBody  = new T.Color(COLOR_MAP[color]);
    const mechCol     = new T.Color(0x1e1e1e);
    const wheelCol    = new T.Color(0x111111);
    const startTime   = performance.now();
    const duration    = 600;

    // Snapshot de los colores actuales para interpolar
    const snapshots: Float32Array[] = this.bodyMeshes.map((child: any) =>
      new Float32Array(child.geometry.attributes.color.array)
    );

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

      this.bodyMeshes.forEach((child: any, idx: number) => {
        const geo    = child.geometry;
        const pos    = geo.attributes.position;
        const colors = geo.attributes.color.array as Float32Array;
        const snap   = snapshots[idx];
        const minY   = child.userData['minY'];
        const rangeY = child.userData['rangeY'];

        for (let i = 0; i < pos.count; i++) {
          const norm = ((pos.getY(i) - minY) / rangeY);
          let targetCol: any;
          if (norm < 0.18)       targetCol = wheelCol;
          else if (norm < 0.45)  targetCol = mechCol;
          else                   targetCol = targetBody;

          colors[i*3]   = snap[i*3]   + (targetCol.r - snap[i*3])   * e;
          colors[i*3+1] = snap[i*3+1] + (targetCol.g - snap[i*3+1]) * e;
          colors[i*3+2] = snap[i*3+2] + (targetCol.b - snap[i*3+2]) * e;
        }
        geo.attributes.color.needsUpdate = true;
      });

      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }



  resetCamera(): void { this.rotY = 0; this.rotX = 0.2; this.radius = 5; this.updateCamera(); this.autoRotate = true; this.hasRotated = false; }
  toggleAutoRotate(): void { this.autoRotate = !this.autoRotate; }

  toggleStickers(): void { this.state.stickers = !this.state.stickers; this.save(); }

  toggleSportExhaust(): void {
    this.state.sportExhaust = !this.state.sportExhaust;
    this.scene?.traverse((obj: any) => {
      if (obj.isPointLight && obj.name === 'orangeLight') obj.intensity = this.state.sportExhaust ? 3.0 : 1.5;
    });
    this.save();
  }

  reset(): void { this.state = { color: 'black', stickers: false, sportExhaust: false }; this.setColor('black'); }

  hasActiveOptions(): boolean { return this.state.stickers || this.state.sportExhaust; }
  getColorName():     string  { return COLOR_NAMES[this.state.color]; }
  getColorHex():      string  { return COLOR_HEX[this.state.color]; }

  get configPrice(): number {
    return (this.state.stickers ? 24.99 : 0) + (this.state.sportExhaust ? 299.99 : 0);
  }

  get configName(): string {
    const p = [`Color: ${this.state.color}`];
    if (this.state.stickers)     p.push('Stickers');
    if (this.state.sportExhaust) p.push('Escape sport');
    return `MT-07 Config (${p.join(' + ')})`;
  }

  addConfigToCart(): void {
    const product: Product = {
      id: Date.now(), name: this.configName, category: 'config',
      price: this.configPrice, imageUrl: `/images/mt07/mt07-${this.state.color}.png`,
      description: JSON.stringify(this.state)
    };
    this.cartService.add(product);
    alert('Configuración añadida al carrito ✅');
  }

  isConfigSaved(): boolean {
    return JSON.stringify(this.state) !== JSON.stringify({ color: 'black', stickers: false, sportExhaust: false });
  }

  private save(): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); }

  private load(): ConfigState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { color: 'black', stickers: false, sportExhaust: false };
    } catch { return { color: 'black', stickers: false, sportExhaust: false }; }
  }
}