const PARTICLE_COLOR = [170, 232, 240];

// A simple Particle class
// https://p5js.org/examples/simulate-particle-system.html
export class Particle {
	constructor(position, theme) {
		this.acceleration = createVector(0, 0.05);
		this.velocity = createVector(random(-1, 1), random(-1, 0));
		this.position = position.copy();
		this.lifespan = 255;
		this.background = color(theme.background);
		this.border = color(theme.border);
	}

	run() {
		this.update();
		this.display();
	}

	update() {
		this.lifespan -= 2;
		this.background.setAlpha(this.lifespan);
		this.border.setAlpha(this.lifespan);
	}

	// Method to display
	display() {
		stroke(this.border);
		strokeWeight(2);
		fill(this.background);
		let size = map(this.lifespan, 255, 0, 10, 100);
		ellipse(this.position.x, this.position.y, size, size);
	}

	// Is the particle still useful?
	isDead() {
		return this.lifespan < 0;
	}
}

export class ParticleSystem {
	constructor(position) {
		this.origin = position.copy();
		this.particles = [];
	}

	addParticle(x, y, theme) {
		this.particles.push(new Particle(createVector(x, y), theme));
	}

	run() {
		for (let i = this.particles.length - 1; i >= 0; i--) {
			let p = this.particles[i];
			p.run();
			if (p.isDead()) {
				this.particles.splice(i, 1);
			}
		}
	}
}
