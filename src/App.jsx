import { useState, useEffect, useRef } from 'react'
import Background from './components/Background'
import Card from './components/Card'
import Controls from './components/Controls'
import { cards } from './data/cards'
import './App.css'
import './Layout.css'

function App() {
  // Game State
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'feedback', 'finished'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [globalTimer, setGlobalTimer] = useState(60);
  const [cardTimer, setCardTimer] = useState(8);
  const [maxCardTime, setMaxCardTime] = useState(8);
  const [gameResult, setGameResult] = useState(null); // 'win', 'lose'
  const [feedbackData, setFeedbackData] = useState(null);
  const [interactionState, setInteractionState] = useState('neutral'); // 'neutral', 'correct', 'wrong'

  // Timers Refs
  const globalTimerRef = useRef(null);
  const cardTimerRef = useRef(null);

  // Constants
  const MAX_CARDS = cards.length;

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setCurrentCardIndex(0);
    setGlobalTimer(60);
    setCardTimer(8);
    setMaxCardTime(8);
    setGameResult(null);
  };

  const handleCorrect = () => {
    setInteractionState('correct');
    setTimeout(() => setInteractionState('neutral'), 500);
    setScore(prev => prev + 1);
    nextCard();
  };

  const handleWrong = (reason) => {
    setInteractionState('wrong');
    setTimeout(() => setInteractionState('neutral'), 500);
    setLives(prev => prev - 1);
    // Pause Game
    setGameState('feedback');
    setFeedbackData({
      card: cards[currentCardIndex],
      reason: reason || "Incorrect Choice"
    });
  };

  const nextCard = () => {
    if (currentCardIndex + 1 >= MAX_CARDS) {
      endGame('win');
    } else {
      setCurrentCardIndex(prev => prev + 1);
      // Reset card timer based on progression (simple formula: max(2, 8 - index * 0.2))
      const newTime = Math.max(2, 8 - (currentCardIndex + 1) * 0.3); // Slightly faster decay
      setCardTimer(newTime);
      setMaxCardTime(newTime);
    }
  };

  const endGame = (result) => {
    setGameResult(result);
    setGameState('finished');
  };

  const continueGame = () => {
    if (lives <= 0) {
      endGame('lose');
    } else {
      setGameState('playing');
      nextCard();
    }
  };

  // Global Timer Logic
  useEffect(() => {
    if (gameState === 'playing') {
      globalTimerRef.current = setInterval(() => {
        setGlobalTimer(prev => {
          if (prev <= 0) {
            endGame('lose');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(globalTimerRef.current);
    }
    return () => clearInterval(globalTimerRef.current);
  }, [gameState]);

  // Card Timer Logic
  useEffect(() => {
    if (gameState === 'playing') {
      cardTimerRef.current = setInterval(() => {
        setCardTimer(prev => {
          if (prev <= 0) {
            handleWrong("Time's Up!");
            return 0;
          }
          return prev - 0.1; // Update more frequently for smooth bar if needed
        });
      }, 100); // 100ms updates
    } else {
      clearInterval(cardTimerRef.current);
    }
    return () => clearInterval(cardTimerRef.current);
  }, [gameState, currentCardIndex]); // Depend on currentCardIndex to reset logic if needed

  return (
    <>
      <Background interactionState={interactionState} />
      <div className="game-container">
        {gameState === 'menu' && (
          <div className="menu">
            <h1>Distraction Economy</h1>
            <p>Swipe Left = FAKE</p>
            <p>Swipe Right = REAL</p>
            <button onClick={startGame}>Start Game</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="game-active">
            <div className="hud">
              <div className="hud-item">
                <span className="hud-label">Time</span>
                <span className="hud-value">{globalTimer}s</span>
              </div>
              <div className="hud-item">
                <span className="hud-label">Score</span>
                <span className="hud-value">{score}</span>
              </div>
              <div className="hud-item">
                <span className="hud-label">Lives</span>
                <span className="hud-value">{"❤️".repeat(lives)}</span>
              </div>
            </div>

            <Card
              data={cards[currentCardIndex]}
              cardTimer={cardTimer}
              maxCardTime={maxCardTime}
              onSwipe={(direction) => {
                if (direction === 'left') {
                  cards[currentCardIndex].type === 'fake' ? handleCorrect() : handleWrong("It was REAL!");
                } else if (direction === 'right') {
                   cards[currentCardIndex].type === 'real' ? handleCorrect() : handleWrong("It was FAKE!");
                }
              }}
            />

            <Controls
              onFake={() => cards[currentCardIndex].type === 'fake' ? handleCorrect() : handleWrong("It was REAL!")}
              onReal={() => cards[currentCardIndex].type === 'real' ? handleCorrect() : handleWrong("It was FAKE!")}
            />
          </div>
        )}

        {gameState === 'feedback' && feedbackData && (
          <div className="feedback-overlay">
            <h2>You Missed It!</h2>
            <p>{feedbackData.reason}</p>
            <p className="lesson">{feedbackData.card.explanation}</p>
            <button onClick={continueGame}>Continue</button>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="game-over">
            <h2>{gameResult === 'win' ? 'Victory!' : 'Game Over'}</h2>
            <p>Final Score: {score}</p>
            <button onClick={startGame}>Play Again</button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
