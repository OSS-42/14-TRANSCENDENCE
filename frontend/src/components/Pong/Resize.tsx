import React from 'react';

type GameResizeProps = {
	dimension: {width: number; height: number };
	setDimensions: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
	getSpeedFactor: (width: number) => number;
	INITIAL_BALL_SPEED: number;
	ballVelocity: number;
	setBallVelocity: React.Dispatch<React.SetStateAction<{ x: number; z: number }>>;
	ballSpeed: number;
}

//------------------ GAME RESIZING MANAGEMENT ------------------------
// methode pour conserver les ratio sur l'evenement resize
const GameResize: React.FC<GameResizeProps> = ({
	dimension,
	setDimensions,
	getSpeedFactor,
	INITIAL_BALL_SPEED,
	ballVelocity,
	setBallVelocity,
	ballSpeed,
 }) => {
	React.useEffect(() => {
		// const initialSpeedFactor = getSpeedFactor(dimension.width);
		// const [ballSpeed, setBallSpeed] = React.useState(INITIAL_BALL_SPEED * initialSpeedFactor);
		
		function handleResize() {
			let newWidth: number = window.innerWidth;
			let newHeight: number = window.innerWidth * 3 / 4;
	
			if (newWidth > 800) {
			newWidth = 800;
			newHeight = 600;
			}
	
			setDimensions({ width : newWidth, height: newHeight });
	
			const speedFactor = getSpeedFactor(newWidth);
			const newBallSpeed = INITIAL_BALL_SPEED * speedFactor;
	
			const currentVelocityMagnitude = Math.sqrt(Math.pow(ballVelocity.x, 2) + Math.pow(ballVelocity.z, 2));
			
			// Normalize the current velocity
			const normalizedVelocityX = ballVelocity.x / currentVelocityMagnitude;
			const normalizedVelocityZ = ballVelocity.z / currentVelocityMagnitude;
		
			// Scale the normalized velocity by the new speed
			const newVelocityX = normalizedVelocityX * newBallSpeed;
			const newVelocityZ = normalizedVelocityZ * newBallSpeed;
		
			setBallVelocity({ x: newVelocityX, z: newVelocityZ });
			// setBallSpeed(INITIAL_BALL_SPEED * (newWidth / WORLD_WIDTH))
		}
	
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
		}, [getSpeedFactor, INITIAL_BALL_SPEED, ballSpeed, ballVelocity]);
};

export default GameResize;
