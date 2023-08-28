import React from 'react';
import { Box } from "@react-three/drei";
// import * as THREE from 'three';

type NetProps = {
	netDepth: number,
	netWidth: number,
}

const Net : React.FC<NetProps> = ({
	netDepth,
	netWidth,
}) => {
    //creation de la ligne (le net) du milieu
    const numberOfSegments: number = 15;
    const segmentHeight: number = netDepth / 5;
    const spaceBetweenSegments: number = 1;
    const totalHeight: number = (segmentHeight + spaceBetweenSegments) * numberOfSegments - spaceBetweenSegments; // Subtract space for the last segment

    const segments = Array.from({ length: numberOfSegments }).map((_, index) => {
      const yPosition: number = (totalHeight / 2) - (index * (segmentHeight + spaceBetweenSegments));

      return (
        <Box key={index} position={[0, 0, yPosition]} args={[netWidth, 0, segmentHeight]}>
          <meshBasicMaterial color="white" />
        </Box>
      );
    });

	return (
		<>
			{segments}
		</>
	);
};

export default Net;

// border lines
type BordersProps = {
  WORLD_WIDTH: number,
  WORLD_HEIGHT: number,
}

export const Borders: React.FC<BordersProps> = ({
  WORLD_WIDTH,
  WORLD_HEIGHT
}) => {
  const borderThickness = 0.05; // You can adjust this value
  return (
    <>
      {/* Top Border */}
      <Box position={[0, 0, WORLD_HEIGHT / 2]} args={[WORLD_WIDTH, 1, borderThickness]}>
        <meshBasicMaterial color="white" />
      </Box>
      {/* Bottom Border */}
      <Box position={[0, 0, -WORLD_HEIGHT / 2]} args={[WORLD_WIDTH, 1, borderThickness]}>
        <meshBasicMaterial color="white" />
      </Box>
      
    </>
  );
};
