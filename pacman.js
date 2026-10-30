const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const pacmanSpeed = 110;
const ghostSpeed = 75;

const originalMaze = [
    "###############",
    "#.............#",
    "#.###.###.###.#",
    "#.............#",
    "#.###.#.#.###.#",
    "#.....#.#.....#",
    "#####.#.#.#####",
    "    #.#.#.#    ",
    "#####.#.#.#####",
    "#.....#.#.....#",
    "#.###.#.#.###.#",
    "#.............#",
    "#.###.###.###.#",
    "#.............#",
    "###############"
];

const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

let maze;
let score = 0;
let gameOver = false;
let won = false;

let pacman;
let ghosts = [];

let nextDirection = "right";
let animationTime = 0;
let lastTime = 0;

function tileCenter(tile) {
    return tile * tileSize + tileSize / 2;
}

function getTileX(x) {
    return Math.round((x - tileSize / 2) / tileSize);
}

function getTileY(y) {
    return Math.round((y - tileSize / 2) / tileSize);
}

function hasReachedDestination(character) {
    return character.targetX === null &&
           character.targetY === null;
}

function isWall(x, y) {
    if (y < 0 || y >= maze.length) {
        return true;
    }

    if (x < 0 || x >= maze[y].length) {
        return true;
    }

    return maze[y][x] === "#" || maze[y][x] === " ";
}

function canMove(character, direction) {
    const move = directions[direction];

    if (!move) {
        return false;
    }

    const tileX = getTileX(character.x);
    const tileY = getTileY(character.y);

    return !isWall(
        tileX + move.x,
        tileY + move.y
    );
}

function startGame() {
    maze = originalMaze.map(row => row.split(""));

    score = 0;
    gameOver = false;
    won = false;
    animationTime = 0;

    pacman = {
        x: tileCenter(1),
        y: tileCenter(1),
        direction: "right",
        targetX: null,
        targetY: null
    };

    ghosts = [
        {
            x: tileCenter(13),
            y: tileCenter(1),
            direction: "left",
            targetX: null,
            targetY: null,
            color: "red"
        },
        {
            x: tileCenter(1),
            y: tileCenter(13),
            direction: "right",
            targetX: null,
            targetY: null,
            color: "pink"
        },
        {
            x: tileCenter(13),
            y: tileCenter(13),
            direction: "up",
            targetX: null,
            targetY: null,
            color: "cyan"
        }
    ];

    nextDirection = "right";

    document.getElementById("score").textContent = score;

    drawGame();
}

document.addEventListener("keydown", function(event) {
    const keys = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
    };

    if (keys[event.key]) {
        event.preventDefault();
        nextDirection = keys[event.key];
    }
});

function startMove(character, direction) {
    const move = directions[direction];

    if (!move || !hasReachedDestination(character)) {
        return false;
    }

    const tileX = getTileX(character.x);
    const tileY = getTileY(character.y);

    const nextTileX = tileX + move.x;
    const nextTileY = tileY + move.y;

    if (isWall(nextTileX, nextTileY)) {
        return false;
    }

    character.direction = direction;
    character.targetX = tileCenter(nextTileX);
    character.targetY = tileCenter(nextTileY);

    return true;
}

function moveCharacter(character, speed, deltaTime) {
    if (hasReachedDestination(character)) {
        return;
    }

    const dx = character.targetX - character.x;
    const dy = character.targetY - character.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.001) {
        character.x = character.targetX;
        character.y = character.targetY;
        character.targetX = null;
        character.targetY = null;
        return;
    }

    const step = Math.min(speed * deltaTime, distance);

    character.x += (dx / distance) * step;
    character.y += (dy / distance) * step;

    if (step >= distance) {
        character.x = character.targetX;
        character.y = character.targetY;
        character.targetX = null;
        character.targetY = null;
    }
}

