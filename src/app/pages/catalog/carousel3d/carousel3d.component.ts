// carousel3d.component.ts
import {
  Component, Input, OnInit, OnDestroy, OnChanges,
  SimpleChanges, HostListener, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';
import { Carousel3dService } from './carousel3d.service';
import { CartService } from '../../../services/cart.service';
import { ModelViewerComponent } from '../model-viewer/model-viewer.component';

@Component({
  selector: 'app-carousel3d',
  standalone: true,
  imports: [CommonModule, ModelViewerComponent],
  templateUrl: './carousel3d.component.html',
  styleUrl: './carousel3d.component.css'
})
export class Carousel3dComponent implements OnInit, OnDestroy, OnChanges {
  @Input() products: Product[] = [];

  activeIndex = 0;
  isEntering  = true;
  isSliding   = false;
  cartFeedback: number | null = null;

  private autoTimer: any     = null;
  private inactiveTimer: any = null;
  private readonly AUTO_DELAY = 5000;
  private touchStartX = 0;
  private touchStartY = 0;

  constructor(
    private svc: Carousel3dService,
    private cartService: CartService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    setTimeout(() => { this.isEntering = false; }, 50);
    this.startAutoPlay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products'] && this.products.length) {
      this.svc.setProducts(this.products);
    }
  }

  ngOnDestroy(): void { this.clearTimers(); }

  get current(): Product | null { return this.products[this.activeIndex] ?? null; }
  get total(): number { return this.products.length; }

  getCardOffset(i: number): number {
    let o = i - this.activeIndex;
    const h = Math.floor(this.total / 2);
    if (o > h)  o -= this.total;
    if (o < -h) o += this.total;
    return o;
  }

  isVisible(i: number): boolean { return Math.abs(this.getCardOffset(i)) <= 2; }

  getCardStyle(i: number): any {
    const o   = this.getCardOffset(i);
    const abs = Math.abs(o);
    const tx    = o * 220;
    const tz    = -abs * 120;
    const ry    = o * -18;
    const scale = 1 - abs * 0.15;
    const opac  = abs === 0 ? 1 : abs === 1 ? 0.75 : 0.4;
    const zi    = 10 - abs;
    return {
      transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`,
      opacity: opac,
      zIndex: zi,
      pointerEvents: abs === 0 ? 'all' : 'none'
    };
  }

  goTo(index: number): void {
    if (index === this.activeIndex || this.isSliding) return;
    this.isSliding = true;
    this.resetInactiveTimer();
    setTimeout(() => {
      this.activeIndex = ((index % this.total) + this.total) % this.total;
      this.isSliding = false;
    }, 420);
  }

  next(): void { this.goTo((this.activeIndex + 1) % this.total); this.resetInactiveTimer(); }
  prev(): void { this.goTo((this.activeIndex - 1 + this.total) % this.total); this.resetInactiveTimer(); }

  private startAutoPlay(): void {
    this.clearTimers();
    this.ngZone.runOutsideAngular(() => {
      this.autoTimer = setInterval(() => { this.ngZone.run(() => this.next()); }, this.AUTO_DELAY);
    });
  }

  private resetInactiveTimer(): void {
    clearInterval(this.autoTimer);
    clearTimeout(this.inactiveTimer);
    this.ngZone.runOutsideAngular(() => {
      this.inactiveTimer = setTimeout(() => { this.ngZone.run(() => this.startAutoPlay()); }, this.AUTO_DELAY);
    });
  }

  private clearTimers(): void { clearInterval(this.autoTimer); clearTimeout(this.inactiveTimer); }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft')  this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.resetInactiveTimer();
  }

  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) { dx < 0 ? this.next() : this.prev(); }
  }

  addToCart(product: Product, e: Event): void {
    e.stopPropagation();
    this.cartService.add(product);
    this.cartFeedback = product.id;
    setTimeout(() => { this.cartFeedback = null; }, 1800);
  }
}