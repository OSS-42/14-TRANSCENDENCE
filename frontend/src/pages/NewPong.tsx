//imports for the page layout
import { Box as MaterialBox } from '@mui/material';
import "./Pong.css";

//imports for the framework, librairies and theirs functionnalities
import React, { useState } from 'react';

//imports for child components use
import SceneSettings, { SceneParameters } from '../components/Pong/SceneSettings';
import GameKeyBinding from '../components/Pong/KeyBinding.tsx';
import GameResize from '../components/Pong/Resize.tsx';
import Powerup from '../components/Pong/Powerup.tsx';
import Net from '../components/Pong/Net';

//specific import for the camera switching (source : https://codesandbox.io/s/r3f-camera-perspective-ortho-animated-transition-v1-forked-8uvue)
import { ControlledCameras } from "./controlledcamera.tsx";

export function Pong() {
	
	// ------------------ GAME CONSTANTS ------------------------
	// necessary to keep them here for better data flow and components construction.

	// const  from components.
	const [sharedValues, setSharedValues] = useState<SceneParameters | null>(null);
	if (!sharedValues) {
		console.log('Shared Values missing!');
		return null; // You can return a loading spinner or an error message here
	}

	const { dimension, WORLD_WIDTH, WORLD_HEIGHT } = sharedValues;
	const [countdown, setCountdown] = React.useState<number | null>(null);

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
			<SceneSettings 
				setSharedValues={setSharedValues} />
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
				setPowerupVisible={setPowerupVisible}
				respawnPowerup={respawnPowerUp} />
			<Net 
				netWidth={netWidth}
				netDepth={netDepth} />
		</MaterialBox>
  )
}
