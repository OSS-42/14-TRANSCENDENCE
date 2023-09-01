// Complete Pong code. To be sliced accross multiples files for clarity.
// TO DO : create a 1 vs 1 mode (the right paddle becomes user controlled)
// TO DO : websocket connections for data transfer (for the second client (user) to be able to play)
// TO DO : matchmaking system.

import { Box as MaterialBox } from '@mui/material'

import React, { useEffect } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Box } from "@react-three/drei";
import "./Pong.css"
import * as THREE from 'three';

// import { ControlledCameras } from "./controlledcamera";
import { ControlledCameras } from "../components/Pong/controlledcamera-2"; // Assuming it's exported from a file named ControlledCameras.tsx

// import for DB
import axios from "axios";
import Cookies from "js-cookie";

export function Pong() {
//------------------ CONSTANTS NECESSARY AT TOP --------------------
const [gameLaunched, setGameLaunched] = React.useState(false);
const [cameraMode, setCameraMode] = React.useState<"perspective" | "orthographic">("orthographic");
const [isPaused, setIsPaused] = React.useState(true);
const [gameStart, setGameStart] = React.useState(true);

const [isClassicModeIA, setIsClassicModeIA] = React.useState(false);
const [isClassicModeMulti, setIsClassicModeMulti] = React.useState(false);
const [showButtons, setShowButtons] = React.useState(true);

//------------------ CLIENT-SERVER SETTINGS ------------------------
  const [hostStatus, setHostStatus] = React.useState<boolean>(false);
  const [hostName, setHostName] = React.useState<string>("");
  const [clientName, setClientName ] = React.useState<string>("");
  
  

//------------------ SCENE SETTINGS ------------------------
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
    const CAMERA_ZOOM = 20;
    const WORLD_WIDTH: number = dimension.width / CAMERA_ZOOM;
    const WORLD_HEIGHT: number = dimension.height / CAMERA_ZOOM;

    //------------------ USER NAME - LEFT ------------------------
    // const [username, setUsername] = React.useState(null);
    
    useEffect(() => {
      const jwt_token = Cookies.get("jwt_token");
    
      // Create a new CancelToken
      const source = axios.CancelToken.source();
    
      async function fetchUsersData() {
        try {
          const response = await axios.get("http://localhost:3001/users/me", {
            headers: {
              Authorization: "Bearer " + jwt_token,
            },
            cancelToken: source.token, // Pass cancel token to axios
          });
          if (isClassicModeIA === true) {
              setHostName(response.data.username);
              setClientName("Computer");
          } else {
            if (hostStatus === true) {
              setHostName(response.data.username);
              setClientName("Player 2");
            } else {
              setHostName("Player 2");
              setClientName(response.data.username);
            }
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log("Request cancelled");
          }
        }
      }
    
      fetchUsersData();
    
      // Cleanup function
      return () => {
        source.cancel("Operation canceled by the user.");
      };
    }, [isClassicModeIA, isClassicModeMulti, hostStatus]);

//------------------ GAME VARIABLES ------------------------
    // ratio pour garder les meme proportions lors d'un resizing de la page
    // attention, a cause du positionnement de la camera, height devient depth et depth devient height.
    const paddleWidth: number = 0.000625 * dimension.width;
    const paddleHeight: number = 1;
    const paddleDepth: number = 0.008333333333 * dimension.height;
    const ballRadius: number = 0.000625 * dimension.width;
    const initialSpeedFactor = getSpeedFactor(dimension.width);
    const INITIAL_BALL_SPEED: number = 0.3 * initialSpeedFactor;
    const netWidth: number = 0.000625 * dimension.width;
    const netDepth: number = 0.008333333333 * dimension.height;
    
    const [leftPaddlePositionZ, setLeftPaddlePositionZ] = React.useState(0);
    const [rightPaddlePositionZ, setRightPaddlePositionZ] = React.useState(0);
    const [ballSpeed, setBallSpeed] = React.useState(INITIAL_BALL_SPEED);
    const [ballPosition, setBallPosition] = React.useState({ x: 0, y: 0, z: 0.00001 });
    const [ballVelocity, setBallVelocity] = React.useState({ x: INITIAL_BALL_SPEED, z: INITIAL_BALL_SPEED });
    const [winner, setWinner] = React.useState<string | null>(null);
    const [powerupPosition, setPowerupPosition] = React.useState({ x: 0, y: 0, z: 0 });
    const [powerupVisible, setPowerupVisible] = React.useState(false);

//------------------ GAME UTILS ------------------------
    function getSpeedFactor(width: number): number {
      if (width < 300) {
        return 0.2;
      } else if (width < 450) {
        return 0.5;
      } else if (width < 700) {
        return 0.8;
      }
      return 1;
    }

//------------------ GAME GENERAL BEHAVIOR ------------------------
    const handleCountdown = (): void => {
      let currentCountdown = 3;
      setCountdown(currentCountdown);
      const timer = setInterval(() => {
        if (winner) {
          clearInterval(timer);
          return;
        }

        // issue : last countdown after a winner.
        currentCountdown -= 1;
        setCountdown(currentCountdown);
        if (currentCountdown === 0) {
          clearInterval(timer);
          if (gameStart) {
            setGameStart(false);
          }
          setIsPaused(false);
          setCountdown(null);
        }
      }, 1000);
    };

    // Timer to restart
    const [countdown, setCountdown] = React.useState<number | null>(null);

    const handleKeyPress = (event: KeyboardEvent): void => {
      if (isClassicModeIA) return;
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
    }, [isClassicModeIA]);

    //------------------ GAME MODES ------------------------
    const handleClassicModeIA = (): void => {
      console.log('classic 1 vs IA');
      setGameLaunched(true);
      setCameraMode("orthographic");
      setIsClassicModeIA(true);
      setIsClassicModeMulti(false);
      setShowButtons(false);
      handleCountdown();
    };

    const handlePowerupModeIA = (): void => {
      console.log('powerup 1 vs IA');
      setGameLaunched(true);
      setCameraMode("orthographic");
      setPowerupVisible(true);
      setIsClassicModeIA(true);
      setIsClassicModeMulti(false);
      setShowButtons(false);
      handleCountdown();
    };

    const handleClassicModeMulti = (): void => {
      console.log('classic 1 vs 1');
      setGameLaunched(true);
      setCameraMode("orthographic");
      setIsClassicModeIA(false);
      setIsClassicModeMulti(true);
      setShowButtons(false);
      handleCountdown();
    };

    const handlePowerupModeMulti = (): void => {
      console.log('powerup 1 vs multi');
      setGameLaunched(true);
      setCameraMode("orthographic");
      setPowerupVisible(true);
      setIsClassicModeIA(false);
      setIsClassicModeMulti(true);
      setShowButtons(false);
      handleCountdown();
    };

