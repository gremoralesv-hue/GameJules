import { useEffect, useRef } from 'react';
import './Background.css';

/**
 * Background Component - Neo-Pop Edition
 * Subtle floating particles to complement the yellow room.
 */
const Background = ({ interactionState }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const particleCount = 80; // Fewer particles for cleaner look

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5; // Slow drift
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 8 + 2; // Bigger dots

        // Randomly pick accent colors
        const colors = [
            'rgba(242, 71, 137, 0.3)', // Pink
            'rgba(44, 204, 211, 0.3)', // Cyan
            'rgba(255, 143, 28, 0.3)'  // Orange
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(mouseX, mouseY) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Slight interaction
        if (mouseX && mouseY) {
           const dx = this.x - mouseX;
           const dy = this.y - mouseY;
           const dist = Math.sqrt(dx*dx + dy*dy);
           if (dist < 100) {
               this.x += (dx/dist) * 2;
               this.y += (dy/dist) * 2;
           }
        }
      }

      draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = null, mouseY = null;
    const handleMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update(mouseX, mouseY);
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-background" />;
};

export default Background;
