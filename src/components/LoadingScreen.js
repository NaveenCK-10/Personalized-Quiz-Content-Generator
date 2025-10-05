import React, { useEffect, useRef } from 'react';
// Using the correct named import for createTimeline from animejs
import { createTimeline } from 'animejs'; 
import { Book } from 'lucide-react';

export default function LoadingScreen() {
  const animationRef = useRef(null);

  useEffect(() => {
    // Using the imported createTimeline function
    const timeline = createTimeline({
      easing: 'easeInOutSine',
      duration: 1200,
      loop: true,
    });

    timeline
      .add({
        targets: '.book-cover',
        rotateY: '180deg',
        duration: 1500,
      })
      .add({
        targets: '.page1',
        rotateY: '180deg',
        delay: 200,
      }, '-=1200')
      .add({
        targets: '.page2',
        rotateY: '180deg',
        delay: 200,
      }, '-=1100')
      .add({
        targets: '.page3',
        rotateY: '180deg',
        delay: 200,
      }, '-=1000')
      .add({
        targets: '.book-container',
        scale: [1, 0.95, 1],
        duration: 2000,
      }, '-=1000')
      .add({
        targets: ['.book-cover', '.page1', '.page2', '.page3'],
        rotateY: '0deg',
        duration: 1500,
        delay: 500,
      });

    animationRef.current = timeline;
  }, []);

  return (
    <div className="loading-container">
      <div className="book-perspective">
        <div className="book-container">
          <div className="book">
            <div className="page page3"></div>
            <div className="page page2"></div>
            <div className="page page1"></div>
            <div className="book-cover">
              <div className="cover-content">
                <Book size={48} className="icon" />
                <h3 className="title">AI Learn</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="loading-text">Preparing your learning space...</p>
      
      <style jsx>{`
        .loading-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #2c132a; /* Dark pinkish-purple */
          z-index: 9999;
          font-family: sans-serif;
        }
        .book-perspective {
          perspective: 1500px;
        }
        .book-container {
          position: relative;
          width: 200px;
          height: 280px;
          transform-style: preserve-3d;
          /* Glowing Aura */
          filter: drop-shadow(0 0 15px rgba(255, 105, 180, 0.6)) 
                  drop-shadow(0 0 30px rgba(255, 105, 180, 0.4));
          animation: pulse 2.5s infinite ease-in-out;
        }
        .book {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
        }
        .book-cover, .page {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transform-origin: left center;
          border-radius: 8px;
        }
        .book-cover {
          background: linear-gradient(45deg, #8a2be2, #c71585);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }
        .cover-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            border: 2px solid rgba(255, 255, 255, 0.7);
            padding: 20px;
            border-radius: 8px;
        }
        .page {
          background-color: #fff8f0;
          border-left: 1px solid #ddd;
        }
        .page1 { z-index: 3; }
        .page2 { z-index: 2; }
        .page3 { z-index: 1; }
        .loading-text {
          margin-top: 40px;
          color: #f0abfc; /* Light pink */
          font-size: 1.2rem;
          letter-spacing: 1px;
          text-shadow: 0 0 8px rgba(255, 105, 180, 0.8);
        }
        @keyframes pulse {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(255, 105, 180, 0.6)) 
                    drop-shadow(0 0 30px rgba(255, 105, 180, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(255, 105, 180, 0.9)) 
                    drop-shadow(0 0 50px rgba(255, 105, 180, 0.6));
          }
        }
      `}</style>
    </div>
  );
}
