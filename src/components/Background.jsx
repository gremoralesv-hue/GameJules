import { useEffect, useRef } from 'react';
import './Background.css';

const Background = ({ interactionState }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle System
    const particles = [];
    const particleCount = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.size = Math.random() * 3 + 1;
        this.baseColor = 'rgba(255, 255, 255, 0.1)';
        this.color = this.baseColor;
      }

      update(mouseX, mouseY, interactionState) {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Interaction with mouse (Repel)
        if (mouseX && mouseY) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = 150;
          const force = (maxDistance - distance) / maxDistance;

          if (distance < maxDistance) {
            this.x += forceDirectionX * force * 2; // Repel strength
            this.y += forceDirectionY * force * 2;
          }
        }

        // Color Reaction
        if (interactionState === 'correct') {
          this.color = 'rgba(100, 255, 100, 0.6)';
        } else if (interactionState === 'wrong') {
          this.color = 'rgba(255, 100, 100, 0.6)';
        } else {
          this.color = this.baseColor;
        }
      }

      draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mouseX = null;
    let mouseY = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Clear canvas with trail effect or solid clear
      // Use solid color based on state for background flash
      if (interactionState === 'correct') {
         ctx.fillStyle = 'rgba(0, 50, 0, 0.2)'; // Green flash background
      } else if (interactionState === 'wrong') {
         ctx.fillStyle = 'rgba(50, 0, 0, 0.2)'; // Red flash background
      } else {
         ctx.fillStyle = '#121212'; // Default background
      }

      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update(mouseX, mouseY, interactionState);
        particle.draw(ctx);
      });

      // Connect particles
      ctx.strokeStyle = interactionState === 'correct' ? 'rgba(100,255,100,0.1)' :
                        interactionState === 'wrong' ? 'rgba(255,100,100,0.1)' :
                        'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
             ctx.beginPath();
             ctx.moveTo(particles[i].x, particles[i].y);
             ctx.lineTo(particles[j].x, particles[j].y);
             ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactionState]); // Re-bind if state changes or use Ref for mutable state in loop

  return <canvas ref={canvasRef} className="interactive-background" />;
};

export default Background;
