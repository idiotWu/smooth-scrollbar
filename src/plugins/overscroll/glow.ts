import clamp from 'lodash-es/clamp';
import Scrollbar from 'smooth-scrollbar';

import { setStyle } from '../../utils/set-style';

const GLOW_MAX_OPACITY = 0.75;
const GLOW_MAX_OFFSET = 0.25;

export class Glow {
  private _canvas = document.createElement('canvas');
  private _ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;

  private _touchX: number;
  private _touchY: number;

  constructor(
    private _scrollbar: Scrollbar,
  ) {
    setStyle(this._canvas, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'none',
    });
  }

  mount() {
    this._scrollbar.containerEl.appendChild(this._canvas);
  }

  unmount() {
    if (this._canvas.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
  }

  adjust() {
    const {
      size,
    } = this._scrollbar;

    const DPR = window.devicePixelRatio || 1;

    const nextWidth = size.container.width * DPR;
    const nextHeight = size.container.height * DPR;

    if (nextWidth === this._canvas.width && nextHeight === this._canvas.height) {
      return;
    }

    this._canvas.width = nextWidth;
    this._canvas.height = nextHeight;

    this._ctx.scale(DPR, DPR);
  }

  recordTouch(event: TouchEvent) {
    const touch = event.touches[event.touches.length - 1];

    this._touchX = touch.clientX;
    this._touchY = touch.clientY;
  }

  render({ x = 0, y = 0 }, color: string) {
    if (!x && !y) {
      setStyle(this._canvas, {
        display: 'none',
      });

      return;
    }

    setStyle(this._canvas, {
      display: 'block',
    });

    const {
      size,
    } = this._scrollbar;

    this._ctx.clearRect(0, 0, size.container.width, size.container.height);
    this._ctx.fillStyle = color;

    this._renderX(x);
    this._renderY(y);
  }

  private _getMaxOverscroll(): number {
    const options = this._scrollbar.options.plugins.overscroll;

    return options && options.maxOverscroll ? options.maxOverscroll : 150;
  }

  private _renderX(strength: number) {
    const {
      size,
    } = this._scrollbar;

    const maxOverscroll = this._getMaxOverscroll();
    const { width, height } = size.container;
    const ctx = this._ctx;

    ctx.save();

    if (strength > 0) {
      // glow on right side
      // horizontally flip
      ctx.transform(-1, 0, 0, 1, width, 0);
    }

    const opacity = clamp(Math.abs(strength) / maxOverscroll, 0, GLOW_MAX_OPACITY);
    const startOffset = clamp(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    const x = Math.abs(strength);
    const y = this._touchY || (height / 2);

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(0, -startOffset);
    ctx.quadraticCurveTo(x, y, 0, height + startOffset);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  private _renderY(strength: number) {
    const {
      size,
    } = this._scrollbar;

    const maxOverscroll = this._getMaxOverscroll();
    const { width, height } = size.container;
    const ctx = this._ctx;

    ctx.save();

    if (strength > 0) {
      // glow on bottom side
      // vertically flip
      ctx.transform(1, 0, 0, -1, 0, height);
    }

    const opacity = clamp(Math.abs(strength) / maxOverscroll, 0, GLOW_MAX_OPACITY);
    const startOffset = clamp(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    const x = this._touchX || (width / 2);
    const y = Math.abs(strength);

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(-startOffset, 0);
    ctx.quadraticCurveTo(x, y, width + startOffset, 0);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}
