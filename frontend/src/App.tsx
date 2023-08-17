import * as React from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Box } from "@react-three/drei";
import "./App.css"

const App: React.FC = () => {

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
  
  // ratio pour garder les meme proportions lors d'un resizing de la page
  // attention, a cause du positionnement de la camera, height devient depth et depth devient height.
  const paddleWidth = 0.000625 * dimension.width;
  const paddleHeight = 1;
  const paddleDepth = 0.008333333333 * dimension.height;
  const ballRadius = 0.000625 * dimension.width;
  const netWidth = 0.000625 * dimension.width;
  const netDepth = 0.008333333333 * dimension.height;

  // methode pour conserver les ratio sur l'evenement resize
  React.useEffect(() => {
    function handleResize() {
      let newWidth = window.innerWidth;
      let newHeight = window.innerWidth * 3 / 4;

      if (newWidth > 800) {
        newWidth = 800;
        newHeight = 600;
      }

      setDimensions({ width : newWidth, height: newHeight });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

// offsite pour maintenir les paddles a 0.5 unit de leur bordure respective lorsqu'il y resize
  const distanceFromCenter = 0.024 * dimension.width;

  // fixation des positions gauche et droite des paddles
  const leftPaddleXPosition = -distanceFromCenter;
  const rightPaddleXPosition = distanceFromCenter;

  //creation de la ligne (le net) du milieu
  const numberOfSegments = 15;
  const segmentHeight = netDepth / 5;
  const spaceBetweenSegments = 1;
  const totalHeight = (segmentHeight + spaceBetweenSegments) * numberOfSegments - spaceBetweenSegments; // Subtract space for the last segment

  const segments = Array.from({ length: numberOfSegments }).map((_, index) => {
    const yPosition = (totalHeight / 2) - (index * (segmentHeight + spaceBetweenSegments));

    return (
      <Box key={index} position={[0, 0, yPosition]} args={[netWidth, 0, segmentHeight]}>
        <meshBasicMaterial color="white" />
      </Box>
    );
  });

  // Scoreboard
  const [leftScore, setLeftScore] = React.useState(0);
  const [rightScore, setRightScore] = React.useState(0);
  const baseCanvasWidth = 800;
  const baseFontSize = 60;
  const fontSize = (dimension.width / baseCanvasWidth) * baseFontSize;

  // Dimensions de l'espace de jeu.
  const WORLD_WIDTH = dimension.width / 20 //the camera zoom;
  const WORLD_HEIGHT = dimension.height / 20;

  // facteurs de mise a l'echelle au cas ou (pixels vs canvas units)
  // const xScale = dimension.width / WORLD_WIDTH;
  // const yScale = dimension.height / WORLD_HEIGHT;

  const checkCollision = (ballPos, paddlePos, paddleDims) => {
    const distX = Math.abs(ballPos.x - paddlePos.x);
    const distZ = Math.abs(ballPos.z - paddlePos.z);

    if (distX <= (paddleDims.width / 2 + ballRadius) && (distZ <= paddleDims.depth / 2 + ballRadius)) {
      return true;
    }
    return false;
  };

  // Ball mechanics
  const ACCELERATION_FACTOR = 1.2
  const SPEED_CAP_FACTOR = 0.15 //quand le canvs devient plus petit, au bout d'un 
  //moment la velocite sera plus grande que la distance entre la balle et le mur, et on va "skipper" les collisions

  const speedCap = SPEED_CAP_FACTOR * WORLD_WIDTH;

  const Ball = () => {
    const [ballPosition, setBallPosition] = React.useState({ x: 0, y: 0, z: 0.00001 });
    const [ballVelocity, setBallVelocity] = React.useState({ x: 0.5, z:0.5 });
    
    useFrame(() => {
      const subSteps = 5;
      for (let i = 0; i < subSteps; i++) {
        // utilisation de plus petits bouts de trajectoire pour contrer le tunneling effect.
        let newX = ballPosition.x + ballVelocity.x / subSteps;
        // ne pas oublier la position de la camera pour la vue top-down
        let newZ = ballPosition.z + ballVelocity.z / subSteps;
        
        // Validation de hit avec les paddles  
        const leftPaddlePosition = { x: leftPaddleXPosition, z: 0 };
        const rightPaddlePosition = { x: rightPaddleXPosition, z: 0 };
        const paddleDimensions = { width: paddleWidth, depth: paddleDepth };
        
        if (checkCollision({ x: newX, z: newZ }, leftPaddlePosition, paddleDimensions) ||
            checkCollision({ x: newX, z: newZ }, rightPaddlePosition, paddleDimensions)) {
          const newVelocityX = -ballVelocity.x * ACCELERATION_FACTOR;
          const cappedVelocityX = Math.sign(newVelocityX) * Math.min(Math.abs(newVelocityX), speedCap);
      
        setBallVelocity(prev => ({ 
          x: cappedVelocityX, 
          z: prev.z }));
          console.log('ball speed: ', ballVelocity.x);
          break;
        }

      if (Math.abs(ballVelocity.x) > speedCap) {
        ballVelocity.x = Math.sign(ballVelocity.x) * speedCap;
       }
      
      // Validation de hit avec les murs
      if (newZ + ballRadius > WORLD_HEIGHT / 2 || newZ - ballRadius < -WORLD_HEIGHT / 2) {
        setBallVelocity(prev => ({ x: prev.x, z: -prev.z}));
        break;
      }
      
      setBallPosition({
        x: newX,
        y: newZ,
        z : 0.00001
      });
    }
   });
    
    return (
      <Sphere position={[ballPosition.x, ballPosition.z, ballPosition.y]} args={[ballRadius, 32, 32]}>
        <meshBasicMaterial color="white" />
      </Sphere>
    )
  }

  // mouvement du paddle a la souris.
  const LeftPaddle = () => {
    const { mouse } = useThree();
    const [PositionZ, setPositionZ] = React.useState(0);
    
    useFrame(() => {
      const z = -mouse.y * (WORLD_HEIGHT / 2);
      const paddleTopEdge = z + paddleDepth / 2;
      const paddleBottomEdge = z - paddleDepth / 2;
      
      let newPositionZ = z;
      
      if (paddleTopEdge > WORLD_HEIGHT / 2) {
        newPositionZ = WORLD_HEIGHT / 2 - paddleDepth / 2;
      } else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
        newPositionZ = -WORLD_HEIGHT / 2 + paddleDepth / 2;
      }
      
      setPositionZ(newPositionZ);
    });

    return (
      <Box position={[leftPaddleXPosition, 0, PositionZ]} args={[paddleWidth, paddleHeight, paddleDepth]}>
        <meshBasicMaterial attach="material" color="white" />
      </Box>
    )
  }

  // dessin du canvas
  return (
    <div className="pong-container" style={{ width: dimension.width, height: dimension.height }}>
      <div id = "canvas-container" style = {{ width: dimension.width, height: dimension.height }}>
        <Canvas 
          style={{ background: 'black' }}
          orthographic
          camera={{ position: [0, 10, 0], zoom: 20 }}
          // camera={{ position: [0, 0, 10], zoom: 20 }}
        >
          {/* Ball */}
          {/* <Sphere position={[0, 0, 0.00001]} args={[ballRadius, 32, 32]}>
            <meshBasicMaterial color="white" />
          </Sphere> */}
          <Ball />

          {/* Left Paddle */}
          <LeftPaddle />

          {/* Right Paddle */}
          <Box position={[rightPaddleXPosition, 0, 0]} args={[paddleWidth, paddleHeight, paddleDepth]}>
            <meshBasicMaterial color="white" />
          </Box>

          {/* le net */}
          {segments}
        </Canvas>

        {/* Scoreboard */}
        <div className="scoreboard">
          <span className="left-score" style={{fontSize: `${fontSize}px` }}>{leftScore}</span>
          <span className="right-score"  style={{fontSize: `${fontSize}px` }}>{rightScore}</span>
        </div>

      </div>
    </div>
  );
}

export default App;