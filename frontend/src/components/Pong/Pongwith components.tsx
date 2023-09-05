//imports for the page layout
import { Box as MaterialBox } from '@mui/material';
import "./Pong.css";

//imports for the framework, librairies and theirs functionnalities
import React, { createContext, useContext, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

//imports for child components useimport GameKeyBinding from '../components/Pong/KeyBinding';
import GameKeyBinding from '../components/Pong/KeyBinding';
import GameResize from '../components/Pong/Resize';
import Powerup from '../components/Pong/Powerup';
import Net, { Borders } from '../components/Pong/Limits';
import Ball from '../components/Pong/Ball';
import LeftPaddle from '../components/Pong/LeftPaddle';
import RightPaddleComp from '../components/Pong/RightPaddleComp';

//specific import for the camera switching (source : https://codesandbox.io/s/r3f-camera-perspective-ortho-animated-transition-v1-forked-8uvue)
import { ControlledCameras } from "./controlledcamera";
import { GameProvider, useGameContext } from '../components/Pong/GameContext';

export function Pong() {

	//------------------ SCENE SETTINGS ------------------------
    // s'assure que le canvas aura comme maximum toujours 800x600
    const [dimension, setDimensions] = React.useState<{ width: number, height: number }>(() => {
		let initialWidth = window.innerWidth;
		let initialHeight = window.innerWidth * 3 / 4;
	  
		if (initialWidth > 800) {
		  initialWidth = 800;
		  initialHeight = 600;
		}
	  
		return { width: initialWidth, height: initialHeight };
	  });
  
		// Dimensions de l'espace de jeu.
	const CAMERA_ZOOM = 20;
	const WORLD_WIDTH: number = dimension.width / CAMERA_ZOOM;
	const WORLD_HEIGHT: number = dimension.height / CAMERA_ZOOM;

	  	// autre
	const [countdown, setCountdown] = React.useState<number | null>(null);

	// ------------------ GAME UTILS ------------------------
	function getSpeedFactor(width: number) {
		if (width < 300) {
		  return 0.2;
		} else if (width < 450) {
		  return 0.5;
		} else if (width < 700) {
		  return 0.8;
		}
		return 1;
	};

	// Collision Logic with Paddles
	const checkCollision = (ballPos: {x: number, z: number}, paddlePos: {x: number, z: number}, paddleDims: {width: number, depth: number}) => {
		const distX: number = Math.abs(ballPos.x - paddlePos.x);
		const distZ: number = Math.abs(ballPos.z - paddlePos.z);

		if (distX <= (paddleDims.width / 2 + ballRadius) && (distZ <= paddleDims.depth / 2 + ballRadius)) {
			const relativeCollisionPoint: number = (ballPos.z - paddlePos.z) / (paddleDepth / 2);
			if (relativeCollisionPoint > 0.5) {
			return "top";
			} else if (relativeCollisionPoint < -0.5) {
			return "bottom";
			} else {
			return "middle";
			}
		}
		return false;
		};

	// remettre le powerup.
	const respawnPowerup = () => {
		const randomX = (Math.random() * (WORLD_WIDTH - 2)) - (WORLD_WIDTH / 2 - 1);
		const randomZ = (Math.random() * (WORLD_HEIGHT - 2)) - (WORLD_HEIGHT / 2 - 1);
		
		setPowerupPosition({ x: randomX, y: 0, z: randomZ });
		setPowerupVisible(true);
	};

	// ratio pour garder les meme proportions lors d'un resizing de la page
    // attention, a cause du positionnement de la camera, height devient depth et depth devient height.
    const paddleWidth: number = 0.000625 * dimension.width;
    const paddleHeight: number = 1;
    const paddleDepth: number = 0.008333333333 * dimension.height;
    const ballRadius: number = 0.000625 * dimension.width;
    const initialSpeedFactor = getSpeedFactor(dimension.width);
    const INITIAL_BALL_SPEED: number = 0.3 * initialSpeedFactor;
    const netWidth: number = 0.000625 * dimension.width;
    const netDepth: number = 0.008333333333 * dimension.height;
	
	// offsite pour maintenir les paddles a 0.5 unit de leur bordure respective lorsqu'il y a resize
	const distanceFromCenter: number = 0.024 * dimension.width;

	// state variables
	// const { setLeftPaddlePosition, setRightPaddlePosition } = useGameContext();
	const [leftPaddlePositionZ, setLeftPaddlePositionZ] = React.useState(0);
    const [rightPaddlePositionZ, setRightPaddlePositionZ] = React.useState(0);
    const [ballSpeed, setBallSpeed] = React.useState(INITIAL_BALL_SPEED);
    const [ballPosition, setBallPosition] = React.useState({ x: 0, y: 0, z: 0.00001 });
    const [ballVelocity, setBallVelocity] = React.useState({ x: INITIAL_BALL_SPEED, z: INITIAL_BALL_SPEED });
    const [isPaused, setIsPaused] = React.useState(true);
    const [gameStart, setGameStart] = React.useState(true);
    const [cameraMode, setCameraMode] = React.useState<"perspective" | "orthographic">("orthographic");
    const [winner, setWinner] = React.useState<string | null>(null);
    const [isClassicMode, setIsClassicMode] = React.useState(false);
    const [showButtons, setShowButtons] = React.useState(true);
    const [powerupPosition, setPowerupPosition] = React.useState({ x: 0, y: 0, z: 0 });
    const [powerupVisible, setPowerupVisible] = React.useState(false);

	//------------------ GAME START TIMER ------------------------
	// countdown before starting a new game (and after a goal).
	const handleCountdown = () => {
		let currentCountdown = 3;
		setCountdown(currentCountdown);
		const timer = setInterval(() => {
		  currentCountdown -= 1;
		  setCountdown(currentCountdown);
		  if (currentCountdown === 0) {
			clearInterval(timer);
			if (gameStart) {
			  setGameStart(false);
			}
			setIsPaused(false);
			setCountdown(null);
		  }
		}, 1000);
	  };

	//------------------ GAME MODES ------------------------
    const handleClassicMode = () => {
		setCameraMode("orthographic");
		setIsClassicMode(true);
		setShowButtons(false);
		handleCountdown();
	  };
  
	  const handlePowerupMode = () => {
		setCameraMode("orthographic");
		setPowerupVisible(true);
		setIsClassicMode(false);
		setShowButtons(false);
		handleCountdown();
	  };
	
	//------------------ SCORE & SOUNDS ------------------------
	// Scoreboard
    const [leftScore, setLeftScore] = React.useState(0);
    const [rightScore, setRightScore] = React.useState(0);
    const baseCanvasWidth: number = 800;
    const baseFontSize: number = 60;
    const fontSize: number = (dimension.width / baseCanvasWidth) * baseFontSize;

	// sound effects
	const goalSoundRef = React.useRef<HTMLAudioElement>(null);
	const ballWallSoundRef = React.useRef<HTMLAudioElement>(null);
	const powerupHitSoundRef = React.useRef<HTMLAudioElement>(null);
	const userHitSoundRef = React.useRef<HTMLAudioElement>(null);
	const compHitSoundRef = React.useRef<HTMLAudioElement>(null);

	const playGoalSound = () => {
		goalSoundRef.current?.play();
	};

	const playPowerupSound = () => {
		powerupHitSoundRef.current?.play();
	};

	const pausePowerupSound = () => {
		powerupHitSoundRef.current?.pause();
	};

	const playBallWallSound = () => {
		ballWallSoundRef.current?.play();
	};

	const playUserHitSound = () => {
		userHitSoundRef.current?.play();
	}

	const playCompHitSound = () => {
		compHitSoundRef.current?.play();
	}

	return (
		<MaterialBox
		  sx={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			// background: `url('../src/assets/arcade.png') no-repeat center center / cover`,
			background: '#000000',
			borderRadius: '5px',
			margin: '10px',
			padding: '15px',
			height: '92.5vh',
			align: 'center',
		  }}>
			<GameProvider>
			  <div id = "canvas-container" style = {{ width: dimension.width, height: dimension.height }}>
				  <div className="pong-container" style={{ width: dimension.width, height: dimension.height }}>
					  {showButtons && (
					  <div className="starting-screen">
						  <img src="../src/assets/arcade_2k.png" alt="Starting Screen" />
						  <div className="game-buttons" style={{
						  position: 'absolute',
						  top: '50%',
						  left: '50%',
						  transform: 'translate(-50%, -50%)'
						  }}>
						  <button onClick={handleClassicMode}>Classic 1 vs IA</button>
						  <button onClick={handlePowerupMode}>Powerup 1 vs IA</button>
						  </div>
				  </div>
				  )}
				{/* Canvas Container */}
				  <Canvas 
					  style={{ background: cameraMode === "perspective" ? 'url(src/assets/pong_3d_bg2b.png) no-repeat center center / cover' : 'black' }}>
					  {/* Camera Controller */}
					  <ControlledCameras
					  mode={cameraMode}
					  perspectivePosition={[-50, 10, 0]}
					  perspectiveTarget={[0, 0, 0]}
					  orthographicPosition={[0, 10, 0]}
					  orthographicTarget={[0, 0, 0]}
					  perspectiveCameraProps={{ fov: 40, near: 0.1, far: 1000 }}
					  orthographicCameraProps={{ zoom: 20, near: 0, far: 1000 }}
					  mouseButtons={{ LEFT: THREE.MOUSE.ROTATE }}
					  touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
					  />
					<GameKeyBinding 
						gameStart={gameStart}
						isClassicMode={isClassicMode}
						setIsPaused={setIsPaused}
						setGameStart={setGameStart}
						setCameraMode={setCameraMode}
						countdown={countdown}
						setCountdown={setCountdown} />
					<GameResize
						dimension={dimension}
						setDimensions={setDimensions}
						getSpeedFactor={getSpeedFactor}
						INITIAL_BALL_SPEED={INITIAL_BALL_SPEED}
						ballVelocity={ballVelocity}
						setBallVelocity={setBallVelocity}
						ballSpeed={ballSpeed} />
					<Powerup 
						WORLD_WIDTH={WORLD_WIDTH}
						WORLD_HEIGHT={WORLD_HEIGHT}
						setPowerupPosition={setPowerupPosition}
						powerupVisible={powerupVisible}
						isClassicMode={isClassicMode}
						powerupPosition={powerupPosition}
						setPowerupVisible={setPowerupVisible} />
					<Net 
						netWidth={netWidth}
						netDepth={netDepth} />
					<Borders
						WORLD_WIDTH={WORLD_WIDTH}
						WORLD_HEIGHT={WORLD_HEIGHT} />
					<Ball 
						isPaused={isPaused}
						gameStart={gameStart}
						powerupVisible={powerupVisible}
						setPowerupPosition={setPowerupPosition}
						setPowerupVisible={setPowerupVisible}
						respawnPowerup={respawnPowerup}
						ballRadius={ballRadius}
						setCameraMode={setCameraMode}
						playPowerupSound={playPowerupSound}
						WORLD_WIDTH={WORLD_WIDTH}
						WORLD_HEIGHT={WORLD_HEIGHT}
						isClassicMode={isClassicMode}
						playBallWallSound={playBallWallSound}
						paddleWidth={paddleWidth}
						paddleDepth={paddleDepth}
						checkCollision={checkCollision}
						playUserHitSound={playUserHitSound}
						playCompHitSound={playCompHitSound}
						pausePowerupSound={pausePowerupSound} // pour couper le son lors d\un but pendant le powerup.
						playGoalSound={playGoalSound}
						setRightScore={setRightScore}
						rightScore={rightScore}
						setLeftScore={setLeftScore}
						leftScore={leftScore}
						setWinner={setWinner}
						setIsPaused={setIsPaused}
						handleCountdown={handleCountdown} />
					<LeftPaddle 
						distanceFromCenter={distanceFromCenter}
						leftPaddlePositionZ={leftPaddlePositionZ}
						setLeftPaddlePositionZ={setLeftPaddlePositionZ}
						cameraMode={cameraMode}
						paddleDepth={paddleDepth}
						paddleHeight={paddleHeight}
						paddleWidth={paddleWidth}
						WORLD_WIDTH={WORLD_WIDTH}
						WORLD_HEIGHT={WORLD_HEIGHT} />
					<RightPaddleComp 
						distanceFromCenter={distanceFromCenter}
						rightPaddlePositionZ={rightPaddlePositionZ}
						setRightPaddlePositionZ={setRightPaddlePositionZ}
						cameraMode={cameraMode}
						paddleDepth={paddleDepth}
						paddleHeight={paddleHeight}
						paddleWidth={paddleWidth}
						WORLD_HEIGHT={WORLD_HEIGHT} />
				</Canvas>
					{/* Scoreboard */}
					<div className="scoreboard">
						<div className="player-info">
							<span className="player-name">Player 1</span>
							<span className="left-score" style={{fontSize: `${fontSize}px` }}>{leftScore}</span>
						</div>
						<div className="player-info">
							<span className="player-name">Computer</span>
							<span className="right-score"  style={{fontSize: `${fontSize}px` }}>{rightScore}</span>
						</div>
						<div className="winner-message">
							{winner && <span>{winner}</span>}
						</div>
						{/* <div className="pause-message">
						{isPaused && !gameStart && <span>Game Paused</span>}
						</div> */}
						{/* timer */}
						<div className="countdown">
							{countdown !== null && <span style={{ fontSize: `${fontSize}px` }}>{countdown}</span>}
						</div>
					</div>
					{/* Sound elements */}
					<audio ref={goalSoundRef} src="src/assets/neo-tokyo-goal.mp3" />
					<audio ref={powerupHitSoundRef} src="src/assets/mario-star.mp3" />
					<audio ref={ballWallSoundRef} src="src/assets/pong-ball.ogg" />
					<audio ref={userHitSoundRef} src="src/assets/paddle-hit.mp3" />
					<audio ref={compHitSoundRef} src="src/assets/paddle-hit2.mp3" />
				</div>
			</div>
			</GameProvider>
		</MaterialBox>
  )
}
