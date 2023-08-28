import React from 'react';

type GameKeyBindingProps = {
	isClassicMode: boolean,
	setCameraMode: React.Dispatch<React.SetStateAction<"perspective" | "orthographic">>,
};

//------------------ GAME KEY BINDING ------------------------
const GameKeyBinding: React.FC<GameKeyBindingProps> = ({ 
	isClassicMode,
	setCameraMode,
 }) => {
  
  // gestion des touches (a confirmer si necessaire (P = pause, C = changement de camera)
  const handleKeyPress = (event: KeyboardEvent) => {
	// if (event.key === "p" || event.key === "P") {
	//   setIsPaused(prevIsPaused => !prevIsPaused); // Toggle the pause state
	// }
	if (isClassicMode) return;
	if (event.key === "c" || event.key === "C") {
	  // Toggle the camera mode when the "C" key is pressed
	  console.log('c has been pressed');
	  setCameraMode(prevMode => (prevMode === "orthographic" ? "perspective" : "orthographic"));
	}
  };

  React.useEffect(() => {
	window.addEventListener("keydown", handleKeyPress);

	// Clean up the event listener when the component unmounts
	return () => {
	  window.removeEventListener("keydown", handleKeyPress);
	};
  }, [isClassicMode]);
};

export default GameKeyBinding;
