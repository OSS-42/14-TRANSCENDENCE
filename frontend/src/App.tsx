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

    // Dimensions de l'espace de jeu.
    const WORLD_WIDTH: number = dimension.width / 20 //the camera zoom;
    const WORLD_HEIGHT: number = dimension.height / 20;
  
  // ratio pour garder les meme proportions lors d'un resizing de la page
  // attention, a cause du positionnement de la camera, height devient depth et depth devient height.
  const paddleWidth: number = 0.000625 * dimension.width;
  const paddleHeight: number = 1;
  const paddleDepth: number = 0.008333333333 * dimension.height;
  const ballRadius: number = 0.000625 * dimension.width;
  const initialSpeedFactor = getSpeedFactor(dimension.width);
  const INITIAL_BALL_SPEED: number = 0.2 * initialSpeedFactor;
  const netWidth: number = 0.000625 * dimension.width;
  const netDepth: number = 0.008333333333 * dimension.height;

  const [leftPaddlePositionZ, setLeftPaddlePositionZ] = React.useState(0);
  const [rightPaddlePositionZ, setRightPaddlePositionZ] = React.useState(0);
  const [ballSpeed, setBallSpeed] = React.useState(INITIAL_BALL_SPEED);
  const [ballPosition, setBallPosition] = React.useState({ x: 0, y: 0, z: 0.00001 });
  const [ballVelocity, setBallVelocity] = React.useState({ x: INITIAL_BALL_SPEED, z: INITIAL_BALL_SPEED });
  const [isPaused, setIsPaused] = React.useState(true);
  const [gameStart, setGameStart] = React.useState(true);
  const [isOrthographic, setIsOrthographic] = React.useState(true);
  
  function getSpeedFactor(width: number) {
    if (width < 300) {
      return 0.2;
    } else if (width < 450) {
      return 0.5;
    } else if (width < 700) {
      return 0.8;
    }
    return 1;
  }

  const handleCountdown = () => {
    setCountdown(3);
    // setCountdown(3);
  const timer = setInterval(() => {
    setCountdown(prevCount => (prevCount !== null && prevCount > 0 ? prevCount - 1 : null));
  }, 1000);
  
    setTimeout(() => {
      clearInterval(timer);
      if (gameStart) {
        setGameStart(false);
      }
      setIsPaused(false);
    }, 3000);

    return () => clearInterval(timer);
  };

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if(event.key === 'c' || event.key === 'C') {
        setIsOrthographic(!isOrthographic);
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOrthographic])
  
  // methode pour conserver les ratio sur l'evenement resize
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
  }, [ballSpeed, ballVelocity]);

  React.useEffect(() => {
    handleCountdown();
  }, [gameStart]);

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

