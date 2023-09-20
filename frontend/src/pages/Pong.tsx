import { Box as MaterialBox } from "@mui/material";

import React, { useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Box } from "@react-three/drei";
import "./Pong.css";
import * as THREE from "three";

// import { ControlledCameras } from "./controlledcamera";
import { ControlledCameras } from "../components/Pong/controlledcamera-2"; // Assuming it's exported from a file named ControlledCameras.tsx

// import for Cookies data use
import Cookies from "js-cookie";

// for use instead of fetch.
import { useAuth } from "../contexts/AuthContext";

// import for websocket
import socketIO from "socket.io-client";

//------------------ INFOS QUI TRANSITENT ENTRE SOCKETS ------------

type GameParameters = {
  gameId: string;
  ballPosition: { x: number; y: number; z: number };
  leftPaddlePositionZ: number;
  rightPaddlePositionZ: number;
  powerupPosition: { x: number; y: number; z: number };
};

type PlayerJoined = {
  gameId: string;
  hostStatus: boolean;
  hostName: string;
  clientName: string;
};

type WeHaveAWinner = {
  gameId: string;
  isHostWinner: boolean;
  hostname: string;
  clientName: string;
};

// type Connected = {
//   isConnected: boolean;
// };

type OppDisconnected = {
  message: string;
};

