import React, { useState } from 'react';
import { Sphere } from '@react-three/drei'
import { useFrame } from "@react-three/fiber";

import { useGameContext } from './GameContext';

type BallProps = {
	handleCountdown: () => void,
	gameStart: boolean,
	WORLD_WIDTH: number,
	WORLD_HEIGHT: number,
	isClassicMode: boolean,
	setCameraMode: React.Dispatch<React.SetStateAction<"perspective" | "orthographic">>,

	isPaused: boolean,
	setIsPaused: React.Dispatch<React.SetStateAction<boolean>>,
	
	powerupVisible: boolean,
	setPowerupVisible: React.Dispatch<React.SetStateAction<boolean>>,
	setPowerupPosition: (position: { x: number, y: number, z: number }) => void,
	powerupPosition: { x: number, y: number, z: number },
	respawnPowerup: () => void,
	
	INITIAL_BALL_SPEED: number,
	ballPosition: { x: number, y:  number, z: number },
	setBallPosition: React.Dispatch<React.SetStateAction<{ x: number, y: number, z: number}>>,
	ballVelocity: { x: number, z: number },
	ballRadius: number,
	setballVelocity: React.Dispatch<React.SetStateAction<{ x: number, z: number }>>,
	checkCollision: (ballPos: { x: number, z: number }, paddlePos: { x: number, z: number }, paddleDims: { width: number, depth: number }) => "top" | "middle" | "bottom" | false,

	paddleWidth: number,
	paddleDepth: number,

	setRightScore: React.Dispatch<React.SetStateAction<number>>,
	rightScore: number,
	setLeftScore: React.Dispatch<React.SetStateAction<number>>,
	leftScore: number,
	setWinner: React.Dispatch<React.SetStateAction<string | null>>,

	playPowerupSound: () => void,
	playBallWallSound: () => void,
	playUserHitSound: () => void,
	playCompHitSound: () => void,
	pausePowerupSound: () => void, // ?
	playGoalSound: () => void,
}

const Ball : React.FC<BallProps> = ({
	isPaused,
	gameStart,
	powerupVisible,
	respawnPowerup,
	setPowerupPosition,
	setPowerupVisible,
	ballRadius,
	setCameraMode,
	playPowerupSound,
	WORLD_WIDTH,
	WORLD_HEIGHT,
	isClassicMode,
	playBallWallSound,
	paddleWidth,
	paddleDepth,
	checkCollision,
	playUserHitSound,
	playCompHitSound,
	pausePowerupSound, // stop the sound of the powerup if a goal is scored (pour ne pas avoir les 2 sons jouant en meme temps)
	playGoalSound,
	setRightScore,
	rightScore,
	setLeftScore,
	leftScore,
	setWinner,
	setIsPaused,
	handleCountdown,
}) => {

	const { powerupPosition, leftPaddlePosition, rightPaddlePosition, ballPosition, setBallPosition } = useGameContext();

	// const [ballPosition, setBallPosition] = useState({ x: 0, y: 0.0001, z: 0 });
	const [ballVelocity, setBallVelocity] = useState({ x: 0.1, z: 0.1 });  // Initialize as you like
	
	useFrame(() => {
		if(isPaused || gameStart) return;

		console.log("Powerup Position: ", powerupPosition);
		console.log("Ball Position: ", ballPosition);

		const INITIAL_BALL_SPEED = 0.1;

		let newX: number = ballPosition.x + ballVelocity.x;
		// ne pas oublier la position de la camera pour la vue top-down
		let newZ: number = ballPosition.z + ballVelocity.z;
		
		const directionZ = Math.sign(ballVelocity.z);

		if (
		  powerupVisible &&
		  Math.abs(ballPosition.x - powerupPosition.x) < ballRadius + 1 &&
		  Math.abs(ballPosition.z - powerupPosition.z) < ballRadius + 1
		) {
			console.log("Collision detected!");
		  setPowerupVisible(false);
		  setCameraMode("perspective");
		  playPowerupSound();
	  
		  setTimeout(() => {
			setCameraMode("orthographic");
			respawnPowerup();
		  }, 12000);
		}

		// Validation de hit avec les murs
		if ((directionZ > 0 && newZ + ballRadius > WORLD_HEIGHT / 2) || 
		(directionZ < 0 && newZ - ballRadius < -WORLD_HEIGHT / 2)) {
		  ballVelocity.z = -ballVelocity.z;
		  newZ = ballPosition.z + ballVelocity.z;
		  if(!isClassicMode)
			playBallWallSound();
		}

		// Validation de hit avec les paddles  
		const paddleDimensions = { width: paddleWidth, depth: paddleDepth };

		const hitSectionLeft = checkCollision({ x: newX, z: newZ }, leftPaddlePosition, paddleDimensions);
		const hitSectionRight = checkCollision({ x: newX, z: newZ }, rightPaddlePosition, paddleDimensions);

		if (hitSectionLeft || hitSectionRight) {
		  const hitPaddlePosition = hitSectionLeft ? leftPaddlePosition : rightPaddlePosition;
		  if (hitSectionLeft && !isClassicMode) {
			playUserHitSound();
		  } else if (hitSectionRight && !isClassicMode) {
			playCompHitSound();
		  }

		  ballVelocity.x = -ballVelocity.x;

		  const relativeCollisionPoint = (newZ - hitPaddlePosition.z) / (paddleDepth / 2);
		  const newZVelocity = ballVelocity.z + relativeCollisionPoint * INITIAL_BALL_SPEED;

		  // Normalize the velocity to maintain the initial speed
		  const magnitude = Math.sqrt(ballVelocity.x ** 2 + newZVelocity ** 2);
		  ballVelocity.x = (ballVelocity.x / magnitude) * INITIAL_BALL_SPEED;
		  ballVelocity.z = (newZVelocity / magnitude) * INITIAL_BALL_SPEED;

		  newX = hitPaddlePosition.x + Math.sign(ballVelocity.x) * (paddleWidth / 2 + ballRadius);
		}

		if (newX - ballRadius <= -WORLD_WIDTH / 2 || newX + ballRadius >= WORLD_WIDTH / 2) {
		  if (!isClassicMode) {
			pausePowerupSound();
			playGoalSound();
		  }

		  // Update scores
		  if (newX - ballRadius <= -WORLD_WIDTH / 2) {
			setRightScore(rightScore + 1);
		  } else if (newX + ballRadius >= WORLD_WIDTH / 2) {
			setLeftScore(leftScore + 1);
		  }

		  if (rightScore + 1 === 11 || leftScore + 1 === 11) {
			if (rightScore + 1 === 11) {
			  setWinner("Right Player Wins!");
			} else if(leftScore + 1 === 11) {
			  setWinner("Left Player Wins!");
			}
			setIsPaused(true);
			return;
		  }

		  setCameraMode("orthographic");

		  newX = 0;
		  newZ = 0;
		  setBallVelocity({ x: INITIAL_BALL_SPEED, z: INITIAL_BALL_SPEED });
		  
		  // Optional: Pause the game if needed
		  setIsPaused(true);
		  handleCountdown();
		}
  
		setBallPosition({
		  x: newX,
		  y: 0.0001,
		  z: newZ
		});
  });
	
	return (
	  <Sphere position={[ballPosition.x, ballPosition.y, ballPosition.z]} args={[ballRadius, 32, 32]}>
		<meshBasicMaterial color="white" />
	  </Sphere>
	)
  }

  export default Ball;
