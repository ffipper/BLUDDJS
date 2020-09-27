"use strict";
{
	class Noise {
		// http://mrl.nyu.edu/~perlin/noise/
		constructor(octaves = 1) {
			this.p = new Uint8Array(512);
			this.octaves = octaves;
			this.init();
		}
		init() {
			for (let i = 0; i < 512; ++i) {
				this.p[i] = Math.random() * 256;
			}
		}
		lerp(t, a, b) {
			return a + t * (b - a);
		}
		grad2d(i, x, y) {
			const v = (i & 1) === 0 ? x : y;
			return (i & 2) === 0 ? -v : v;
		}
		noise2d(x2d, y2d) {
			const X = Math.floor(x2d) & 255;
			const Y = Math.floor(y2d) & 255;
			const x = x2d - Math.floor(x2d);
			const y = y2d - Math.floor(y2d);
			const fx = (3 - 2 * x) * x * x;
			const fy = (3 - 2 * y) * y * y;
			const p0 = this.p[X] + Y;
			const p1 = this.p[X + 1] + Y;
			return this.lerp(
				fy,
				this.lerp(
					fx,
					this.grad2d(this.p[p0], x, y),
					this.grad2d(this.p[p1], x - 1, y)
				),
				this.lerp(
					fx,
					this.grad2d(this.p[p0 + 1], x, y - 1),
					this.grad2d(this.p[p1 + 1], x - 1, y - 1)
				)
			);
		}
		noise(x, y) {
			let e = 1,
				k = 1,
				s = 0;
			for (let i = 0; i < this.octaves; ++i) {
				e *= 0.5;
				s += e * (1 + this.noise2d(k * x, k * y)) / 2;
				k *= 2;
			}
			return s;
		}
	}
	// Particles
	class Particle {
		constructor(x, y, a) {
			this.x = x;
			this.y = y;
			this.a = a;
		}
		move() {
			const n = perlin.noise(this.x * 0.01, this.y * 0.01);
			const a = this.a + n * 16;
			this.x += Math.cos(a);
			this.y += Math.sin(a);
			ctx.fillRect(this.x, this.y, 0.75, 0.75);
			if (
				this.x < 0 ||
				this.x > canvas.width ||
				this.y < 0 ||
				this.y > canvas.height
			) {
				particles.delete(this);
			}
		}
	}
	// init canvas
	const canvas = {
		init() {
			this.elem = document.createElement("canvas");
			document.body.appendChild(this.elem);
			this.resize();
			return this.elem.getContext("2d");
		},
		resize() {
			this.width = this.elem.width = this.elem.offsetWidth;
			this.height = this.elem.height = this.elem.offsetHeight;
		},
		reset() {
			this.resize();
			ctx.fillStyle = "#012";
		}
	};
	// init pointer
	const pointer = {
		init(canvas) {
			this.x = canvas.width * 0.5;
			this.y = canvas.height * 0.5;
			["mousedown", "touchstart"].forEach((event, touch) => {
				document.addEventListener(
					event,
					e => {
						if (touch) {
							e.preventDefault();
							this.x = e.targetTouches[0].clientX;
							this.y = e.targetTouches[0].clientY;
						} else {
							this.x = e.clientX;
							this.y = e.clientY;
						}
						init();
					},
					false
				);
			});
		}
	};
	// init pen
	const ctx = canvas.init();
	pointer.init(canvas);
	const perlin = new Noise(3);
	const particles = new Set();
	// start new
	const init = () => {
		particles.clear();
		canvas.reset();
		perlin.init();
		for (let a = 0; a < 2 * Math.PI; a += Math.PI / 720) {
			particles.add(new Particle(pointer.x, pointer.y, a));
		}
	};
	// move and draw particles
	const run = () => {
		requestAnimationFrame(run);
		for (const p of particles) {
			p.move();
		}
	};
	init();
	run();
}