function movePacman(deltaTime) {
    if (hasReachedDestination(pacman)) {
        const movedRequestedDirection = startMove(
            pacman,
            nextDirection
        );

        if (!movedRequestedDirection) {
            const movedCurrentDirection = startMove(
                pacman,
                pacman.direction
            );

            if (!movedCurrentDirection) {
                pacman.direction = "none";
            }
        }
    }

    moveCharacter(pacman, pacmanSpeed, deltaTime);

    if (hasReachedDestination(pacman)) {
        const tileX = getTileX(pacman.x);
        const tileY = getTileY(pacman.y);

        if (
            tileY >= 0 &&
            tileY < maze.length &&
            tileX >= 0 &&
            tileX < maze[tileY].length &&
            maze[tileY][tileX] === "."
        ) {
            maze[tileY][tileX] = "";
            score += 10;

            document.getElementById("score").textContent = score;
        }
    }
}

function chooseGhostDirection(ghost) {
    const possibleMoves = Object.keys(directions).filter(direction => {
        return canMove(ghost, direction);
    });

    const opposite = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    };

    let choices = possibleMoves.filter(direction => {
        return direction !== opposite[ghost.direction];
    });

    if (choices.length === 0) {
        choices = possibleMoves;
    }

    if (choices.length > 0) {
        return choices[
            Math.floor(Math.random() * choices.length)
        ];
    }

    return "none";
}

function moveGhosts(deltaTime) {
    ghosts.forEach(ghost => {
        if (hasReachedDestination(ghost)) {
            const newDirection = chooseGhostDirection(ghost);

            if (!startMove(ghost, newDirection)) {
                ghost.direction = "none";
            }
        }

        moveCharacter(ghost, ghostSpeed, deltaTime);
    });
}

function checkCollision() {
    ghosts.forEach(ghost => {
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 20) {
            gameOver = true;
        }
    });
}

function checkWin() {
    const remainingDots = maze.some(row => row.includes("."));

    if (!remainingDots) {
        won = true;
        gameOver = true;
    }
}

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const tile = maze[y][x];

            if (tile === "#") {
                ctx.fillStyle = "blue";

                ctx.fillRect(
                    x * tileSize,
                    y * tileSize,
                    tileSize,
                    tileSize
                );
            }

            if (tile === ".") {
                ctx.fillStyle = "white";
                ctx.beginPath();

                ctx.arc(
                    tileCenter(x),
                    tileCenter(y),
                    4,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    const angles = {
        right: 0,
        down: Math.PI / 2,
        left: Math.PI,
        up: -Math.PI / 2,
        none: 0
    };

    const angle = angles[pacman.direction] ?? 0;
    const mouth = 0.12 + Math.abs(Math.sin(animationTime * 10)) * 0.38;

    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(pacman.x, pacman.y);

    ctx.arc(
        pacman.x,
        pacman.y,
        13,
        angle + mouth,
        angle + Math.PI * 2 - mouth
    );

    ctx.closePath();
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();

        ctx.arc(
            ghost.x,
            ghost.y,
            13,
            Math.PI,
            0
        );

        ctx.lineTo(ghost.x + 13, ghost.y + 13);
        ctx.lineTo(ghost.x - 13, ghost.y + 13);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.beginPath();

        ctx.arc(ghost.x - 5, ghost.y - 2, 4, 0, Math.PI * 2);
        ctx.arc(ghost.x + 5, ghost.y - 2, 4, 0, Math.PI * 2);

        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();

        ctx.arc(ghost.x - 5, ghost.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(ghost.x + 5, ghost.y - 2, 2, 0, Math.PI * 2);

        ctx.fill();
    });
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawPacman();
    drawGhosts();

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = won ? "yellow" : "red";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            won ? "YOU WIN!" : "GAME OVER",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";

        ctx.fillText(
            "Press Restart to play again",
            canvas.width / 2,
            canvas.height / 2 + 40
        );
    }
}

function updateGame(deltaTime) {
    if (gameOver) {
        return;
    }

    movePacman(deltaTime);
    moveGhosts(deltaTime);
    checkCollision();

    if (!gameOver) {
        checkWin();
    }
}

function gameLoop(timestamp) {
    if (lastTime === 0) {
        lastTime = timestamp;
    }

    let deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    deltaTime = Math.min(deltaTime, 0.05);
    animationTime += deltaTime;

    updateGame(deltaTime);
    drawGame();

    requestAnimationFrame(gameLoop);
}

document.getElementById("restartButton").addEventListener("click", function() {
    startGame();
});

startGame();
requestAnimationFrame(gameLoop);