// Timer to restart
  const [countdown, setCountdown] = React.useState<number | null>(null);

  const checkCollision = (ballPos, paddlePos, paddleDims) => {
    const distX: number = Math.abs(ballPos.x - paddlePos.x);
    const distZ: number = Math.abs(ballPos.z - paddlePos.z);

    if (distX <= (paddleDims.width / 2 + ballRadius) && (distZ <= paddleDims.depth / 2 + ballRadius)) {
      const relativeCollisionPoint: number = (ballPos.z - paddlePos.z) / (paddleDepth / 2);
      if (relativeCollisionPoint > 0.5) {
        return "top";
      } else if (relativeCollisionPoint < -0.5) {
        return "bottom";
      } else {
        return "middle";
      }
    }
    return false;
  };

  // Ball mechanics
  const Ball = ({ ballPosition, setBallPosition, ballVelocity, setBallVelocity }) => {
    
    useFrame(() => {
        if(isPaused || gameStart) return;

        let newX: number = ballPosition.x + ballVelocity.x;
        // ne pas oublier la position de la camera pour la vue top-down
        let newZ: number = ballPosition.z + ballVelocity.z;
        
        const directionZ = Math.sign(ballVelocity.z);

        // Validation de hit avec les murs
        if ((directionZ > 0 && newZ + ballRadius > WORLD_HEIGHT / 2) || 
        (directionZ < 0 && newZ - ballRadius < -WORLD_HEIGHT / 2)) {
          ballVelocity.z = -ballVelocity.z;
          newZ = ballPosition.z + ballVelocity.z;
        }

        // Validation de hit avec les paddles  
        const leftPaddlePosition = { x: leftPaddleXPosition, z: leftPaddlePositionZ };
        const rightPaddlePosition = { x: rightPaddleXPosition, z: rightPaddlePositionZ };
        const paddleDimensions = { width: paddleWidth, depth: paddleDepth };

        const hitSectionLeft = checkCollision({ x: newX, z: newZ }, leftPaddlePosition, paddleDimensions);
        const hitSectionRight = checkCollision({ x: newX, z: newZ }, rightPaddlePosition, paddleDimensions);
        
        // const oldZVelocity: number = ballVelocity.z;

        if (hitSectionLeft || hitSectionRight) {
          const hitPaddlePosition = hitSectionLeft ? leftPaddlePosition : rightPaddlePosition;

          ballVelocity.x = -ballVelocity.x;

          newX = hitPaddlePosition.x + Math.sign(ballVelocity.x) * (paddleWidth / 2 + ballRadius);
        }

        // Goal Validation
        if (newX - ballRadius <= - WORLD_WIDTH / 2) {
          setRightScore(rightScore + 1);
        } else if (newX + ballRadius >= WORLD_WIDTH / 2) {
          setLeftScore(leftScore + 1);
        }
        
        setBallPosition({
          x: newX,
          y: 0.0001,
          z: newZ
        });
  });
    
    return (
      <Sphere position={[ballPosition.x, ballPosition.y, ballPosition.z]} args={[ballRadius, 32, 32]}>
        <meshBasicMaterial color="white" />
      </Sphere>
    )
  }

  // mouvement du paddle a la souris.
  const LeftPaddle = ({ leftPaddlePositionZ, setLeftPaddlePositionZ }) => {
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
      
      setLeftPaddlePositionZ(newPositionZ);
    });

    return (
      <Box position={[leftPaddleXPosition, 0, leftPaddlePositionZ]} args={[paddleWidth, paddleHeight, paddleDepth]}>
        <meshBasicMaterial attach="material" color="white" />
      </Box>
    )
  }

  // Right paddle (Computer)
  const RIGHT_PADDLE_SPEED: number = 1;

  const lerp = (a, b, t) => a + t * (b - a);

  const RightPaddle = ({ rightPaddlePositionZ, setRightPaddlePositionZ }) => {

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


  // dessin du canvas
  return (
    <div className="pong-container" style={{ width: dimension.width, height: dimension.height }}>
      <div id = "canvas-container" style = {{ width: dimension.width, height: dimension.height }}>
        <Canvas 
          style={{ background: 'black' }}
          orthographic={isOrthographic}
          camera={
            isOrthographic
            ? { position: [0, 10, 0], zoom: 20 }
            : { position: [leftPaddleXPosition - 5, 3, leftPaddleXPosition - 5], fov: 75 }
            }
        >
          {/* Ball */}
          <Ball 
            ballPosition={ballPosition}
            setBallPosition={setBallPosition}
            ballVelocity={ballVelocity}
            setBallVelocity={setBallVelocity}
            speedFactor={ballSpeed}
          />

          {/* Left Paddle */}
          <LeftPaddle leftPaddlePositionZ={leftPaddlePositionZ} setLeftPaddlePositionZ={setLeftPaddlePositionZ} />

          {/* Right Paddle */}
          <RightPaddle rightPaddlePositionZ={rightPaddlePositionZ} setRightPaddlePositionZ={setRightPaddlePositionZ} />

          {/* le net */}
          {segments}
        </Canvas>

        {/* Scoreboard */}
        <div className="scoreboard">
          <span className="left-score" style={{fontSize: `${fontSize}px` }}>{leftScore}</span>
          <span className="right-score"  style={{fontSize: `${fontSize}px` }}>{rightScore}</span>
        </div>

        {/* timer */}
        <div className="countdown">
          {countdown !== null && <span style={{ fontSize: `${fontSize}px` }}>{countdown}</span>}
        </div>

      </div>
    </div>
  );
}

export default App;