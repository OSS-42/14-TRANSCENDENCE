import React from 'react';
import { Box } from '@react-three/drei'
import { useFrame, useThree } from "@react-three/fiber";

type LeftPaddleProps = {
	distanceFromCenter: number,
	leftPaddlePositionZ: number,
	setLeftPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>,
	cameraMode: React.Dispatch<React.SetStateAction<"perspective" | "orthographic">>,
	WORLD_WIDTH: number,
	WORLD_HEIGHT: number,
	paddleDepth: number,
	paddleWidth: number,
	paddleHeight: number,
}

const LeftPaddle : React.FC<LeftPaddleProps> = ({
	distanceFromCenter,
	leftPaddlePositionZ,
	setLeftPaddlePositionZ,
	cameraMode,
	paddleDepth,
	paddleHeight,
	paddleWidth,
	WORLD_WIDTH,
	WORLD_HEIGHT,
}) => {

	const leftPaddleXPosition: number = -distanceFromCenter;

		// mouvement du left (user1) paddle a la souris.
	const { mouse } = useThree();
	
	useFrame(() => {
		let newPosition;
		if (cameraMode === "perspective") {
		newPosition = mouse.x * (WORLD_WIDTH / 2);
		} else {
		newPosition = -mouse.y * (WORLD_HEIGHT / 2);
		}

		const paddleTopEdge = newPosition + paddleDepth / 2;
		const paddleBottomEdge = newPosition - paddleDepth / 2;

		if (paddleTopEdge > WORLD_HEIGHT / 2) {
		newPosition = WORLD_HEIGHT / 2 - paddleDepth / 2;
		} else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
		newPosition = -WORLD_HEIGHT / 2 + paddleDepth / 2;
		}

		setLeftPaddlePositionZ(newPosition);
	});

	return (
		<Box position={[leftPaddleXPosition, 0, leftPaddlePositionZ]} args={[paddleWidth, paddleHeight, paddleDepth]}>
		<meshBasicMaterial attach="material" color="white" />
		</Box>
	)
}


export default LeftPaddle;
