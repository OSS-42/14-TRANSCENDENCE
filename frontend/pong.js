//initialise le canvas
const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");

// Creation des objets "paddles" utilisateur et ordinateur, ainsi que de la balle.
const user = {
	x : 10,
	y : canvas.height/2 - 100/2,
	width : 10,
	height : 100,
	color : "WHITE",
	score : 0
}

const computer = {
	x : canvas.width - 10 - 10,
	y : canvas.height / 2 - 100 / 2,
	width : 10,
	height : 100,
	color : "WHITE",
	score : 0
}

const ball = {
	x : canvas.width / 2,
	y : canvas.height / 2,
	radius : 10,
	speed : 5,
	velocityX : 5,
	velocityY : 5,
	color : "WHITE"
}

const net = {
	x : canvas.width / 2 - 1,
	y : 0,
	width : 2,
	height : 15,
	color : "WHITE"
}

//creation des fonctions de dessins (rectangle, cercle et texte)
function drawRectangle(x, y, w, h, color) {
	context.fillStyle = color;
	context.fillRect(x, y, w, h);
}

// test :
//drawRectangle(0, 0, canvas.width, canvas.height, "BLACK");

function drawCircle(x, y, radius, color) {
	context.fillStyle = color;
	//pour dessiner un cercle, il faut d'abord tracer un chemin, le perimetre du cercle. Puis on rempli de colour pour en faire une balle !
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
}

function drawNet() {
	for (let i = 0; i <= canvas.height; i += 20) {
		drawRectangle(net.x, net.y + i, net.width, net.height, net.color);
	}
}

// test :
//drawCircle(100, 100, 50, "WHITE");

function drawScore(text, x, y, color) {
	context.fillStyle = color;
	context.font = "55px impact";
	context.fillText(text, x, y);
}

function drawPlayerName(text, x, y, color) {
	context.fillStyle = color;
	context.font = "20px arial";
	context.fillText(text, x, y);
}

// test :
//drawText("something", 500, 500, "GREEN");

// variables globales pour le message de victoire
let isGameOver = false;
let winnerMessage = "";
// variables globales pour le temps d'attente entre chaque point (3 secondes)
let	waitScore = false;
let countdownTime = 3;
let startTime = null;

// fonction pour generer le jeu a l'ecran
function rendering() {
	// on efface et remet les objets sur l'ecran en prenant en compte les FPS
	drawRectangle(0, 0, canvas.width, canvas.height, "BLACK");

	// on dessine aussi un filet...
	drawNet();

	// on inscrit le nom des joueurs
	context.font = "20px arial";
	let playerName = "user name";
	let nameWidth = context.measureText(playerName).width;
	let namePosition = (canvas.width / 4) - (nameWidth / 2);
	drawPlayerName(playerName, namePosition, (canvas.height / 5) - 65, "WHITE");
	
	playerName = "computer";
	nameWidth = context.measureText(playerName).width;
	namePosition = (3 * canvas.width / 4) - (nameWidth / 2);
	drawPlayerName(playerName, namePosition, (canvas.height / 5) - 65, "WHITE");
	
	// on dessine le score ...
	context.font = "55px impact";
	let scoreWidth = context.measureText(user.score).width;
	let scorePosition = (canvas.width / 4) - (scoreWidth / 2);
	drawScore(user.score, scorePosition, canvas.height / 5, "WHITE");

	scoreWidth = context.measureText(computer.score).width;
	scorePosition = (3 * canvas.width / 4) - (scoreWidth / 2);
	drawScore(computer.score, scorePosition, canvas.height / 5, "WHITE");

	// on dessine les autres objets.
	drawRectangle(user.x, user.y, user.width, user.height, user.color);
	drawRectangle(computer.x, computer.y, computer.width, computer.height, computer.color);
	drawCircle(ball.x, ball.y, ball.radius, ball.color);

	if (isGameOver) {
		context.font = "35px impact";
		let winnerWidth = context.measureText(winnerMessage).width;
		let winnerPosition = (canvas.width / 2) - (winnerWidth / 2);
		context.fillStyle = "MAGENTA";
		context.fillText(winnerMessage, winnerPosition, canvas.height / 2);
	}

	if (waitScore && !isGameOver) {
		let count = Math.ceil((countdownTime * 1000 - (Date.now() - startTime)) / 1000); // math.ceil est un arrondi vers le haut.
		context.font = "35px impact";
		let countWidth = context.measureText(count).width;
		let countPosition = (canvas.width / 2) - (countWidth / 2);
		context.fillStyle = "GREEN";
		context.fillText(count, countPosition, canvas.height / 5);
	}

	if (showDebugInfo) { // variable is declared in pong-debug.js
		debugOnScreen();
	}
}

//fonction pour detecter les mouvements par la souris
canvas.addEventListener("mousemove", movePaddle);

function movePaddle(event) {
	// When you're detecting mouse movements on the canvas, the coordinates you get (like event.clientY)
	// are relative to the entire viewport (i.e., the whole browser window).
	// However, you typically want to know where the mouse is relative to the canvas itself.
	// That's where getBoundingClientRect comes in handy.
	let rect = canvas.getBoundingClientRect();
	// on centre le pointeur de la souris au centre du paddle utilisateur
	user.y = event.clientY - rect.top - user.height / 2;

	// pour s'assurer que le paddle ne disparait pas (de moitie) de l'ecran
	if (user.y < 0) {
		user.y = 0;
	}
	if (user.y + user.height > canvas.height) {
		user.y = canvas.height - user.height;
	}
}

