// pour debug ball speed
function drawDebugInfo(text, x, y, color) {
	if (text == "PAUSE") {
		context.font = "30px impact";
	} else {
		context.font = "10px arial";
	}
	context.fillStyle = color;
	context.fillText(text, x, y);
}

let showDebugInfo = false;
document.addEventListener("keydown", showDebug);

function showDebug(evt) {
	if(evt.keyCode == 73) {
		showDebugInfo = !showDebugInfo;
		rendering();
	}
}

let bS = 0;
let bX = 0;
let bY = 0;
let bvX = 0;
let bvY = 0;
let uX = 0;
let uY = 0;
let cX = 0;
let cY = 0;

function keepInfo() {
	bS = ball.speed;
	bX = ball.x;
	bY = ball.y;
	bvX = ball.velocityX;
	bvY = ball.velocityY;
	uX = user.x;
	uY = user.y;
	cX = computer.x;
	cY = computer.y;
}

function debugOnScreen() {
	drawDebugInfo("--- Ball ---", 10, 10, "WHITE");
	drawDebugInfo("ball speed: " + ball.speed.toString(), 10, 20, "WHITE");
	drawDebugInfo("ball velX: " + ball.velocityX.toString(), 10, 30, "WHITE");
	drawDebugInfo("ball velY: " + ball.velocityY.toString(), 10, 40, "WHITE");
	drawDebugInfo("ball x coord: " + ball.x.toString(), 10, 50, "WHITE");
	drawDebugInfo("ball y coord: " + ball.y.toString(), 10, 60, "WHITE");
	drawDebugInfo("--- Player Left (user) ---", 10, 70, "WHITE");
	drawDebugInfo("User x coord: " + user.x.toString(), 10, 80, "WHITE");
	drawDebugInfo("User y coord: " + user.y.toString(), 10, 90, "WHITE");
	drawDebugInfo("--- Player Right (comp) ---", 10, 100, "WHITE");
	drawDebugInfo("Comp x coord: " + computer.x.toString(), 10, 110, "WHITE");
	drawDebugInfo("Comp y coord: " + computer.y.toString(), 10, 120, "WHITE");
	drawDebugInfo("--- Other ---", 10, 130, "WHITE");
	drawDebugInfo("FPS: " + framePerSecond.toString(), 10, 140, "WHITE");

	drawDebugInfo("--- Last Score Info ---", 10, 500, "WHITE");
	drawDebugInfo("Last ball speed: " + bS.toString(), 10, 510, "WHITE");
	drawDebugInfo("Last ball x coord: " + bX.toString(), 10, 520, "WHITE");
	drawDebugInfo("Last ball y coord: " + bY.toString(), 10, 530, "WHITE");
	drawDebugInfo("Last ball velX: " + bvX.toString(), 10, 540, "WHITE");
	drawDebugInfo("Last ball velY: " + bvY.toString(), 10, 550, "WHITE");
	drawDebugInfo("Last user x coord: " + uX.toString(), 10, 560, "WHITE");
	drawDebugInfo("Last user y coord: " + uY.toString(), 10, 570, "WHITE");
	drawDebugInfo("Last comp x coord: " + cX.toString(), 10, 580, "WHITE");
	drawDebugInfo("Last comp y coord: " + cY.toString(), 10, 590, "WHITE");
}

// fonction pour mettre la partie en pause (debug uniquement)
let isGamePaused = false;
document.addEventListener("keydown", pauseGame);

function pauseGame(evt) {
	if (showDebugInfo && evt.keyCode == 80) {
		if (isGamePaused) {
			startGame();
			isGamePaused = false;
		} else {
			clearInterval(gameLoop); // met la partie en pause
			let txtPause = "PAUSE";
			context.font = "30px impact";
			let textWidth = context.measureText(txtPause).width;
			let xPosition = (canvas.width / 2) - (textWidth / 2);
			drawDebugInfo(txtPause, xPosition, canvas.height / 2, "RED");
			isGamePaused = true;
		}
	}
}