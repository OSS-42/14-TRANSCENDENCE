import React, { useEffect } from  'react';
import { Box } from "@react-three/drei";
import * as THREE from 'three';

import { useGameContext } from './GameContext';

type PowerupProps = {
	WORLD_WIDTH: number,
	WORLD_HEIGHT: number,
	setPowerupPosition: (position: {x: number, y: number, z: number}) => void,
	setPowerupVisible: React.Dispatch<React.SetStateAction<boolean>>,
	powerupVisible: boolean,
	isClassicMode: boolean,
	powerupPosition: {x: number, y: number, z: number },
	// setRespawnPowerup?: (respawnFunction: () => void) => void;
}
//------------------ GAME POWERUP ------------------------
    // powerup
const Powerup : React.FC<PowerupProps> = ({
	WORLD_WIDTH,
	WORLD_HEIGHT,
	setPowerupPosition,
	powerupVisible,
	isClassicMode,
	powerupPosition,
	setPowerupVisible,
}) => {
    useEffect(() => {
		const randomX = (Math.random() * (WORLD_WIDTH - 10)) - (WORLD_WIDTH / 2 - 9);
		const randomZ = (Math.random() * (WORLD_HEIGHT - 2)) - (WORLD_HEIGHT / 2 - 1);
		setPowerupPosition({ x: randomX, y: 0, z: randomZ });
	  }, []);
  
	const Powerup = () => {
		if (!powerupVisible || isClassicMode) return null;

		const textTexture = React.useMemo(createTextTexture, []);

		return (
		<Box position={[powerupPosition.x, powerupPosition.y, powerupPosition.z]} args={[1, 1, 1]}>
			<meshBasicMaterial attachArray="material" map={textTexture} />
		</Box>
		);
	};
  
	const respawnPowerup = () => {
		const randomX = (Math.random() * (WORLD_WIDTH - 2)) - (WORLD_WIDTH / 2 - 1);
		const randomZ = (Math.random() * (WORLD_HEIGHT - 2)) - (WORLD_HEIGHT / 2 - 1);
		
		setPowerupPosition({ x: randomX, y: 0, z: randomZ });
		setPowerupVisible(true);
	};
  
	const createTextTexture = () => {
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = 'yellow'; // Background color
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.font = 'Bold 200px Impact';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'black'; // Text color
			ctx.fillText('3D', canvas.width / 2, canvas.height / 2);
		}
		return new THREE.CanvasTexture(canvas);
	};

	const { setRespawnPowerup, setShouldSetRespawnPowerup } = useGameContext();

	useEffect(() => {
	// 
	setShouldSetRespawnPowerup(true);
	}, [respawnPowerup]);

	return powerupVisible && !isClassicMode ? <Powerup /> : null;
}

export default Powerup;
