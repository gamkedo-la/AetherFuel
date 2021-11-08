const FRAME_PER_SECOND = 30

var canvas, canvasContext;

var camera = new Camera();
var player = new Player();
var editor = new Editor();
var miniMap = new MiniMap();

var currentLevelIdx = 0;
var currentLevel;

var backgroundMusic = document.createElement("AUDIO");
var tireTracks;

let puffOfSmoke;
let smokeManager;


window.onload = function()
{
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext("2d");
    
    canvasContext.imageSmoothingEnabled = true;

    colorRect(0, 0, canvas.width, canvas.height, "black");
    colorText("Loading...", canvas.width / 2, canvas.height / 2, "white");
    loadImages();
    AudioMan.init();

    document.addEventListener("mouseup", function() {AudioMan.playMusic("Audio/synthwaveExperiment1V2(2).wav")});
}

function imageLoadingDoneSoStartGame()
{
    setInterval(updateAll, 1000 / FRAME_PER_SECOND);

    setupInput();
    editor.initialize();

    loadLevel(currentLevelIdx);

    tireTracks = new decalManager(canvas);
    
}


function loadLevel(whichLevel)
{
    AudioMan.reset();

    var levelData = levels[whichLevel];
    currentLevel = JSON.parse(levelData);

    trackNumRows = currentLevel.numRows;
    trackNumCols = currentLevel.numCols;

    trackGrid = currentLevel.track.slice();

    player.reset("Player", playerPic);

    smokeManager = new SmokeManager();
    smokeManager.createPuffsOfSmokeOverTime();
    //puffOfSmoke = new PuffOfSmoke(player.x, player.y + (player.pic.height)*0.45);

    miniMap.setSizes();

    if (tireTracks) tireTracks.reset();

}

function updateAll()
{
    if (!editorMode)
    {

        gameMoveAll();
        gameDrawAll(); 
        AudioMan.update();
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
    smokeManager.updatePuffsOfSmoke();
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

    if (tireTracks) tireTracks.draw(canvasContext);

    player.draw();
    smokeManager.drawPuffsOfSmoke();
    // Restore the context
    canvasContext.restore();

    // Draw the minimap
    miniMap.draw();
}

function clearScreen()
{
    colorRect(0, 0, canvas.width, canvas.height, "black");
}