export function Pong() {
  //------------------ SOCKET CONNECTION --------------------
  const [socket, setSocket] = useState(null);

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

  //------------------ CONSTANTS NECESSARY AT TOP --------------------

  const { user } = useAuth();

  const [gameLaunched, setGameLaunched] = React.useState(false);
  const [cameraMode, setCameraMode] = React.useState<"perspective" | "orthographic">("orthographic");
  const [isPaused, setIsPaused] = React.useState(true);
  const [gameStart, setGameStart] = React.useState(true);

  const [gameMode, setGameMode] = React.useState<0 | 1 | 2 | 3 | 4>(0);
  const [showButtons, setShowButtons] = React.useState(true);
  const isGameOver = useRef(false);

  //------------------ GAME VARIABLES ------------------------
  // variables sans resizing
  const paddleWidth: number = 0.5;
  const paddleHeight: number = 1;
  const paddleDepth: number = 5;
  const ballRadius: number = 0.5;
  const netWidth: number = 0.5;
  const netDepth: number = 8;
  const INITIAL_BALL_SPEED: number = 0.3;

  const [leftPaddlePositionZ, setLeftPaddlePositionZ] = React.useState(0);
  const [rightPaddlePositionZ, setRightPaddlePositionZ] = React.useState(0);
  const [leftScore, setLeftScore] = React.useState(0);
  const [rightScore, setRightScore] = React.useState(0);
  const [winner, setWinner] = React.useState<string | null>(null);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [powerupVisible, setPowerupVisible] = React.useState(false);

  const [ballPosition, setBallPosition] = React.useState({
    x: 0,
    y: 0,
    z: 0.00001,
  });

  const [ballVelocity, setBallVelocity] = React.useState({
    x: INITIAL_BALL_SPEED,
    z: INITIAL_BALL_SPEED,
  });

  const [powerupPosition, setPowerupPosition] = React.useState({
    x: 0,
    y: 0,
    z: 0,
  });

  //------------------ CLIENT-SERVER SETTINGS ------------------------
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [hostStatus, setHostStatus] = React.useState<boolean>(false);
  const [hostname, setHostname] = React.useState<string>("");
  const [clientName, setClientName] = React.useState<string>("");
  const [playerName, setPlayerName] = React.useState<string>("");

  const [gameInfos, setGameInfos] = useState<PlayerJoined>();
 
  const [waitingForPlayer, setWaitingForPlayer] = React.useState(false);
  const [gameId, setGameId] = React.useState<string>("");
  const [isHostWinner, setIsHostWinner] = React.useState(false);
  const [oppDisconnected, setOppDisconnected] =
    React.useState<OppDisconnected>(false);

  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // Ecoute parler le socket
  useEffect(() => {
    if (socket) {
      socket.on("connected", (data: any) => {
        console.log("🏓   Connection established ? ", data.isConnected);
        setIsConnected(data.isConnected);
        console.log("🏓   username is ", user.username);
        setPlayerName(user.username);
        if (!data.isConnected) {
          console.log("🏓   Connection established ? ", data.isConnected);
          setGameLaunched(false);
        }
      });

      socket.on("playerJoined", (data: PlayerJoined) => {
        setWaitingForPlayer(false);
        setGameId(data.gameId);
        setHostStatus(data.hostStatus);
        setHostname(data.hostName);
        setClientName(data.clientName);
        console.log("🏓   GAMEID: ", data.gameId);
        handleCountdown();
      });

      socket.on("weHaveAWinner", (data: WeHaveAWinner) => {
        setIsHostWinner(data.isHostWinner);
      });

      socket.on("opponentDisconnected", (data: any) => {
        console.log(data);
        setOppDisconnected(true);
      });

      if (isConnected && gameId) {
        setInitialSetupComplete(true);
      }
    } else {
      return () => {}; // No-op function when socket is null
    }

    return () => {
      if (socket) {
        socket.off("connected");
        socket.off("playerJoined");
        socket.off("weHaveAWinner");
        socket.off("oppDisconnected");
      }
    };
  }, [socket, isConnected, gameId]);

  useEffect(() => {
    if (socket && initialSetupComplete) {
      if (hostStatus) {
        console.log("🏓🏓   host");
        socket.emit("hostGameParameters", {
          gameId,
          ballPosition,
          leftPaddlePositionZ,
          rightPaddlePositionZ,
          powerupPosition,
        });
      } else {
        console.log("🏓🏓   pas host");
        socket.emit("clientGameParameters", {
          gameId,
          rightPaddlePositionZ,
        });
      }

      if (!hostStatus) {
        socket.on('hostMovesUpdate', (data: GameParameters) => {
          setBallPosition(data.ballPosition)
          setLeftPaddlePositionZ(data.leftPaddlePositionZ)
          setRightPaddlePositionZ(data.rightPaddlePositionZ)
          setPowerupPosition(data.powerupPosition)
        })
      } else {
        socket.on("clientMovesUpdate", (data: any) => {
          setRightPaddlePositionZ(data.rightPaddlePositionZ);
        });
      }

      return () => {
        if (socket) {
          socket.off("gameParameters");
          socket.off("hostMovesUpdate");
          socket.off("clientMovesUpdate");
        }
      };
    } else {
      return () => {}; // No-op function when socket is null
    }
  }, [
    socket,
    initialSetupComplete,
    hostStatus,
    leftPaddlePositionZ,
    rightPaddlePositionZ,
    powerupPosition,
  ]);

  //------------------ GAME MODES ------------------------
  const handleClassicModeIA = (): void => {
    console.log("🏓   classic 1 vs IA");
    try {
      const newHostStatus = true; // a cause async nature de React.
      const newGM = 1;
      setHostStatus(newHostStatus);
      setGameMode(newGM);
      setNames(playerName, newHostStatus, newGM, setHostname, setClientName);
      setGameLaunched(true);
      setCameraMode("orthographic");
      setShowButtons(false);
      handleCountdown();
    } catch {
      console.log("🏓   we catched an issue. GM1");
      return;
    }
  };

  const handlePowerupModeIA = (): void => {
    console.log("🏓   powerup 1 vs IA");
    try {
      const newHostStatus = true;
      const newGM = 2;
      setHostStatus(newHostStatus);
      setGameMode(newGM);
      setNames(playerName, newHostStatus, newGM, setHostname, setClientName);
      setGameLaunched(true);
      setCameraMode("orthographic");
      setPowerupVisible(true);
      setShowButtons(false);
      handleCountdown();
    } catch {
      console.log("🏓   we catched an issue. GM2");
      return;
    }
  };

  const handleClassicModeMulti = (): void => {
    console.log("🏓   classic 1 vs 1");
    try {
      const newGM = 3;
      socket.emit("waitingForPlayerGM3", { playerName, newGM });
      setWaitingForPlayer(true);
      setGameLaunched(true);
      setCameraMode("orthographic");
      setGameMode(newGM);
      setShowButtons(false);
    } catch {
      console.log("🏓   we catched an issue. GM3");
      return;
    }
  };

  const handlePowerupModeMulti = (): void => {
    console.log("🏓   powerup 1 vs multi");
    try {
      const newGM = 4;
      socket.emit("waitingForPlayerGM4", { playerName, newGM });
      setWaitingForPlayer(true);
      setGameLaunched(true);
      setCameraMode("orthographic");
      setPowerupVisible(true);
      setGameMode(newGM);
      setShowButtons(false);
    } catch {
      console.log("🏓   we catched an issue. GM4");
      return;
    }
  };

  //------------------ USER NAMES ------------------------
  function setNames(
    playerName: string,
    newHostStatus: boolean,
    newGM: number,
    setHostname: Function,
    setClientName: Function
  ) {
    if (newGM === 1 || newGM === 2) {
      setHostname(playerName);
      setClientName("Computer");
    } else {
      if (newHostStatus === true) {
        setHostname(playerName);
        setClientName(gameInfos.clientName);
      } else {
        setHostname(gameInfos.clientName);
        setClientName(playerName);
      }
    }
  }

  //------------------ SCENE SETTINGS ------------------------
  // s'assure que le canvas aura comme maximum toujours 800x600
  const [dimension, setDimensions] = React.useState<number, number>({ width: 800, height: 600 })

  // Dimensions de l'espace de jeu.
  const CAMERA_ZOOM = 20;
  const WORLD_WIDTH: number = dimension.width / CAMERA_ZOOM;
  const WORLD_HEIGHT: number = dimension.height / CAMERA_ZOOM;

  //------------------ GAME GENERAL BEHAVIOR ------------------------
  // Timer to restart

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

  // Key press on multi
  const handleKeyPress = (event: KeyboardEvent): void => {
    if (gameMode === 1 || gameMode === 3) return;
    if (event.key === "c" || event.key === "C") {
      // Toggle the camera mode when the "C" key is pressed
      console.log("🏓   c has been pressed");
      setCameraMode((prevMode) =>
        prevMode === "orthographic" ? "perspective" : "orthographic"
      );
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameMode]);

  // Scoreboard
  // en cas de victoire, reinitialisation dedu jeu, identification du gagnant et perdant pour envoi a la DB et retour a la page de selection des modes

  React.useEffect(() => {
    if (oppDisconnected) {
      setIsPaused(true);
      handleCountdown();

      setTimeout(() => {
        window.location.href = "/game";
      }, 5000);
    }
  }, [oppDisconnected]);

  React.useEffect(() => {
    if (rightScore === 3 || leftScore === 3) {
      isGameOver.current = true;
      console.log("🏓   Quelqu'un a gagne");
      setIsPaused(true);

      let winnerText = "";
      if (rightScore === 3) {
        winnerText =
          gameMode === 1 || gameMode === 2
            ? "Computers wins!"
            : `${clientName} wins!`;
        setIsHostWinner(false);
      } else {
        winnerText = `${hostname} wins!`;
        setIsHostWinner(true);
      }
      setWinner(winnerText);

      handleCountdown();

      setTimeout(() => {
        console.log("🏓   B ", winnerText);
        console.log("🏓   B ", gameId);
        setGameLaunched(false);
        if (gameId) {
          console.log("🏓   envoi du resultat");
          socket.emit("weHaveAWinner", {
            gameId,
            isHostWinner,
            hostname,
            clientName,
          });
        }
        window.location.href = "/game";
      }, 5000);
    }
  }, [leftScore, rightScore]);

  // offsite pour maintenir les paddles a 0.5 unit de leur bordure respective lorsqu'il y a resize
  const distanceFromCenter: number = 0.024 * dimension.width;

  //------------------ GAME OBJECTS ------------------------
  // fixed objects : net, scoreboard, borders.
  // mobile objects: powerup, ball, paddles.

  // powerup seulement sur le net pour jouabilite
  React.useEffect(() => {
    const randomZ = Math.random() * (WORLD_HEIGHT - 2) - (WORLD_HEIGHT / 2 - 1);
    setPowerupPosition({ x: 0, y: 0, z: randomZ });
  }, []);

  const Powerup: React.FC<{}> = () => {
    if (!powerupVisible || gameMode === 1 || gameMode === 3) return null;

    const textTexture = React.useMemo(createTextTexture, []);

    return (
      <Box
        position={[powerupPosition.x, powerupPosition.y, powerupPosition.z]}
        args={[1.5, 1.5, 1.5]}
      >
        <meshBasicMaterial attachArray="material" map={textTexture} />
      </Box>
    );
  };

  const respawnPowerup: () => void = () => {
    // const randomX = (Math.random() * (WORLD_WIDTH - 2)) - (WORLD_WIDTH / 2 - 1);
    const randomZ = Math.random() * (WORLD_HEIGHT - 2) - (WORLD_HEIGHT / 2 - 1);

    setPowerupPosition({ x: 0, y: 0, z: randomZ });
    setPowerupVisible(true);
  };

  const createTextTexture: () => THREE.CanvasTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "yellow"; // Background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "Bold 200px Impact";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "black"; // Text color
      ctx.fillText("3D", canvas.width / 2, canvas.height / 2);
    }
    return new THREE.CanvasTexture(canvas);
  };

  //creation de la ligne (le net) du milieu
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

  // border lines
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
  };

  const playCompHitSound: () => void = () => {
    compHitSoundRef.current?.play();
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

  const Ball: React.FC<BallProps> = ({
    ballPosition,
    setBallPosition,
    ballVelocity,
    setBallVelocity,
  }) => {
    useFrame(() => {
      if (isPaused || gameStart || winner) return;

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
      if (
        (directionZ > 0 && newZ + ballRadius > WORLD_HEIGHT / 2) ||
        (directionZ < 0 && newZ - ballRadius < -WORLD_HEIGHT / 2)
      ) {
        ballVelocity.z = -ballVelocity.z;
        newZ = ballPosition.z + ballVelocity.z;
        if (gameMode === 2 || gameMode === 4) playBallWallSound();
      }

      // Validation de hit avec les paddles
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
        if (hostStatus && (gameMode === 2 || gameMode === 4)) {
          playUserHitSound();
        } else if (gameMode === 2 || gameMode === 4) {
          //attention si 1 vs 1, laissez le son utilisateur
          playCompHitSound();
        }

        ballVelocity.x = -ballVelocity.x;

        const relativeCollisionPoint =
          (newZ - hitPaddlePosition.z) / (paddleDepth / 2);
        const newZVelocity =
          ballVelocity.z + relativeCollisionPoint * INITIAL_BALL_SPEED;

        // Normalize the velocity to maintain the initial speed
        const magnitude = Math.sqrt(ballVelocity.x ** 2 + newZVelocity ** 2);
        ballVelocity.x = (ballVelocity.x / magnitude) * INITIAL_BALL_SPEED;
        ballVelocity.z = (newZVelocity / magnitude) * INITIAL_BALL_SPEED;

        newX =
          hitPaddlePosition.x +
          Math.sign(ballVelocity.x) * (paddleWidth / 2 + ballRadius);
      }

      if (
        newX - ballRadius <= -WORLD_WIDTH / 2 ||
        newX + ballRadius >= WORLD_WIDTH / 2
      ) {
        if (gameMode === 2 || gameMode === 4) {
          pausePowerupSound();
          playGoalSound();
        }

        // Update scores
        if (newX - ballRadius <= -WORLD_WIDTH / 2) {
          setRightScore((prevScore) => {
            const newScore = prevScore + 1;
            if (newScore < 3) {
              setIsPaused(true);
              handleCountdown();
            }
            return newScore;
          });
        } else if (newX + ballRadius >= WORLD_WIDTH / 2) {
          setLeftScore((prevScore) => {
            const newScore = prevScore + 1;
            if (newScore < 3) {
              setIsPaused(true);
              handleCountdown();
            }
            return newScore;
          });
        }

        setCameraMode("orthographic");

        newX = 0;
        newZ = 0;
        setBallVelocity({ x: INITIAL_BALL_SPEED, z: INITIAL_BALL_SPEED });
      }

      setBallPosition({
        x: newX,
        y: 0.0001,
        z: newZ,
      });
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

  //------------------ GAME PADDLES LOGIC ------------------------
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
  let lerpFactor = 0.3;

  // mouvement du left (user1) paddle a la souris.
  interface LeftPaddleProps {
    leftPaddlePositionZ: number;
    setLeftPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>;
  }

  const LeftPaddle: React.FC<LeftPaddleProps> = ({
    leftPaddlePositionZ,
    setLeftPaddlePositionZ,
  }) => {
    const { mouse } = useThree()
    let lastEventTime = 0;
    const throttleTime = 100;

    useFrame(() => {
      const currentTime = Date.now();

       if (currentTime - lastEventTime > throttleTime) {
        lastEventTime = currentTime;
        let newPosition
        if (hostStatus) {
          if (cameraMode === 'perspective') {
            newPosition = mouse.x * (WORLD_WIDTH / 2)
          } else {
            newPosition = -mouse.y * (WORLD_HEIGHT / 2)
          }
        } else {
          newPosition = leftPaddlePositionZ
        }

        newPosition = lerp(leftPaddlePositionZ, newPosition, lerpFactor)

        const paddleTopEdge = newPosition + paddleDepth / 2
        const paddleBottomEdge = newPosition - paddleDepth / 2

        if (paddleTopEdge > WORLD_HEIGHT / 2) {
          newPosition = WORLD_HEIGHT / 2 - paddleDepth / 2
        } else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
          newPosition = -WORLD_HEIGHT / 2 + paddleDepth / 2
        }

        setLeftPaddlePositionZ(newPosition)
      }
    })

    return (
      <Box
        position={[leftPaddleXPosition, 0, leftPaddlePositionZ]}
        args={[paddleWidth, paddleHeight, paddleDepth]}
      >
        <meshBasicMaterial attach="material" color="white" />
      </Box>
    );
  };

  // Right paddle (Computer - User2)
  // fixation de la position droite du paddle
  const rightPaddleXPosition: number = distanceFromCenter;

  interface RightPaddleProps {
    RightPaddlePositionZ: number;
    setRightPaddlePositionZ: React.Dispatch<React.SetStateAction<number>>;
  }

  const RightPaddle: React.FC<RightPaddleProps> = ({
    rightPaddlePositionZ,
    setRightPaddlePositionZ,
  }) => {
    if (gameMode === 1 || gameMode === 2) {
      // si computer
      const RIGHT_PADDLE_SPEED: number = 0.8;

      useFrame(() => {
        const direction: number = Math.sign(
          ballPosition.z - rightPaddlePositionZ
        );

        let newZ = lerp(
          rightPaddlePositionZ,
          rightPaddlePositionZ + direction * RIGHT_PADDLE_SPEED,
          0.2
        );

        const paddleTopEdge: number = newZ + paddleDepth / 2;
        const paddleBottomEdge: number = newZ - paddleDepth / 2;

        if (paddleTopEdge > WORLD_HEIGHT / 2) {
          newZ = WORLD_HEIGHT / 2 - paddleDepth / 2;
        } else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
          newZ = -WORLD_HEIGHT / 2 + paddleDepth / 2;
        }

        setRightPaddlePositionZ(newZ);
      });
    } else {
      // mouvement du right (user2) paddle a la souris.
      const { mouse } = useThree()
      let lastEventTime = 0;
      const throttleTime = 100;

      useFrame(() => {
        const currentTime = Date.now();

        if (currentTime - lastEventTime > throttleTime) {
          lastEventTime = currentTime;
          let newPosition
          if (!hostStatus) {
            if (cameraMode === 'perspective') {
              newPosition = -mouse.x * (WORLD_WIDTH / 2)
            } else {
              newPosition = -mouse.y * (WORLD_HEIGHT / 2)
            }
          } else {
            newPosition = rightPaddlePositionZ
          }

          newPosition = lerp(rightPaddlePositionZ, newPosition, lerpFactor)

          const paddleTopEdge = newPosition + paddleDepth / 2
          const paddleBottomEdge = newPosition - paddleDepth / 2

          if (paddleTopEdge > WORLD_HEIGHT / 2) {
            newPosition = WORLD_HEIGHT / 2 - paddleDepth / 2
          } else if (paddleBottomEdge < -WORLD_HEIGHT / 2) {
            newPosition = -WORLD_HEIGHT / 2 + paddleDepth / 2
          }

          setRightPaddlePositionZ(newPosition)
        }
      })
    }

    return (
      <Box
        position={[rightPaddleXPosition, 0, rightPaddlePositionZ]}
        args={[paddleWidth, paddleHeight, paddleDepth]}
      >
        <meshBasicMaterial attach="material" color="white" />
      </Box>
    );
  };

  //------------------ CONTEXT LOSS MANAGEMENT ------------------------
  // code a determiner.

  //------------------ GAME SCENE RENDERER ------------------------
  return (
    <MaterialBox
      component="div"
      sx={{
        // display: 'flex',

        // justifyContent: 'center',
        // alignItems: 'center',
        // background: `url('../src/assets/arcade.png') no-repeat center center / cover`,
        background: "#000000",
        borderRadius: "5px",
        marginTop: "4rem",
        // padding: '15px',
        height: "92.5vh",
        // align: 'center',
      }}
    >
      <div
        className="pong-container"
        style={{ width: dimension.width, height: dimension.height }}
      >
        {!gameLaunched ? (
          showButtons && (
            <div className="starting-screen">
              {/* <img src="../src/assets/arcade_2k.png" alt="Starting Screen" /> */}
              <img src="../src/assets/animated.gif" alt="Starting Screen" />
              <div className="game-buttons">
                <button onClick={handleClassicModeMulti}>Classic 1 vs 1</button>
                <button onClick={handlePowerupModeIA}>Powerup 1 vs IA</button>
                {/* <button onClick={handleClassicModeIA}>Classic 1 vs IA</button> */}
                {/* <button onClick={handlePowerupModeMulti}>Powerup 1 vs 1</button> */}
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
                mouseButtons={{ LEFT: THREE.MOUSE.ROTATE }}
                touches={{
                  ONE: THREE.TOUCH.ROTATE,
                  TWO: THREE.TOUCH.DOLLY_PAN,
                }}
              />

              {/* le net */}
              <Net />

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
                // speedFactor={INITIAL_BALL_SPEED}
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
              {/* <div className="pause-message">
            {isPaused && !gameStart && <span>Game Paused</span>}
            </div> */}

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
            <audio ref={powerupHitSoundRef} src="src/assets/mario-star.mp3" />
            <audio ref={ballWallSoundRef} src="src/assets/pong-ball.ogg" />
            <audio ref={userHitSoundRef} src="src/assets/paddle-hit.mp3" />
            <audio ref={compHitSoundRef} src="src/assets/paddle-hit2.mp3" />
          </div>
        )}
      </div>
    </MaterialBox>
  );
}
