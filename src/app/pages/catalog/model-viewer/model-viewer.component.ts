// model-viewer.component.ts — Mini visor 3D para tarjetas de producto
import {
  Component, Input, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, NgZone, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewer-wrapper">
      <canvas #viewerCanvas class="viewer-canvas" [class.ready]="ready"></canvas>
      <div class="viewer-loading" *ngIf="!ready">
        <div class="viewer-spinner"></div>
      </div>
      <div class="viewer-hint" *ngIf="ready && !interacted">
        <span>🖱️ Arrastra</span>
      </div>
      <div class="viewer-badge">3D</div>
    </div>
  `,
  styles: [`
    .viewer-wrapper { position: relative; width: 100%; height: 100%; background: var(--surface-2); cursor: grab; }
    .viewer-wrapper:active { cursor: grabbing; }
    .viewer-canvas { width: 100% !important; height: 100% !important; display: block; opacity: 0; transition: opacity 0.6s ease; }
    .viewer-canvas.ready { opacity: 1; }
    .viewer-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .viewer-spinner { width: 32px; height: 32px; border: 2px solid rgba(255,107,0,0.15); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .viewer-hint { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); padding: 3px 10px; border-radius: 20px; font-size: 0.65rem; color: rgba(255,255,255,0.6); white-space: nowrap; pointer-events: none; }
    .viewer-badge { position: absolute; top: 8px; right: 8px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: var(--black); font-weight: 900; font-size: 0.6rem; letter-spacing: 1.5px; padding: 3px 8px; border-radius: 4px; }
  `]
})
export class ModelViewerComponent implements AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('viewerCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() modelUrl = '';

  ready = false;
  interacted = false;

  private THREE: any;
  private scene: any;
  private camera: any;
  private renderer: any;
  private animId = 0;
  private rotY = 0;
  private rotX = 0.15;
  private radius = 3;
  private autoRot = true;
  private resizeObs: ResizeObserver | null = null;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void { this.init(); }
  ngOnChanges(): void { if (this.scene) this.loadModel(); }
  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.renderer?.dispose();
    this.resizeObs?.disconnect();
  }

  private async init(): Promise<void> {
    if (!(window as any).THREE) {
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
    }
    if (!(window as any).THREE?.GLTFLoader) {
      await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
    }

    const THREE = (window as any).THREE;
    this.THREE = THREE;

    const canvas = this.canvasRef.nativeElement;
    const wrapper = canvas.parentElement!;
    const W = wrapper.clientWidth || 300;
    const H = wrapper.clientHeight || 300;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x141414);
    this.camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 100);
    this.updateCamera();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = 3001;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    this.renderer = renderer;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const main = new THREE.DirectionalLight(0xffffff, 1.5);
    main.position.set(3, 5, 4);
    this.scene.add(main);
    const orange = new THREE.PointLight(0xFF6B00, 1.0, 15);
    orange.position.set(-3, 2, 2);
    this.scene.add(orange);

    this.setupControls(canvas);

    this.resizeObs = new ResizeObserver(() => {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    this.resizeObs.observe(wrapper);

    await this.loadModel();
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  private loadScript(src: string): Promise<void> {
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  private async loadModel(): Promise<void> {
    if (!this.modelUrl || !this.THREE?.GLTFLoader) return;
    const toRemove: any[] = [];
    this.scene.traverse((o: any) => { if (o.isMesh) toRemove.push(o); });
    toRemove.forEach(o => this.scene.remove(o));

    new this.THREE.GLTFLoader().load(
      this.modelUrl,
      (gltf: any) => {
        const model = gltf.scene;
        const box = new this.THREE.Box3().setFromObject(model);
        const size = new this.THREE.Vector3();
        const center = new this.THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const scale = 2.0 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.traverse((child: any) => {
          if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
        });
        this.scene.add(model);
        this.ngZone.run(() => { this.ready = true; });
      },
      undefined,
      (err: any) => {
        console.error('Error cargando modelo:', this.modelUrl, err);
        this.ngZone.run(() => { this.ready = true; });
      }
    );
  }

  private updateCamera(): void {
    if (!this.camera) return;
    this.camera.position.x = this.radius * Math.sin(this.rotY) * Math.cos(this.rotX);
    this.camera.position.y = this.radius * Math.sin(this.rotX);
    this.camera.position.z = this.radius * Math.cos(this.rotY) * Math.cos(this.rotX);
    this.camera.lookAt(0, 0, 0);
  }

  private setupControls(canvas: HTMLCanvasElement): void {
    let down = false, lx = 0, ly = 0;
    const start = (x: number, y: number) => { down = true; lx = x; ly = y; this.autoRot = false; this.ngZone.run(() => { this.interacted = true; }); };
    const move = (x: number, y: number) => { if (!down) return; this.rotY += (x - lx) * 0.012; this.rotX = Math.max(-0.5, Math.min(0.6, this.rotX + (y - ly) * 0.006)); lx = x; ly = y; this.updateCamera(); };
    const end = () => { down = false; };
    canvas.addEventListener('mousedown', e => start(e.clientX, e.clientY));
    canvas.addEventListener('mousemove', e => move(e.clientX, e.clientY));
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', e => start(e.touches[0].clientX, e.touches[0].clientY));
    canvas.addEventListener('touchmove', e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    canvas.addEventListener('touchend', end);
    canvas.addEventListener('wheel', e => { this.radius = Math.max(1, Math.min(8, this.radius + e.deltaY * 0.005)); this.updateCamera(); });
  }

  private animate(): void {
    this.animId = requestAnimationFrame(() => this.animate());
    if (this.autoRot) { this.rotY += 0.006; this.updateCamera(); }
    this.renderer?.render(this.scene, this.camera);
  }
}