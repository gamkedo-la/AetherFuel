const FRAME_PER_SECOND = 30

var canvas, canvasContext;

var player = new Player();
var camera = new Camera();
var editor = new Editor();
var miniMap = new MiniMap();


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
    editor.initialize();

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
    player.reset("Player", playerPic);

    miniMap.setSizes();
}

function updateAll()
{
    if (!editorMode)
    {
        gameMoveAll();
        gameDrawAll();    
    }
    else
    {
        editorMoveAll()
        editorDrawAll();
    }
}

function editorMoveAll()
{
    editor.move();
    camera.follow(editor);
}

function editorDrawAll()
{
    clearScreen();

    // Translate the context for camera scrolling
    camera.translate();

    // Draw all images
    drawTracks(camera.minTrackSeenJ, camera.maxTrackSeenJ,
               camera.minTrackSeenI, camera.maxTrackSeenI);

    // Editor
    editor.draw();

    // Restore the context
    canvasContext.restore();

    // Draw the minimap
    miniMap.draw();
}

function gameMoveAll()
{
    player.move();
    player.handleCollisionWithTracksAdvanced();

    camera.follow(player);
}

function gameDrawAll()
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
}

function clearScreen()
{
    colorRect(0, 0, canvas.width, canvas.height, "black");
}
