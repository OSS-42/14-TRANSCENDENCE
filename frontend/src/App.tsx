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
  const paddleWidth: number = 0.000625 * dimension.width;
  const paddleHeight: number = 1;
  const paddleDepth: number = 0.008333333333 * dimension.height;
  const ballRadius: number = 0.000625 * dimension.width;
  const netWidth: number = 0.000625 * dimension.width;
  const netDepth: number = 0.008333333333 * dimension.height;

  const [positionZ, setPositionZ] = React.useState(0);
  const [ballPosition, setBallPosition] = React.useState({ x: 0, y: 0, z: 0.00001 });
  const [ballVelocity, setBallVelocity] = React.useState({ x: 0.5, z:0.5 });

  // methode pour conserver les ratio sur l'evenement resize
  React.useEffect(() => {
    function handleResize() {
      let newWidth: number = window.innerWidth;
      let newHeight: number = window.innerWidth * 3 / 4;

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
  const distanceFromCenter: number = 0.024 * dimension.width;

  // fixation des positions gauche et droite des paddles
  const leftPaddleXPosition: number = -distanceFromCenter;
  const rightPaddleXPosition: number = distanceFromCenter;

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

  // Scoreboard
  const [leftScore, setLeftScore] = React.useState(0);
  const [rightScore, setRightScore] = React.useState(0);
  const baseCanvasWidth: number = 800;
  const baseFontSize: number = 60;
  const fontSize: number = (dimension.width / baseCanvasWidth) * baseFontSize;

  // Dimensions de l'espace de jeu.
  const WORLD_WIDTH: number = dimension.width / 20 //the camera zoom;
  const WORLD_HEIGHT: number = dimension.height / 20;

  // facteurs de mise a l'echelle au cas ou (pixels vs canvas units)
  // const xScale = dimension.width / WORLD_WIDTH;
  // const yScale = dimension.height / WORLD_HEIGHT;

  const checkCollision = (ballPos, paddlePos, paddleDims) => {
    const distX: number = Math.abs(ballPos.x - paddlePos.x);
    const distZ: number = Math.abs(ballPos.z - paddlePos.z);

    if (distX <= (paddleDims.width / 2 + ballRadius) && (distZ <= paddleDims.depth / 2 + ballRadius)) {
      return true;
    }
    return false;
  };

  // Ball mechanics
  const ACCELERATION_FACTOR: number = 1.2
  const SPEED_CAP_FACTOR: number = 0.15 //quand le canvs devient plus petit, au bout d'un 
  //moment la velocite sera plus grande que la distance entre la balle et le mur, et on va "skipper" les collisions

  const speedCap: number = SPEED_CAP_FACTOR * WORLD_WIDTH;

  const Ball = ({ ballPosition, setBallPosition, ballVelocity, setBallVelocity }) => {
    
    useFrame(() => {
      const subSteps: number = 5;
      for (let i = 0; i < subSteps; i++) {
        // utilisation de plus petits bouts de trajectoire pour contrer le tunneling effect.
        let newX: number = ballPosition.x + ballVelocity.x / subSteps;
        // ne pas oublier la position de la camera pour la vue top-down
        let newZ: number = ballPosition.z + ballVelocity.z / subSteps;
        
        // Validation de hit avec les paddles  
        const leftPaddlePosition = { x: leftPaddleXPosition, z: positionZ };
        const rightPaddlePosition = { x: rightPaddleXPosition, z: 0 };
        const paddleDimensions = { width: paddleWidth, depth: paddleDepth };
        
        if (checkCollision({ x: newX, z: newZ }, leftPaddlePosition, paddleDimensions) ||
            checkCollision({ x: newX, z: newZ }, rightPaddlePosition, paddleDimensions)) {
          
          const hitPaddlePosition = checkCollision({ x: newX, z: newZ }, leftPaddlePosition, paddleDimensions) ? leftPaddlePosition : rightPaddlePosition;
          const relativeCollisionPoint: number = (newZ - hitPaddlePosition.z) / (paddleDepth / 2);
          const angleFactor: number = 4;
          const newVelocityZ: number = ballVelocity.z + angleFactor * relativeCollisionPoint;

          const newVelocityX:  number = -ballVelocity.x * ACCELERATION_FACTOR;
          const cappedVelocityX:  number = Math.sign(newVelocityX) * Math.min(Math.abs(newVelocityX), speedCap);
      
          // Directly assign new velocities for immediate effect
          // ballVelocity.x = cappedVelocityX;
          // ballVelocity.z = newVelocityZ;

          setBallVelocity({ 
            x: cappedVelocityX, 
            z: newVelocityZ });

            newX = ballPosition.x + cappedVelocityX / subSteps;
            newZ = ballPosition.z + newVelocityZ / subSteps;
        }
        
        if (Math.abs(ballVelocity.x) > speedCap) {
          ballVelocity.x = Math.sign(ballVelocity.x) * speedCap;
        }
        
        // Validation de hit avec les murs
        if (newZ + ballRadius > WORLD_HEIGHT / 2 || newZ - ballRadius < -WORLD_HEIGHT / 2) {
          ballVelocity.z = -ballVelocity.z;
        }
        
        setBallPosition({
          x: newX,
          y: newZ,
          z : 0.00001
        });
      }
      console.log('ball speed: ', ballVelocity.x);
  });
    
    return (
      <Sphere position={[ballPosition.x, ballPosition.z, ballPosition.y]} args={[ballRadius, 32, 32]}>
        <meshBasicMaterial color="white" />
      </Sphere>
    )
  }

  // mouvement du paddle a la souris.
  const LeftPaddle = ({ positionZ, setPositionZ }) => {
    const { mouse } = useThree();
    
    useFrame(() => {
      const z: number = -mouse.y * (WORLD_HEIGHT / 2);
      const paddleTopEdge: number = z + paddleDepth / 2;
      const paddleBottomEdge: number = z - paddleDepth / 2;
      
      let newPositionZ: number = z;
      
      if (paddleTopEdge > WORLD_HEIGHT / 2) {
        newPositionZ = WORLD_HEIGHT / 2 - paddleDepth / 2;
      } else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
        newPositionZ = -WORLD_HEIGHT / 2 + paddleDepth / 2;
      }
      
      setPositionZ(newPositionZ);
    });

    return (
      <Box position={[leftPaddleXPosition, 0, positionZ]} args={[paddleWidth, paddleHeight, paddleDepth]}>
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
          <Ball 
            ballPosition={ballPosition}
            setBallPosition={setBallPosition}
            ballVelocity={ballVelocity}
            setBallVelocity={setBallVelocity}
          />

          {/* Left Paddle */}
          <LeftPaddle positionZ={positionZ} setPositionZ={setPositionZ} />

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