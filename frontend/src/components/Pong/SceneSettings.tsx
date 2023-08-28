import React, { useEffect } from 'react';

const SceneSettings: React.FC<{ setSharedValues: (values: SceneParameters) => void }> = ({ setSharedValues }) => {
	const [dimension, setDimensions] = React.useState<{ width: number, height: number }>(() => {
		let initialWidth = window.innerWidth;
		let initialHeight = window.innerWidth * 3 / 4;
	  
		if (initialWidth > 800) {
		  initialWidth = 800;
		  initialHeight = 600;
		}
	  
		return { width: initialWidth, height: initialHeight };
	});
	
	console.log('dans scenesetting.tsx');
	// Dimensions de l'espace de jeu.
	useEffect(() => {
	const CAMERA_ZOOM = 20;
	const WORLD_WIDTH: number = dimension.width / CAMERA_ZOOM;
	const WORLD_HEIGHT: number = dimension.height / CAMERA_ZOOM;
	
	const values = {
		dimension,
		CAMERA_ZOOM,
		WORLD_WIDTH,
		WORLD_HEIGHT,
	};

	setSharedValues(values);

	return null;
	
	}, [dimension, setSharedValues]);
};

export type SceneParameters = {
	dimension: { width: number, height: number },
	CAMERA_ZOOM: number;
	WORLD_WIDTH: number;
	WORLD_HEIGHT: number;
};

export default SceneSettings;
