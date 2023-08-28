import React from 'react';
import { Box } from '@react-three/drei'
import { useFrame } from "@react-three/fiber";


type RightPaddleCompProps = {
	distanceFromCenter: number,
	rightPaddlePositionZ: number,
	setRightPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>,
	ballPosition: {x: number, z: number },
	WORLD_HEIGHT: number,
	WORLD_WIDTH: number,
	paddleDepth: number,
	paddleWidth: number,
	paddleHeight: number,
}

// Right paddle (Computer - User2)
const RightPaddleComp : React.FC<RightPaddleCompProps> = ({
	distanceFromCenter,
	rightPaddlePositionZ,
	setRightPaddlePositionZ,
	ballPosition,
	WORLD_HEIGHT,
	WORLD_WIDTH,
	paddleDepth,
	paddleWidth,
	paddleHeight,
}) => {

	const rightPaddleXPosition: number = distanceFromCenter;
	const RIGHT_PADDLE_SPEED: number = 0.8;

	const lerp = (a: number, b: number, t: number) => a + t * (b - a);

	useFrame(() => {
		const direction: number = Math.sign(ballPosition.z - rightPaddlePositionZ);

		let newZ = lerp(rightPaddlePositionZ, rightPaddlePositionZ + direction * RIGHT_PADDLE_SPEED, 0.2);

		const paddleTopEdge: number = newZ + paddleDepth / 2;
		const paddleBottomEdge: number = newZ - paddleDepth / 2;

		if (paddleTopEdge > WORLD_HEIGHT / 2) {
		newZ = WORLD_HEIGHT / 2 - paddleDepth / 2;
		} else if (paddleBottomEdge < - WORLD_HEIGHT / 2) {
		newZ = -WORLD_HEIGHT / 2 + paddleDepth / 2;
		}

		setRightPaddlePositionZ(newZ);

	});

	return (
		<Box position={[rightPaddleXPosition, 0, rightPaddlePositionZ]} args={[paddleWidth, paddleHeight, paddleDepth]}>
		<meshBasicMaterial color="white" />
		</Box>
	);
	}
}