//fonction pour detecter et gerer les collisions
function collision(balle, paddle) {
	// selon chatGPT c'est plus safe d'utiliser des variables locales que de changer celle des objets pour eviter les unexpected behavior
	let balleTop = balle.y - balle.radius;
	let balleBottom = balle.y + ball.radius;
	let balleLeft = balle.x - balle.radius;
	let balleRight = balle.x + balle.radius;

	let paddleTop = paddle.y;
	let paddleBottom = paddle.y + paddle.height;
	let paddleLeft = paddle.x;
	let paddleRight = paddle.x + paddle.width;

	return balleRight > paddleLeft && balleBottom > paddleTop && balleLeft < paddleRight && balleTop < paddleBottom;
}

// fonction pour remettre la partie a 0 apres une victoire a 11pts.
function resetGame() {
	// enregistrer la partie dans l'historique des joueurs.
	//reset the scores
	user.score = 0;
	computer.score = 0;

	//reset ball position and speed
	resetBall();

	//restart game Loop
	startGame();
}

// function pour remettre la balle au centre
function resetBall() {
	if (computer.score == 3 || user.score == 3) { //victoire a 11, mis a 3 pour debug process.
		clearInterval(gameLoop);
		isGameOver = true;
		
		if (computer.score == 3) {
			winnerMessage = "Congratulations, " + "computer" + " wins !";
		} else {
			winnerMessage = "Congratulations, " + "user name" + " wins !";
		}
		
		rendering(); // one last frame for the winner message
		
		setTimeout(function() {
			isGameOver = false;
			resetGame();
		}, 5000);
	}

	startTime = Date.now();
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.velocityX = 0; // velocite a 0 pour garder la balle au centre apres un point. (fix)
    ball.velocityY = 0;
	
	waitScore = true;
	setTimeout(() => {
		waitScore = false;
		// restart random
		ball.speed = 5;
		ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
		ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
	}, countdownTime * 1000);
}

// fonction pour mettre a jour les donnees
function update() {
	if (waitScore) {
		return; //countdown 3 seconds
	}

	//mise a jour du score
	if (ball.x - ball.radius < 9) { //the computer wins
		computer.score++;
		keepInfo(); // pour debug
		resetBall();
	} else if (ball.x + ball.radius > canvas.width - 9) {
		user.score++;
		keepInfo(); // pour debug
		resetBall();
	}

	// velocite de la balle
	ball.x += ball.velocityX;
	ball.y += ball.velocityY;

	// Deplacement du paddle de l'ordinateur en fonction de la position de la souris avec un coefficient limiteur pour avoir une chance de gagner :)
	let computerLevel = 0.1;
	computer.y += (ball.y - (computer.y + computer.height / 2)) * computerLevel;
	// pour s'assurer que le paddle ne depasse pas de l'ecran
	if (computer.y < 0) {
		computer.y = 0;
	}
	if (computer.y + computer.height > canvas.height) {
		computer.y = canvas.height - computer.height;
	}

	// check for the next frame instead for the current.
	let nextBallY = ball.y + ball.velocityY;

	if (nextBallY - ball.radius < 0) {
		ball.velocityY = -ball.velocityY;
		ball.y = ball.radius;
	} else if (nextBallY + ball.radius > canvas.height) {
		ball.velocityY = -ball.velocityY;
		ball.y = canvas.height - ball.radius;
	}

	// if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
	// 	ball.velocityY = - ball.velocityY;
	// }
	// // boundary correction
	// if (ball.y - ball.radius < 0) {
	// 	ball.y = ball.radius;
	// 	ball.velocityY = -ball.velocityY;
	// } else if (ball.y + ball.radius > canvas.height) {
	// 	ball.y = canvas.height - ball.radius;
	// 	ball.velocityY = -ball.velocityY;
	// }

	let player = (ball.x < canvas.width / 2) ? user : computer;

	if (collision(ball, player)) {
		// Simplement inverser la velocityX de la balle rendrait le jeu tres predictible. 
		// Donc ajout de la detection de "ou" sur le paddle la balle est receptionnee pour lui donner un angle different.
		let collisionPoint = ball.y - (player.y + player.height / 2 );

		// normalisation : pour avoir un range de [1;-1]
		collisionPoint = collisionPoint / (player.height / 2);

		// calcul de l'angle en radian (45 degres)
		let angleRad = collisionPoint * Math.PI / 4

		// detection de la direction de la balle
		let direction = (ball.x < canvas.width / 2 ? 1 : -1);

		//changement de la velocity de la balle en fonction des calculs precedents
		ball.velocityX = direction * ball.speed * Math.cos(angleRad);
		ball.velocityY = ball.speed * Math.sin(angleRad);

		//augmentation de la vitesse de la balle a chaque impact sur un paddle
		ball.speed += 0.5;
	}
}

// game initialisation
function game() {
	update();
	rendering();
}

// loop pour le rafraichissement de l'ecran de jeu
const framePerSecond = 60;
// setInterval(game, 1000/framePerSecond);

// modifie pour debug et ajout de pauseGame() (pong-debug.js)
let gameLoop;

function startGame() {
	gameLoop = setInterval(game, 1000/framePerSecond);
}

startGame();