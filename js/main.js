const FRAME_PER_SECOND = 30

var canvas, canvasContext;

var player = new Player();
var camera = new Camera();
var miniMap = new MiniMap();

function updateMousePos(evt)
{
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;
    mouseIdx = getTrackIdxFromXY(mouseX + camera.panX, mouseY + camera.panY);
}

window.onload = function()
{
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext("2d");
    
    canvasContext.imageSmoothingEnabled = true;

    colorRect(0, 0, canvas.width, canvas.height, "black");
    colorText("Loading...", canvas.width / 2, canvas.height / 2, "white");
    loadImages();
}

function imageLoadingDoneSoStartGame()
{
    setInterval(updateAll, 1000 / FRAME_PER_SECOND);

    setupInput();
    camera.initialize();

    loadLevel(levelOne, 15, 40);
    // loadLevel(levelTwo, 47, 70);
    // loadLevel(levelThree, 47, 70);
}


function loadLevel(whichLevel, numRows, numCols)
{
    trackNumRows = numRows;
    trackNumCols = numCols;

    camera.initialize();

    trackGrid = whichLevel.slice();
    player.reset("Scarlett Witch", car2Pic);

    miniMap.setSizes();
}

function updateAll()
{
    moveAll();
    drawAll();    
}

function moveAll()
{
    player.move();
    player.handleCollisionWithTracksAdvanced();

    camera.followPlayer(player);
}

function drawAll()
{
    clearScreen();

    // Translate the context for camera scrolling
    camera.translate();

    // Draw all images
    drawTracks(camera.minTrackSeenJ, camera.maxTrackSeenJ,
               camera.minTrackSeenI, camera.maxTrackSeenI);

    player.draw();

    // Restore the context
    canvasContext.restore();

    // Draw the minimap
    miniMap.draw();

    // Editor
    editorDraw();
}

function clearScreen()
{
    colorRect(0, 0, canvas.width, canvas.height, "black");
}
