import { useEffect, useRef } from 'react';
import './Background.css';

/**
 * Background Component
 *
 * Implements an interactive particle system using HTML5 Canvas.
 * Particles drift randomly, bounce off edges, and react to:
 * 1. Mouse Proximity: Repel effect when cursor is near.
 * 2. Interaction State: Change color based on game feedback (correct/wrong).
 */
const Background = ({ interactionState }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to full window dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Particle Configuration
    const particles = [];
    const particleCount = 150; // Increased density as requested

    /**
     * Particle Class
     * Represents a single dot in the background system.
     */
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Random velocity vector
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.size = Math.random() * 3 + 1; // Size variation
        this.baseColor = 'rgba(255, 255, 255, 0.1)';
        this.color = this.baseColor;
      }

      /**
       * Updates the particle's position and state.
       * @param {number} mouseX - Current mouse X position
       * @param {number} mouseY - Current mouse Y position
       * @param {string} interactionState - Current game state ('neutral', 'correct', 'wrong')
       */
      update(mouseX, mouseY, interactionState) {
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Boundary Check: Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse Interaction: Repel Logic
        if (mouseX && mouseY) {
          const dx = this.x - mouseX;
          const dy = this.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = 150; // Radius of interaction
          const force = (maxDistance - distance) / maxDistance;

          if (distance < maxDistance) {
            // Push particle away from mouse
            this.x += forceDirectionX * force * 2;
            this.y += forceDirectionY * force * 2;
          }
        }

        // State Reaction: Color Shift
        if (interactionState === 'correct') {
          this.color = 'rgba(100, 255, 100, 0.6)'; // Green for success
        } else if (interactionState === 'wrong') {
          this.color = 'rgba(255, 100, 100, 0.6)'; // Red for failure
        } else {
          this.color = this.baseColor;
        }
      }

      /**
       * Renders the particle to the canvas context.
       * @param {CanvasRenderingContext2D} ctx
       */
      draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize Particle Array
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Mouse Tracking
    let mouseX = null;
    let mouseY = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const render = () => {
      // Clear Canvas / Background Flash Logic
      if (interactionState === 'correct') {
         ctx.fillStyle = 'rgba(0, 50, 0, 0.2)'; // Green tint
      } else if (interactionState === 'wrong') {
         ctx.fillStyle = 'rgba(50, 0, 0, 0.2)'; // Red tint
      } else {
         // Clear with transparent rect to allow previous frame trails if desired,
         // but here we just clear it fully for clean movement.
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         // Note: CSS handles the base background color now.
      }

      // If we are flashing, we draw the rect. If neutral, we just cleared.
      if (interactionState !== 'neutral') {
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Update and Draw Particles
      particles.forEach(particle => {
        particle.update(mouseX, mouseY, interactionState);
        particle.draw(ctx);
      });

      // Draw Connections (Constellation Effect)
      // Connects particles that are close to each other
      ctx.strokeStyle = interactionState === 'correct' ? 'rgba(100,255,100,0.1)' :
                        interactionState === 'wrong' ? 'rgba(255,100,100,0.1)' :
                        'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Nested loop to check distances between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) { // Connection threshold
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactionState]); // Re-initialize if interactionState changes (though mostly handled inside loop for smooth transitions)

  return <canvas ref={canvasRef} className="interactive-background" />;
};

export default Background;
