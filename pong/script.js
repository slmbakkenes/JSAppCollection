const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Constants
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 120;
const BALL_RADIUS = 12;
const INITIAL_BALL_SPEED = 8;
const MAX_BALL_SPEED = 40;
const NET_WIDTH = 5;
const NET_COLOR = "WHITE";

// Utility Functions
function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, color, fontSize = 60, fontWeight = 'bold', font = "Courier New") {
    context.fillStyle = color;
    context.font = `${fontWeight} ${fontSize}px ${font}`;
    context.textAlign = "center";
    context.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - NET_WIDTH / 2, i, NET_WIDTH, 10, NET_COLOR);
    }
}

// Factory Functions
function createPaddle(x, y, width, height, color) {
    return { x, y, width, height, color, score: 0 };
}

function createBall(x, y, radius, velocityX, velocityY, color) {
    return { x, y, radius, velocityX, velocityY, color, speed: INITIAL_BALL_SPEED };
}

// Game Objects
const user = createPaddle(0, canvas.height / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT, "WHITE");
const com = createPaddle(canvas.width - PADDLE_WIDTH, canvas.height / 2 - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT, "WHITE");
const ball = createBall(canvas.width / 2, canvas.height / 2, BALL_RADIUS, INITIAL_BALL_SPEED, INITIAL_BALL_SPEED, "WHITE");

// Event Listener for Paddle Movement
canvas.addEventListener('mousemove', movePaddle);

function movePaddle(event) {
    const rect = canvas.getBoundingClientRect();
    user.y = event.clientY - rect.top - user.height / 2;
}

// Game Logic Functions
function isCollision(ball, paddle) {
    return ball.x + ball.radius > paddle.x && ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
    ball.velocityX = -ball.velocityX;
    ball.speed = INITIAL_BALL_SPEED;
}

function update() {
    // Score update and ball reset
    if (ball.x - ball.radius < 0) {
        com.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    // Ball position update
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // AI paddle movement
    com.y += (ball.y - (com.y + com.height / 2)) * 0.1;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Ball collision with paddles
    const paddle = ball.x + ball.radius < canvas.width / 2 ? user : com;
    if (isCollision(ball, paddle)) {
        const collidePoint = ball.y - (paddle.y + paddle.height / 2);
        const collisionAngle = (Math.PI / 4) * (collidePoint / (paddle.height / 2));
        const direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(collisionAngle);
        ball.velocityY = ball.speed * Math.sin(collisionAngle);

        // Increase ball speed
        ball.speed = Math.min(ball.speed + 0.2, MAX_BALL_SPEED);
    }
}

// Render Function
function render() {
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");
    drawNet();
    drawText(user.score, canvas.width / 4, canvas.height / 2, "GRAY", 120, 'bold');
    drawText(com.score, (3 * canvas.width) / 4, canvas.height / 2, "GRAY", 120, 'bold');
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Game Loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the Game Loop
requestAnimationFrame(gameLoop);
