
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 50;

const PARTICLE_SPEED = 0.05;
const PARTICLE_LIFETIME = 0.001;


const particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * PARTICLE_SPEED;
        this.speedY = (Math.random() - 0.5) * PARTICLE_SPEED;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= PARTICLE_LIFETIME;
    }

    draw() {
        let redOffset = Math.random() * 50;
        let greenOffset = Math.random() * 20;
        let blueOffset = Math.random() * 50;

        ctx.fillStyle = `rgba(${120 + redOffset}, ${255 - greenOffset}, ${120 + blueOffset}, 0.5)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (particles.length < PARTICLE_COUNT) {
        particles.push(new Particle());
    }

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        if (particle.size <= 0.2) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

animate();