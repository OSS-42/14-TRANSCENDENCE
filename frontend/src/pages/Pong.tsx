import { Box as MaterialBox } from "@mui/material";

import React, { useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Box } from "@react-three/drei";
import "./Pong.css";

// import { ControlledCameras } from "./controlledcamera";
import { ControlledCameras } from "../components/Pong/controlledcamera-2"; // Assuming it's exported from a file named ControlledCameras.tsx

// import for Cookies data use
import Cookies from "js-cookie";

// for use instead of fetch.
import { useAuth } from "../contexts/AuthContext";

// import for websocket
import socketIO from "socket.io-client";


//============== INFOS QUI TRANSITENT ENTRE SOCKETS ==============
//import for URL params
import { useLocation } from 'react-router-dom';

//============== INFOS QUI TRANSITENT ENTRE SOCKETS ==============

type Connection = {
  isConnected: boolean;
}

type HostGameParameters = {
  gameId: string;
  leftPaddlePositionZ: number;
  leftScore: number;
  rightScore: number;
};

type ClientGameParameters = {
  gameId: string;
  rightPaddlePositionZ: number;
}

type PlayerJoined = {
  gameId: string;
  hostStatus: boolean;
  hostName: string;
  clientName: string;
};

type WeHaveAWinner = {
  gameId: string;
  theHostIsWinner: boolean;
  winnerText: string;
  hostname: string;
  clientName: string;
};

type OppDisconnected = {
  message: string;
};

type BallPosition = {
  x: number;
  y: number;
  z: number;
};

