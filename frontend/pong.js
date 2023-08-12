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

function drawText(text, x, y, color) {
	context.fillStyle = color;
	context.font = "55px impact";
	context.fillText(text, x, y);
}

// test :
//drawText("something", 500, 500, "GREEN");

function rendering() {
	// on efface et remet les objets sur l'ecran en prenant en compte les FPS
	drawRectangle(0, 0, canvas.width, canvas.height, "BLACK");

	// on dessine aussi un filet...
	drawNet();

	// on dessine le score ...
	drawText(user.score, canvas.width / 4, canvas.height / 5, "WHITE");
	drawText(computer.score, 3 * canvas.width / 4, canvas.height / 5, "WHITE");

	// on dessine les autres objets.
	drawRectangle(user.x, user.y, user.width, user.height, user.color);
	drawRectangle(computer.x, computer.y, computer.width, computer.height, computer.color);
	drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

//fonction pour detecter les mouvements par la souris
canvas.addEventListener("mousemove", movePaddle);

function movePaddle(evt) {
	//ca fait ce que ca doit faire.
	let rect = canvas.getBoundingClientRect();
	// on centre le pointeur de la souris au centre du paddle utilisateur
	user.y = evt.clientY - rect.top - user.height / 2;
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

// funciton pour remttre la balle au centre
function resetBall() {
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.speed = 5;
	ball.velocityX = -ball.velocityX;
}

// fonction pour mettre a jour les donnees
function update() {
	ball.x += ball.velocityX;
	ball.y += ball.velocityY;

	// Deplacement du paddle de l'ordinateur en fonction de la position de la souris avec un coefficient limiteur pour avoir une chance de gagner :)
	let computerLevel = 0.1;
	computer.y += (ball.y - (computer.y + computer.height / 2)) * computerLevel;

	if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
		ball.velocityY = - ball.velocityY;
	}

	//mise a jour du score
	if (ball.x - ball.radius < 0) {
		//the computer wins
		computer.score++;
		resetBall();
	} else if (ball.x + ball.radius > canvas.width) {
		user.score++;
		resetBall();
	}

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
		ball.velocityY = direction * ball.speed * Math.sin(angleRad);

		//augmentation de la vitesse de la balle a chaque impact sur un paddle
		ball.speed += 0.5;

		//mise a jour du score
		if (ball.x - ball.radius < 10) {
			//the computer wins
			computer.score++;
			resetBall();
		} else if (ball.x + ball.radius > canvas.width - 10) {
			user.score++;
			resetBall();
		}
	}
}

// game initialisation
function game() {
	update();
	rendering();
}

// loop pour le rafraichissement de l'ecran de jeu
const framePerSecond = 60;
setInterval(game, 1000/framePerSecond);