//------------------ GAME RESIZING MANAGEMENT ------------------------
    // methode pour conserver les ratio sur l'evenement resize
    React.useEffect(() => {
      // const initialSpeedFactor = getSpeedFactor(dimension.width);
      // const [ballSpeed, setBallSpeed] = React.useState(INITIAL_BALL_SPEED * initialSpeedFactor);
      
      const handleResize: () => void = () => {
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

    // offsite pour maintenir les paddles a 0.5 unit de leur bordure respective lorsqu'il y a resize
    const distanceFromCenter: number = 0.024 * dimension.width;

//------------------ GAME OBJECTS ------------------------

    React.useEffect(() => {
      // const randomX = (Math.random() * (WORLD_WIDTH - 10)) - (WORLD_WIDTH / 2 - 9);
      const randomZ = (Math.random() * (WORLD_HEIGHT - 2)) - (WORLD_HEIGHT / 2 - 1);
      setPowerupPosition({ x: 0, y: 0, z: randomZ });
    }, []);

    const Powerup: React.FC<{}> = () => {
      if (!powerupVisible || isClassicModeIA) return null;

      const textTexture = React.useMemo(createTextTexture, []);

      return (
        <Box position={[powerupPosition.x, powerupPosition.y, powerupPosition.z]} args={[1.5, 1.5, 1.5]}>
        <meshBasicMaterial attachArray="material" map={textTexture} />
      </Box>
      );
    };

    const respawnPowerup: () => void = () => {
      // const randomX = (Math.random() * (WORLD_WIDTH - 2)) - (WORLD_WIDTH / 2 - 1);
      const randomZ = (Math.random() * (WORLD_HEIGHT - 2)) - (WORLD_HEIGHT / 2 - 1);
    
      setPowerupPosition({ x: 0, y: 0, z: randomZ });
      setPowerupVisible(true);
    };

    const createTextTexture: () => THREE.CanvasTexture = () => {
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

    React.useEffect(() => {
      if (rightScore === 3 || leftScore === 3) {
        setIsPaused(true);
        if (rightScore === 3) {
          if (isClassicModeIA) {
            setWinner("Computers wins!");
          } else {
            setWinner(clientName + " wins !");
          }
        } else {
          setWinner(hostName + " wins!");
        }
      }
    }, [leftScore, rightScore]);

    const baseCanvasWidth: number = 800;
    const baseFontSize: number = 60;
    const fontSize: number = (dimension.width / baseCanvasWidth) * baseFontSize;

    // sound effects
    const goalSoundRef = React.useRef<HTMLAudioElement>(null);
    const ballWallSoundRef = React.useRef<HTMLAudioElement>(null);
    const powerupHitSoundRef = React.useRef<HTMLAudioElement>(null);
    const userHitSoundRef = React.useRef<HTMLAudioElement>(null);
    const compHitSoundRef = React.useRef<HTMLAudioElement>(null);

    const playGoalSound: () => void = () => {
      goalSoundRef.current?.play();
    };

    const playPowerupSound: () => void = () => {
      powerupHitSoundRef.current?.play();
    };

    const pausePowerupSound: () => void = () => {
      powerupHitSoundRef.current?.pause();
    };

    const playBallWallSound: () => void = () => {
      ballWallSoundRef.current?.play();
    };

    const playUserHitSound: () => void = () => {
      userHitSoundRef.current?.play();
    }

    const playCompHitSound: () => void = () => {
      compHitSoundRef.current?.play();
    }

    // border lines
      const Borders: React.FC<{}> = () => {
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

//------------------ GAME BALL LOGIC ------------------------
    // Ball mechanics
    interface BallProps {
      ballPosition: Position;
      setBallPosition: React.Dispatch<React.SetStateAction<Position>>;
      ballVelocity: Position;
      setBallVelocity: React.Dispatch<React.SetStateAction<Position>>;
      speedFactor: number;
    }
    const Ball: React.FC<BallProps> = ({ ballPosition, setBallPosition, ballVelocity, setBallVelocity }) => {

      useFrame(() => {
          if(isPaused || gameStart || winner) return;

          let newX: number = ballPosition.x + ballVelocity.x;
          // ne pas oublier la position de la camera pour la vue top-down
          let newZ: number = ballPosition.z + ballVelocity.z;
          
          const directionZ = Math.sign(ballVelocity.z);

          if (
            powerupVisible &&
            Math.abs(ballPosition.x - powerupPosition.x) < ballRadius + 1 &&
            Math.abs(ballPosition.z - powerupPosition.z) < ballRadius + 1
          ) {
            setPowerupVisible(false);
            setCameraMode("perspective");
            playPowerupSound();
        
            setTimeout(() => {
              setCameraMode("orthographic");
              respawnPowerup();
            }, 12000);
          }

          // Validation de hit avec les murs
          if ((directionZ > 0 && newZ + ballRadius > WORLD_HEIGHT / 2) || 
          (directionZ < 0 && newZ - ballRadius < -WORLD_HEIGHT / 2)) {
            ballVelocity.z = -ballVelocity.z;
            newZ = ballPosition.z + ballVelocity.z;
            if(!isClassicModeIA)
              playBallWallSound();
          }

          // Validation de hit avec les paddles  
          const leftPaddlePosition = { x: leftPaddleXPosition, z: leftPaddlePositionZ };
          const rightPaddlePosition = { x: rightPaddleXPosition, z: rightPaddlePositionZ };
          const paddleDimensions = { width: paddleWidth, depth: paddleDepth };

          const hitSectionLeft = checkCollision({ x: newX, z: newZ }, leftPaddlePosition, paddleDimensions);
          const hitSectionRight = checkCollision({ x: newX, z: newZ }, rightPaddlePosition, paddleDimensions);

          if (hitSectionLeft || hitSectionRight) {
            const hitPaddlePosition = hitSectionLeft ? leftPaddlePosition : rightPaddlePosition;
            if (hitSectionLeft && !isClassicModeIA) {
              playUserHitSound();
            } else if (hitSectionRight && !isClassicModeIA) {
              playCompHitSound();
            }

            ballVelocity.x = -ballVelocity.x;

            const relativeCollisionPoint = (newZ - hitPaddlePosition.z) / (paddleDepth / 2);
            const newZVelocity = ballVelocity.z + relativeCollisionPoint * INITIAL_BALL_SPEED;

            // Normalize the velocity to maintain the initial speed
            const magnitude = Math.sqrt(ballVelocity.x ** 2 + newZVelocity ** 2);
            ballVelocity.x = (ballVelocity.x / magnitude) * INITIAL_BALL_SPEED;
            ballVelocity.z = (newZVelocity / magnitude) * INITIAL_BALL_SPEED;

            newX = hitPaddlePosition.x + Math.sign(ballVelocity.x) * (paddleWidth / 2 + ballRadius);
          }

          if (newX - ballRadius <= -WORLD_WIDTH / 2 || newX + ballRadius >= WORLD_WIDTH / 2) {
            if (!isClassicModeIA) {
              pausePowerupSound();
              playGoalSound();
            }

            //bug: asynchronous issue.

            // Update scores
            if (newX - ballRadius <= -WORLD_WIDTH / 2) {
              setRightScore(prevScore => prevScore + 1);
            } else if (newX + ballRadius >= WORLD_WIDTH / 2) {
              setLeftScore(prevScore => prevScore + 1);
            }

            // if (rightScore === 3 || leftScore === 3) {
            //   if (rightScore === 3) {
            //     setWinner("Right Player Wins!");
            //   } else if(leftScore === 3) {
            //     setWinner("Left Player Wins!");
            //   }
            //   setIsPaused(true);
            //   return;
            // }

            setCameraMode("orthographic");

            newX = 0;
            newZ = 0;
            setBallVelocity({ x: INITIAL_BALL_SPEED, z: INITIAL_BALL_SPEED });
            
            // Optional: Pause the game if needed
            setIsPaused(true);
            handleCountdown();
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

//------------------ GAME PADDLES LOGIC ------------------------
    // fixation des positions gauche et droite des paddles
    const leftPaddleXPosition: number = -distanceFromCenter;
    const rightPaddleXPosition: number = distanceFromCenter;

    // Collision Logic with Paddles
    type Position = { x: number, z: number };
    type PaddleDimensions = { width: number, depth: number };

    const checkCollision = (
      ballPos: Position,
      paddlePos: Position,
      paddleDims: PaddleDimensions
    ): boolean | string => {
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

    // mouvement du left (user1) paddle a la souris.
    interface LeftPaddleProps {
      leftPaddlePositionZ : number;
      setLeftPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>;
    }

    const LeftPaddle: React.FC<LeftPaddleProps> = ({ leftPaddlePositionZ, setLeftPaddlePositionZ }) => {
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

    // Right paddle (Computer - User2)
    const RIGHT_PADDLE_SPEED: number = 0.8;

    const lerp = (a: number, b: number, t: number): number => a + t * (b - a);

    interface RightPaddleProps {
      RightPaddlePositionZ : number;
      setRightPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>;
    }

    const RightPaddle: React.FC<RightPaddleProps> = ({ rightPaddlePositionZ, setRightPaddlePositionZ }) => {

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

//------------------ GAME SCENE RENDERER ------------------------
  return (
    <MaterialBox
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // background: `url('../src/assets/arcade.png') no-repeat center center / cover`,
        background: '#000000',
        borderRadius: '5px',
        margin: '10px',
        padding: '15px',
        height: '92.5vh',
        align: 'center',
      }}
    >
        <div className="pong-container" style={{ width: dimension.width, height: dimension.height }}>
        {!gameLaunched ? (
          showButtons && (
            <div className="starting-screen">
              {/* <img src="../src/assets/arcade_2k.png" alt="Starting Screen" /> */}
              <img src="../src/assets/animated.gif" alt="Starting Screen" />
              <div className="game-buttons" style={{
                position: 'absolute',
                top: '70%',

                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <button onClick={handleClassicModeIA}>Classic 1 vs IA</button>
                <button onClick={handlePowerupModeIA}>Powerup 1 vs IA</button>
                <button onClick={handleClassicModeMulti}>Classic 1 vs 1</button>
                <button onClick={handlePowerupModeMulti}>Powerup 1 vs 1</button>
              </div>
            </div>
          )
        ) : (
        <div id = "canvas-container" style = {{ width: dimension.width, height: dimension.height }}>
        <Canvas 
            style={{ background: cameraMode === "perspective" ? 'url(src/assets/pong_3d_bg2b.png) no-repeat center center / cover' : 'black' }}>
            {/* Camera Controller */}
            <ControlledCameras
              mode={cameraMode}
              perspectivePosition={[-50, 10, 0]}
              perspectiveTarget={[0, 0, 0]}
              orthographicPosition={[0, 10, 0]}
              orthographicTarget={[0, 0, 0]}
              perspectiveCameraProps={{ fov: 40, near: 0.1, far: 1000 }}
              orthographicCameraProps={{ zoom: 20, near: 0, far: 1000 }}
              mouseButtons={{ LEFT: THREE.MOUSE.ROTATE }}
              touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
            />

            {/* le net */}
            {segments}

            {/* borders */}
            <Borders />

            {/* PowerUp Cube */}
            <Powerup />

            {/* Ball */}
            <Ball 
              ballPosition={ballPosition}
              setBallPosition={setBallPosition}
              ballVelocity={ballVelocity}
              setBallVelocity={setBallVelocity}
              speedFactor={ballSpeed}
            />

            {/* Left Paddle */}
            <LeftPaddle 
              leftPaddlePositionZ={leftPaddlePositionZ}
              setLeftPaddlePositionZ={setLeftPaddlePositionZ} />

            {/* Right Paddle */}
            <RightPaddle 
              rightPaddlePositionZ={rightPaddlePositionZ}
              setRightPaddlePositionZ={setRightPaddlePositionZ} />

          </Canvas>

          {/* Scoreboard */}
          <div className="scoreboard">
            <div className="player-info">
              <span className="player-name">{hostName}</span>
              <span className="left-score" style={{fontSize: `${fontSize}px` }}>{leftScore}</span>
            </div>
            <div className="player-info">
              <span className="player-name">{clientName}</span>
              <span className="right-score"  style={{fontSize: `${fontSize}px` }}>{rightScore}</span>
            </div>
            <div className="winner-message">
              {winner && <span>{winner}</span>}
            </div>
            {/* <div className="pause-message">
            {isPaused && !gameStart && <span>Game Paused</span>}
            </div> */}

            {/* timer */}
            <div className="countdown">
              {countdown !== null && <span style={{ fontSize: `${fontSize}px` }}>{countdown}</span>}
            </div>
          </div>

          {/* Sound elements */}
          <audio ref={goalSoundRef} src="src/assets/neo-tokyo-goal.mp3" />
          <audio ref={powerupHitSoundRef} src="src/assets/mario-star.mp3" />
          <audio ref={ballWallSoundRef} src="src/assets/pong-ball.ogg" />
          <audio ref={userHitSoundRef} src="src/assets/paddle-hit.mp3" />
          <audio ref={compHitSoundRef} src="src/assets/paddle-hit2.mp3" />
        </div>
        )}
      </div>
    </MaterialBox>
  )
}