export function Pong() {
  //============== ERROR LISTENING ==============
  window.addEventListener('error', function (event) {
    console.log('🏓   there was an issue, but we catched it: ', event);
  });

  //============== SOCKET CONNECTION ==============--
  const [socket, setSocket] = useState<ReturnType<typeof socketIO> | null>(null);

  useEffect(() => {
    const newSocket = socketIO("/pong", {
      query: {
        token: Cookies.get("jwt_token"),
      },
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  //============== CONSTANTS NECESSARY AT TOP ==============

  const { user } = useAuth();
  // ---get the game id from de URL----
  const location = useLocation();
  const gameIdFromUrl = new URLSearchParams(location.search).get('gameIdFromUrl');

  const [gameLaunched, setGameLaunched] = React.useState(false);
  const [cameraMode, setCameraMode] = React.useState<"perspective" | "orthographic">("orthographic");
  const [isPaused, setIsPaused] = React.useState(true);
  const [gameStart, setGameStart] = React.useState(true);
  const [leftScore, setLeftScore] = React.useState(0);
  const [rightScore, setRightScore] = React.useState(0);
  const [winner, setWinner] = React.useState<string | null>(null);

  const [gameMode, setGameMode] = React.useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [showButtons, setShowButtons] = React.useState(true);
  const isGameOver = useRef(false);

  //============== GAME VARIABLES ==============
  // variables sans resizing
  const paddleWidth: number = 0.5;
  const paddleHeight: number = 1;
  const paddleDepth: number = 5;
  const ballRadius: number = 0.5;
  const netWidth: number = 0.5;
  const netDepth: number = 8;
  const INITIAL_BALL_SPEED: number = 0.25;
  const paddleMove: number = 1.5;

  const [leftPaddlePositionZ, setLeftPaddlePositionZ] = React.useState(0);
  const [rightPaddlePositionZ, setRightPaddlePositionZ] = React.useState(0);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const soundsON = useRef<boolean>(false);

  const [ballPosition, setBallPosition] = React.useState<BallPosition>({
    x: 0,
    y: 0,
    z: 0.00001,
  });

  const [ballVelocity, setBallVelocity] = React.useState({
    x: INITIAL_BALL_SPEED,
    z: INITIAL_BALL_SPEED,
  });

  //============== CLIENT-SERVER SETTINGS ==============
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [hostStatus, setHostStatus] = React.useState<boolean>(false);
  const [hostname, setHostname] = React.useState<string>("");
  const [clientName, setClientName] = React.useState<string>("");
  const [playerName, setPlayerName] = React.useState<string>("");
 
  const [waitingForPlayer, setWaitingForPlayer] = React.useState(false);
  const [gameId, setGameId] = React.useState<string>("");
  const isHostWinner = useRef<boolean>(false);
  const [oppDisconnected, setOppDisconnected] = React.useState<string | null>(null);

  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // Ecoute parler le socket
  useEffect(() => {
    if (socket) {
      socket.on("connected", (data: Connection) => {
        // console.log("🏓   Connection established ? ", data.isConnected);
        setIsConnected(data.isConnected);
        

        if (user) {
          // console.log("🏓   username is ", user.username);
          setPlayerName(user.username);
        }
        if (!data.isConnected) {
          console.log("🏓   Connection failed ");
          setGameLaunched(false);
        }
      });

      socket.on("playerJoined", (data: PlayerJoined) => {
        setWaitingForPlayer(false);
        setGameId(data.gameId);
        setHostStatus(data.hostStatus);
        setHostname(data.hostName);
        setClientName(data.clientName);
        // console.log("🏓   GAMEID: ", data.gameId);
        handleCountdown();
      });

      socket.on("opponentDisconnected", (data: OppDisconnected) => {
        // console.log(data);
        setOppDisconnected(data.message);
      });

      if (isConnected && gameId) {
        setInitialSetupComplete(true);
        console.log('🏓   setup completed. GAME ID: ', gameId);
      }

    } else {
      return () => {}; // No-op function when socket is null
    }

    return () => {
      if (socket) {
        socket.off("connected");
        socket.off("playerJoined");
        socket.off("oppDisconnected");
      }
    };
  }, [socket, isConnected, gameId, oppDisconnected]);

  useEffect(() => {
    if (socket && initialSetupComplete) {
      if (hostStatus) {
        socket.volatile.emit("hostGameParameters", {
          gameId,
          leftPaddlePositionZ,
          leftScore,
          rightScore,
        });
      } else {
        socket.volatile.emit("clientGameParameters", {
          gameId,
          rightPaddlePositionZ,
        });
      }

      if (!hostStatus) {
        socket.on('hostMovesUpdate', (data: HostGameParameters) => {
          if (data.gameId === gameId) {
            setLeftPaddlePositionZ(data.leftPaddlePositionZ)
            setRightScore(data.rightScore)
            setLeftScore(data.leftScore)
          } else {
            socket.emit("oppDisconnected", { message : 'Deconnection. End of Game.' })
            setIsPaused(true);
          }
        })
      } else {
        socket.on("clientMovesUpdate", (data: ClientGameParameters) => {
          if (data.gameId === gameId) {
            setRightPaddlePositionZ(data.rightPaddlePositionZ);
          } else {
            socket.emit("oppDisconnected", { message : 'Deconnection. End of Game.' })
            setIsPaused(true);
          }
        });
      }

      return () => {
        if (socket) {
          socket.off("hostGameParameters");
          socket.off("hostMovesUpdate");
          socket.off("clientMovesUpdate");
        }
      };
    } else {
      return () => {}; // No-op function when socket is null
    }
  }, [
    ballPosition,
    leftPaddlePositionZ,
    rightPaddlePositionZ,
  ]);

  useEffect(() => {
    if (socket && !hostStatus) {
      socket.on('newBallPosition', (data: any) => {
        setBallPosition({ x: data.newX, y: data.newY, z: data.newZ });
      });
      
      return () => {
        socket.off('newBallPosition');
      };
    } else {
      return () => {};
    }
  }, [socket, hostStatus]);
  

  useEffect (() => {
    if (socket && gameId) {
      socket.on("endGame", (data: WeHaveAWinner) => {
        if (data.gameId === gameId) {
          setTimeout(() => {
            console.log('THERE IS A WINNER ', gameId);
            isHostWinner.current = data.theHostIsWinner;
            isGameOver.current = true;
            setGameLaunched(false);
            setIsPaused(true);
            window.location.href = "/game";
          }, 2000);
        } else {
          socket.emit("oppDisconnected", { message : 'Deconnection. End of Game.' })
          setIsPaused(true);
        }
      });

    };
    return () => {
      if (socket) {
        socket.off("endGame");
      }
    };
  });

  //============== GAME MODES ==============
  useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get("gameIdFromUrl");
      if (mode && isConnected) {
        handleInvitationMode();
      } else {
        setIsPaused(true);
      }

  }, [isConnected])

  const handleInvitationMode = (): void => {
    console.log("🏓   classic 1 vs 1 sur INVITATION");
    try {
      const newGM = 5;
      // console.log(socket);
      if (socket) {
        socket.emit("challengeGame", { playerName, newGM, gameIdFromUrl });
        // console.log("coucou");
        setWaitingForPlayer(true);
        setGameLaunched(true);
        setCameraMode("orthographic");
        setGameMode(newGM);
        setShowButtons(false);
      }
    } catch (error) {
      console.log("🏓   we catched an issue. GM5: ", error);
      return;
    }
  };

  const handleClassicModeMulti = (): void => {
    console.log("🏓   classic 1 vs 1");
    try {
      const newGM = 3;
      if (socket) {
        socket.emit("waitingForPlayerGM3", { playerName, newGM });
        setWaitingForPlayer(true);
        setGameLaunched(true);
        setCameraMode("orthographic");
        setGameMode(newGM);
        setShowButtons(false);
      }
    } catch (error) {
      console.log("🏓   we catched an issue. GM3: ", error);
      return;
    }
  };

  //============== SCENE SETTINGS ==============
  // s'assure que le canvas aura comme maximum toujours 800x600
  const [dimension] = React.useState<{ width: number, height: number }>({ width: 800, height: 600 });

  // Dimensions de l'espace de jeu.
  const CAMERA_ZOOM = 20;
  const WORLD_WIDTH: number = dimension.width / CAMERA_ZOOM;
  const WORLD_HEIGHT: number = dimension.height / CAMERA_ZOOM;

  //============== GAME GENERAL BEHAVIOR ==============
  //-------------- Timer to restart --------------

  const handleCountdown = (): void => {
    if (isGameOver.current || oppDisconnected) {
      return;
    }

    let currentCountdown = 3;
    setCountdown(currentCountdown);

    const timer = setInterval(() => {
      if (isGameOver.current) {
        clearInterval(timer);
        return;
      }

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

  //-------------- Keypress --------------
  const handleKeyPress = (event: KeyboardEvent): void => {
    if (event.key === "c" || event.key === "C") {
      // Toggle the camera mode when the "C" key is pressed
      // console.log("🏓   c has been pressed");
      setCameraMode((prevMode) =>
        prevMode === "orthographic" ? "perspective" : "orthographic"
      );
    }
    if (event.key === "s" || event.key === "S") {
      //Toggle sounds when "S" key is pressed
      // console.log("🏓   s has been pressed");
      if (!soundsON.current) {
        soundsON.current = true;
      } else {
        soundsON.current = false;
      }
    }
    if (cameraMode === 'orthographic') {
      // Top-down view controls
      if (event.key === "ArrowUp") {
        if (hostStatus) {
          setLeftPaddlePositionZ(prev => Math.max(prev - paddleMove, -WORLD_HEIGHT / 2 + paddleDepth / 2));
        } else {
          setRightPaddlePositionZ(prev => Math.max(prev - paddleMove, -WORLD_HEIGHT / 2 + paddleDepth / 2));
        }
      } else if (event.key === "ArrowDown") {
        if (hostStatus) {
          setLeftPaddlePositionZ(prev => Math.min(prev + paddleMove, WORLD_HEIGHT / 2 - paddleDepth / 2));
        } else {
          setRightPaddlePositionZ(prev => Math.min(prev + paddleMove, WORLD_HEIGHT / 2 - paddleDepth / 2));
        }
      }
    } else {
      // Perspective view controls
      if (event.key === "ArrowLeft") {
        if (hostStatus) {
          setLeftPaddlePositionZ(prev => Math.max(prev - paddleMove, -WORLD_WIDTH / 2 + paddleDepth / 2));
        } else {
          setRightPaddlePositionZ(prev => Math.max(prev + paddleMove, -WORLD_WIDTH / 2 + paddleDepth / 2));
        }
      } else if (event.key === "ArrowRight") {
        if (hostStatus) {
          setLeftPaddlePositionZ(prev => Math.min(prev + paddleMove, WORLD_WIDTH / 2 - paddleDepth / 2));
        } else {
          setRightPaddlePositionZ(prev => Math.min(prev - paddleMove, WORLD_WIDTH / 2 - paddleDepth / 2));
        }
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameMode, cameraMode, hostStatus]);

  // Scoreboard
  // en cas de victoire, reinitialisation du jeu, identification du gagnant et perdant pour envoi a la DB et retour a la page de selection des modes

  //-------------- Disconnection management --------------
  React.useEffect(() => {
    if (oppDisconnected) {
      setIsPaused(true);
      handleCountdown();

      setTimeout(() => {
        window.location.href = "/game";
      }, 2000);
    }
  }, [oppDisconnected]);

  //-------------- Alt Tab management ----------------
  React.useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        if (socket) {
          // console.log("Tab is now inactive. Disconnecting.");
          socket.emit("disconnected", {
            gameId: gameId });
        }
        setIsConnected(false);
      }
    }
    
    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket]);

  // offsite pour maintenir les paddles a 0.5 unit de leur bordure respective lorsqu'il y a resize
  const distanceFromCenter: number = 0.024 * dimension.width;

  //============== GAME OBJECTS ==============
  // fixed objects : net, scoreboard, borders.
  // mobile objects: ball, paddles.

  //-------------- Net --------------
  const Net = React.memo(() => {
    const numberOfSegments: number = 15;
    const segmentHeight: number = netDepth / 5;
    const spaceBetweenSegments: number = 1;
    const totalHeight: number =
      (segmentHeight + spaceBetweenSegments) * numberOfSegments -
      spaceBetweenSegments; // Subtract space for the last segment
  
    const segments = Array.from({ length: numberOfSegments }).map((_, index) => {
      const yPosition: number =
        totalHeight / 2 - index * (segmentHeight + spaceBetweenSegments);

    return (
      <Box
        key={index}
        position={[0, 0, yPosition]}
        args={[netWidth, 0, segmentHeight]}
      >
        <meshBasicMaterial color="white" />
      </Box>
    );
  });

    return <>{segments}</>
  });

  const baseCanvasWidth: number = 800;
  const baseFontSize: number = 60;
  const fontSize: number = (dimension.width / baseCanvasWidth) * baseFontSize;

  //-------------- Borders --------------
  const Borders = React.memo(() => {
    const borderThickness = 0.05;
    return (
      <>
        {/* Top Border */}
        <Box
          position={[0, 0, WORLD_HEIGHT / 2]}
          args={[WORLD_WIDTH, 1, borderThickness]}
        >
          <meshBasicMaterial color="white" />
        </Box>
        {/* Bottom Border */}
        <Box
          position={[0, 0, -WORLD_HEIGHT / 2]}
          args={[WORLD_WIDTH, 1, borderThickness]}
        >
          <meshBasicMaterial color="white" />
        </Box>
      </>
    );
  });

  //-------------- Sound effects --------------
  const goalSoundRef = React.useRef<HTMLAudioElement>(null);
  const ballWallSoundRef = React.useRef<HTMLAudioElement>(null);
  const userHitSoundRef = React.useRef<HTMLAudioElement>(null);
  const compHitSoundRef = React.useRef<HTMLAudioElement>(null);

  const playGoalSound: () => void = () => {
    goalSoundRef.current?.play();
  };

  const playBallWallSound: () => void = () => {
    ballWallSoundRef.current?.play();
  };

  const playUserHitSound: () => void = () => {
    userHitSoundRef.current?.play();
  };

  const playCompHitSound: () => void = () => {
    compHitSoundRef.current?.play();
  };

//-------------- SCOREBOARD LOGIC --------------

  const goalScored = (prevScore: number, side: string) => {
    // console.log('goalScored is called');
    let newScore = prevScore + 1;

    if (side === 'right') {
      setRightScore(newScore);
    } else if (side === 'left') {
      setLeftScore(newScore);
    }

    setBallPosition({ x: 0, y: 0, z: 0 });
    // setBallVelocity({ x: INITIAL_BALL_SPEED, z: INITIAL_BALL_SPEED });
    setBallVelocity(getRandomVelocity());
    setCameraMode("orthographic");
    setIsPaused(true);

    if (hostStatus && (newScore > 0)) {
      // console.log("sending new round", gameId);
      socket.emit('newRound', { gameId });
    }
  }

  useEffect (() => {
    if (socket) {
      socket.on('startNewRound', (payload: any) => {
        // console.log("start new round");
        if (payload.gameId) {
          setCameraMode("orthographic");
          handleCountdown();
        }
      })
    }

    return () => {
      if (socket) {
        socket.off("startNewRound");
      }
    };
  });

  const sentWinnerMessage = (winnerText: string) => {
    setWinner(winnerText);
    if (cameraMode  === "perspective") {
      setCameraMode("orthographic");
    }

    // console.log("🏓   ", winnerText);
    // console.log("🏓   ", gameId);
    // console.log("🏓   ", isHostWinner.current);
    let theHostIsWinner: boolean = isHostWinner.current;
    if (gameId && socket && hostStatus) {
      console.log("🏓   envoi du resultat");
      socket.emit("weHaveAWinner", {
        gameId,
        theHostIsWinner,
        winnerText,
        hostname,
        clientName,
      });
    };
  }

  useEffect (() => {
      if (rightScore >= 3 || leftScore >= 3) {
        isGameOver.current = true;
        setIsPaused(true);
        // console.log("🏓   Quelqu'un a gagne: ", leftScore, " - ", rightScore);

        let winnerText = "";
        if (rightScore === 3) {
          winnerText =
            gameMode === 1 || gameMode === 2
              ? "Computers wins!"
              : `${clientName} wins!`;
          isHostWinner.current = false;
        } else {
          winnerText = `${hostname} wins!`;
          isHostWinner.current = true;
        }
        
        sentWinnerMessage(winnerText);
      }
  }, [leftScore, rightScore])

  //============== GAME BALL LOGIC ==============
  // Randomizing start of the ball
  const getRandomVelocity = () => {
    // Randomize the direction (positive or negative)
    const xDirection = Math.random() < 0.5 ? -1 : 1;
    const zDirection = Math.random() < 0.5 ? -1 : 1;
  
    // Apply the direction to the initial speed
    return {
      x: INITIAL_BALL_SPEED * xDirection,
      z: INITIAL_BALL_SPEED * zDirection
    };
  };

  // Ball mechanics
  
  interface BallProps {
    ballPosition: BallPosition;
    setBallPosition: React.Dispatch<React.SetStateAction<BallPosition>>;
    ballVelocity: Position;
  }
  
  const Ball: React.FC<BallProps> = ({
    ballPosition,
    setBallPosition,
    ballVelocity,
  }) => {

    const goalUpdate = useRef<boolean>(false);

    useFrame(() => {
      if (isPaused || gameStart || winner) return;
      
      
      if (hostStatus) {
        let newX: number = ballPosition.x + ballVelocity.x;
        let newZ: number = ballPosition.z + ballVelocity.z;

        const directionZ = Math.sign(ballVelocity.z);
      
        //----------- VALIDATION HIT AVEC WALL ----------
        if (
          (directionZ > 0 && newZ + ballRadius > WORLD_HEIGHT / 2) ||
          (directionZ < 0 && newZ - ballRadius < -WORLD_HEIGHT / 2)
        ) {
          ballVelocity.z = -ballVelocity.z;
          newZ = ballPosition.z + ballVelocity.z;
          if (soundsON.current) {
            playBallWallSound();
          }
        }
  
        //----------- VALIDATION HIT AVEC PADDLES ----------
        const leftPaddlePosition = {
          x: leftPaddleXPosition,
          z: leftPaddlePositionZ,
        };
        const rightPaddlePosition = {
          x: rightPaddleXPosition,
          z: rightPaddlePositionZ,
        };
        const paddleDimensions = { width: paddleWidth, depth: paddleDepth };
  
        const hitSectionLeft = checkCollision(
          { x: newX, z: newZ },
          leftPaddlePosition,
          paddleDimensions
        );
        const hitSectionRight = checkCollision(
          { x: newX, z: newZ },
          rightPaddlePosition,
          paddleDimensions
        );
  
        if (hitSectionLeft || hitSectionRight) {
          const hitPaddlePosition = hitSectionLeft
            ? leftPaddlePosition
            : rightPaddlePosition;
          if (hostStatus && soundsON.current) {
            playUserHitSound();
          } else if (!hostStatus && soundsON.current) {
            playCompHitSound(); //attention si 1 vs 1, laissez le son utilisateur
          }
  
          ballVelocity.x = -ballVelocity.x;

          const relativeCollisionPoint = (newZ - hitPaddlePosition.z) / (paddleDepth / 2);
          const newZVelocity = ballVelocity.z + relativeCollisionPoint * INITIAL_BALL_SPEED;

          // Normalize the velocity to maintain the initial speed
          const magnitude = Math.sqrt(ballVelocity.x ** 2 + newZVelocity ** 2);
          ballVelocity.x = (ballVelocity.x / magnitude) * INITIAL_BALL_SPEED;
          ballVelocity.z = (newZVelocity / magnitude) * INITIAL_BALL_SPEED;
  
          newX =
            hitPaddlePosition.x +
            Math.sign(ballVelocity.x) * (paddleWidth / 2 + ballRadius);
        }
        
        //----------- IN CASE OF GOAL ----------
        if (
          newX - ballRadius <= -WORLD_WIDTH / 2 ||
          newX + ballRadius >= WORLD_WIDTH / 2
          ) {
            if (!goalUpdate.current) {
              goalUpdate.current = true;
            }
            
            if (soundsON.current) {
              playGoalSound();
            }
            
            if (newX - ballRadius <= -WORLD_WIDTH / 2) {
              // console.log("but gauche");
              goalScored(rightScore, 'right');
            } else if (newX + ballRadius >= WORLD_WIDTH / 2) {
              // console.log("but droite");
              goalScored(leftScore, 'left');
            }
            
          } else {
            goalUpdate.current = false;
            
            setBallPosition({
              x: newX,
              y: 0,
              z: newZ,
            } as BallPosition);
          }
          socket.emit("ballPositionUpdate", { newX, newY: 0, newZ, gameId });
      }
    });

    return (
      <Sphere
        position={[ballPosition.x, ballPosition.y, ballPosition.z]}
        args={[ballRadius, 32, 32]}
      >
        <meshBasicMaterial color="white" />
      </Sphere>
    );
  };

  //============== GAME PADDLES LOGIC ==============
  // Collision Logic with Paddles
  type Position = { x: number; z: number };
  type PaddleDimensions = { width: number; depth: number };

  const checkCollision = (
    ballPos: Position,
    paddlePos: Position,
    paddleDims: PaddleDimensions
  ): boolean | string => {
    const distX: number = Math.abs(ballPos.x - paddlePos.x);
    const distZ: number = Math.abs(ballPos.z - paddlePos.z);

    if (
      distX <= paddleDims.width / 2 + ballRadius &&
      distZ <= paddleDims.depth / 2 + ballRadius
    ) {
      const relativeCollisionPoint: number =
        (ballPos.z - paddlePos.z) / (paddleDepth / 2);
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

  // fixation de la position gauche du paddle
  const leftPaddleXPosition: number = -distanceFromCenter;

  // The lerp function helps you find a point that is a certain percentage t along the way from a to b.
  const lerp = (a: number, b: number, t: number): number => a + t * (b - a);
  let lerpFactor = 0.5;

  // mouvement du left (user1) paddle a la souris.
  interface LeftPaddleProps {
    leftPaddlePositionZ: number;
    setLeftPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>;
  }

  const LeftPaddle: React.FC<LeftPaddleProps> = ({
    leftPaddlePositionZ,
    setLeftPaddlePositionZ,
  }) => {
    // const { mouse } = useThree()
    // let lastEventTime = 0;
    // const throttleTime = 100;

    // useFrame(() => {
    //   const currentTime = Date.now();

    //    if (currentTime - lastEventTime > throttleTime) {
    //     lastEventTime = currentTime;
        // let newPosition = leftPaddlePositionZ;

        // if (hostStatus) {
        //   if (cameraMode === 'perspective') {
        //     newPosition = mouse.x * (WORLD_WIDTH / 2)
        //   } else {
        //     newPosition = -mouse.y * (WORLD_HEIGHT / 2)
        //   }
        // } else {
        //   newPosition = leftPaddlePositionZ
        // }

        // newPosition = lerp(leftPaddlePositionZ, newPosition, lerpFactor)

        // const paddleTopEdge = newPosition + paddleDepth / 2
        // const paddleBottomEdge = newPosition - paddleDepth / 2

        // if (paddleTopEdge > WORLD_HEIGHT / 2) {
        //   newPosition = WORLD_HEIGHT / 2 - paddleDepth / 2
        // } else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
        //   newPosition = -WORLD_HEIGHT / 2 + paddleDepth / 2
        // }

        // setLeftPaddlePositionZ(newPosition)
    //   }
    // })

    return (
      <Box
        position={[leftPaddleXPosition, 0, leftPaddlePositionZ]}
        args={[paddleWidth, paddleHeight, paddleDepth]}
      >
        <meshBasicMaterial attach="material" color="white" />
      </Box>
    );
  };

  // Right paddle (User2)
  // fixation de la position droite du paddle
  const rightPaddleXPosition: number = distanceFromCenter;

  interface RightPaddleProps {
    rightPaddlePositionZ: number;
    setRightPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>;
  }

  const RightPaddle: React.FC<RightPaddleProps> = ({
    rightPaddlePositionZ,
    setRightPaddlePositionZ,
  }) => {
    // mouvement du right (user2) paddle a la souris.
    // const { mouse } = useThree()
    // let lastEventTime = 0;
    // const throttleTime = 100;

    // useFrame(() => {
    //   const currentTime = Date.now();

    //   if (currentTime - lastEventTime > throttleTime) {
    //     lastEventTime = currentTime;
    //     let newPosition
    //     if (!hostStatus) {
    //       if (cameraMode === 'perspective') {
    //         newPosition = -mouse.x * (WORLD_WIDTH / 2)
    //       } else {
    //         newPosition = -mouse.y * (WORLD_HEIGHT / 2)
    //       }
    //     } else {
    //       newPosition = rightPaddlePositionZ
    //     }

    //     newPosition = lerp(rightPaddlePositionZ, newPosition, lerpFactor)

    //     const paddleTopEdge = newPosition + paddleDepth / 2
    //     const paddleBottomEdge = newPosition - paddleDepth / 2

    //     if (paddleTopEdge > WORLD_HEIGHT / 2) {
    //       newPosition = WORLD_HEIGHT / 2 - paddleDepth / 2
    //     } else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
    //       newPosition = -WORLD_HEIGHT / 2 + paddleDepth / 2
    //     }

    //     setRightPaddlePositionZ(newPosition)
    //   }
    // })

    return (
      <Box
        position={[rightPaddleXPosition, 0, rightPaddlePositionZ]}
        args={[paddleWidth, paddleHeight, paddleDepth]}
      >
        <meshBasicMaterial attach="material" color="white" />
      </Box>
    );
  };

  //============== CONTEXT LOSS MANAGEMENT ==============
  // code a determiner.

  //============== GAME SCENE RENDERER ==============
  return (
    <MaterialBox
      component="div"
      sx={{
        background: "#000000",
        borderRadius: "5px",
        marginTop: "4rem",
        height: "92.5vh",
      }}
    >
      <div className="instructions">
        To change Camera POV during game : press C.
        <br />
        If your opponent disconnects, wait 2 seconds for an automatic page refresh.
        <br />
        At the end of the game, refresh the page to start a new game, or navigate elsewhere on the website. 
      </div>
      <div
        className="pong-container"
        style={{ width: dimension.width, height: dimension.height }}
      >
        {!gameLaunched ? (
          showButtons && (
            <div className="starting-screen">
              <img src="../src/assets/animated.gif" alt="Starting Screen" />
              <div className="game-buttons">
                <button onClick={handleClassicModeMulti}>Classic 1 vs 1</button>
              </div>
            </div>
          )
        ) : (
          <div
            id="canvas-container"
            style={{ width: dimension.width, height: dimension.height }}
          >
            <Canvas
              style={{
                background:
                  cameraMode === "perspective"
                    ? "url(src/assets/pong_3d_bg2b.png) no-repeat center center / cover"
                    : "black",
              }}
            >
              {/* Camera Controller */}
              <ControlledCameras
                mode={cameraMode}
                perspectivePosition={hostStatus ? [-50, 10, 0] : [50, 10, 0]}
                perspectiveTarget={[0, 0, 0]}
                orthographicPosition={[0, 10, 0]}
                orthographicTarget={[0, 0, 0]}
                perspectiveCameraProps={{ fov: 40, near: 0.1, far: 1000 }}
                orthographicCameraProps={{ zoom: 20, near: 0, far: 1000 }}
              />

              {/* le net */}
              <Net />

              {/* borders */}
              <Borders />

              {/* Ball */}
              <Ball
                ballPosition={ballPosition}
                setBallPosition={setBallPosition}
                ballVelocity={ballVelocity}
              />

              {/* Left Paddle */}
              <LeftPaddle
                leftPaddlePositionZ={leftPaddlePositionZ}
                setLeftPaddlePositionZ={setLeftPaddlePositionZ}
              />

              {/* Right Paddle */}
              <RightPaddle
                rightPaddlePositionZ={rightPaddlePositionZ}
                setRightPaddlePositionZ={setRightPaddlePositionZ}
              />
            </Canvas>

            {/* Scoreboard */}
            <div className="scoreboard">
              <div className="player-info">
                <span className="player-name">{hostname}</span>
                <span
                  className="left-score"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {leftScore}
                </span>
              </div>
              <div className="player-info">
                <span className="player-name">{clientName}</span>
                <span
                  className="right-score"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {rightScore}
                </span>
              </div>
              <div className="winner-message">
                {winner && <span>{winner}</span>}
              </div>

              {/* timer */}
              <div className="countdown">
                {countdown !== null && (
                  <span style={{ fontSize: `${fontSize}px` }}>{countdown}</span>
                )}
              </div>

              {/* player waiting */}
              {waitingForPlayer ? (
                <div className="winner-message">
                  {waitingForPlayer && (
                    <span>"Waiting for another player"</span>
                  )}
                </div>
              ) : null}

              {/* Opponnent disconnected */}
              {oppDisconnected ? (
                <div className="disconnect-message">
                  {oppDisconnected && (
                    <span>"Your Opponnent has Raged Quit. End of Game"</span>
                  )}
                </div>
              ) : null}
            </div>

            {/* Sound elements */}
            <audio ref={goalSoundRef} src="src/assets/neo-tokyo-goal.mp3" />
            <audio ref={ballWallSoundRef} src="src/assets/pong-ball.mp3" />
            <audio ref={userHitSoundRef} src="src/assets/paddle-hit.mp3" />
            <audio ref={compHitSoundRef} src="src/assets/paddle-hit2.mp3" />
          </div>
        )}
      </div>
    </MaterialBox>
  );
}
