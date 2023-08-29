import React, { createContext, useContext, useState, FunctionComponent, useEffect } from 'react';

interface GameContextProps {
  powerupPosition: { x: number, y: number, z: number } | null;
  setPowerupPosition: React.Dispatch<React.SetStateAction<{ x: number, y: number, z: number } | null>>;
  respawnPowerup: () => void;
  setRespawnPowerup: React.Dispatch<React.SetStateAction<(() => void) | null>>;
  leftPaddlePosition: {x: number, z: number} | null;
  setLeftPaddlePosition: React.Dispatch<React.SetStateAction<{ x: number, z: number } | null>>;
  rightPaddlePosition: { x: number, z: number } | null;
  setRightPaddlePosition: React.Dispatch<React.SetStateAction<{ x: number, z: number } | null>>;
  ballPosition: { x: number, y: number, z: number } | null;
  setBallPosition: React.Dispatch<React.SetStateAction<{ x: number, y: number, z: number } | null>>;
}

export const GameContext = createContext<GameContextProps | null>(null);

export const useGameContext = () => {
  return useContext(GameContext);
};

export const GameProvider: FunctionComponent = ({ children }) => {
  const [powerupPosition, setPowerupPosition] = useState<{ x: Number, y: Number, z: number } | null>({ x: 0, y: 0, z: 0 });
  const [respawnPowerup, setRespawnPowerup] = useState<(() => void) | null>(() => { console.log("Respawn Powerup Called"); }); // fonction no-op
  const [leftPaddlePosition, setLeftPaddlePosition] = useState<{ x: number, z: number } | null>(null);
  const [rightPaddlePosition, setRightPaddlePosition] = useState<{ x: number, z: number } | null>(null);
  const [ballPosition, setBallPosition] = useState<{ x: number, y: number, z: number } | null>({ x: 0, y: 0, z: 0.00001 });

  return (
    <GameContext.Provider value={{
      powerupPosition, setPowerupPosition,
      respawnPowerup, setRespawnPowerup,
      leftPaddlePosition, setLeftPaddlePosition,
      rightPaddlePosition, setRightPaddlePosition,
      ballPosition, setBallPosition,
       }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
	  throw new Error('useGame must be used within a GameProvider');
	}
	return context;
};
