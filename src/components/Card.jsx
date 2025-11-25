import { useState, useRef, useEffect } from 'react';
import './Card.css';

const Card = ({ data, onSwipe, cardTimer, maxCardTime }) => {
  const [dragX, setDragX] = useState(0);
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Generate a consistent pseudo-random color based on source name
  const getAvatarColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };
  const avatarColor = getAvatarColor(data.source);
  const initial = data.source.charAt(0).toUpperCase();

  // Drag rotation
  const rotation = dragX * 0.05;

  // 3D Tilt (only when not dragging)
  // We combine tilt and rotation.
  // If dragging, tilt should probably reset or be 0.
  const transformStyle = isDragging.current || Math.abs(dragX) > 0
    ? `translateX(${dragX}px) rotate(${rotation}deg)` // Dragging logic
    : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`; // Hover Tilt logic

  const opacityFake = Math.min(Math.max(dragX * -0.005, 0), 1);
  const opacityReal = Math.min(Math.max(dragX * 0.005, 0), 1);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX || e.touches[0].clientX;
    cardRef.current.style.transition = 'none';
    setTilt({ x: 0, y: 0 }); // Reset tilt on grab
  };

  const handlePointerMove = (e) => {
    const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);

    if (isDragging.current) {
      const diff = clientX - startX.current;
      setDragX(diff);
    }
  };

  const handleContainerMouseMove = (e) => {
    if (isDragging.current) return;
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleContainerMouseLeave = () => {
    if (!isDragging.current) {
        setTilt({ x: 0, y: 0 });
    }
  }

  const handlePointerUp = () => {
    isDragging.current = false;
    cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s ease'; // Smoother spring release

    // Threshold for swipe
    if (dragX > 100) {
      // Swiped Right (Real)
      setDragX(1000); // Fly off further
      onSwipe('right');
    } else if (dragX < -100) {
      // Swiped Left (Fake)
      setDragX(-1000); // Fly off further
      onSwipe('left');
    } else {
      // Reset
      setDragX(0);
      setTilt({ x: 0, y: 0 });
    }
  };

  // Reset drag when data changes (new card)
  useEffect(() => {
    setDragX(0);
    setTilt({ x: 0, y: 0 });
  }, [data]);

  return (
    <div
        className="card-container"
        ref={containerRef}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
    >
       <div className="card-timer-bar">
          <div
            className="card-timer-fill"
            style={{ width: `${(cardTimer / maxCardTime) * 100}%` }}
          />
       </div>

      <div
        className="card"
        ref={cardRef}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        style={{ transform: transformStyle }}
      >
        <div className="card-overlay fake" style={{ opacity: opacityFake }}>FAKE</div>
        <div className="card-overlay real" style={{ opacity: opacityReal }}>REAL</div>

        {/* Social Media Header */}
        <div className="card-header">
            <div className="avatar" style={{ backgroundColor: avatarColor }}>{initial}</div>
            <div className="user-info">
                <span className="username">{data.source}</span>
                <span className="handle">@{data.source.replace(/\s+/g, '').toLowerCase()} • 2h</span>
            </div>
            <div className="menu-icon">•••</div>
        </div>

        {/* Content Body */}
        <div className="card-body">
            <h3 className="card-title">{data.title}</h3>
            <p className="card-text">{data.content}</p>
            {/* Placeholder for Media/Image */}
            <div className="media-placeholder">
                <div className="media-icon">📷</div>
            </div>
        </div>

        {/* Social Actions Footer */}
        <div className="card-social-footer">
            <div className="action-item"><span className="icon">❤️</span> <span className="count">1.2k</span></div>
            <div className="action-item"><span className="icon">💬</span> <span className="count">342</span></div>
            <div className="action-item"><span className="icon">🔄</span> <span className="count">856</span></div>
            <div className="action-item"><span className="icon">🔖</span></div>
        </div>

      </div>

      {/* Footer Instruction Text (Outside card, part of container context visually) */}
      <div className="swipe-instruction">
         Swipe Left to Report • Swipe Right to Share
      </div>

    </div>
  );
};

export default Card;
