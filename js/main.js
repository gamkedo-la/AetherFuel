const FRAME_PER_SECOND = 30

var canvas, canvasContext, deltaTime;

var camera = new Camera();
var player = new Player("Player");
var editor = new Editor();
var miniMap = new MiniMap();

var opponents = [new Opponent("Opponent 1")];

var currentLevelIdx = 0;
var currentLevel;
var currentLevelCountDown = 0;

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

    // document.addEventListener("mouseup", function() {AudioMan.playMusic("Audio/synthwaveExperiment1V2(2).wav")});
}

function imageLoadingDoneSoStartGame()
{
    deltaTime = 1000 / FRAME_PER_SECOND;
    setInterval(updateAll, deltaTime);

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
    
    firstWaypoint = currentLevel.firstWaypoint;
    currentWaypoint = firstWaypoint;

    player.reset(playerPic);
    camera.initialize(player.x, player.y, -player.ang);

    opponents.forEach(function(opponent) {
        opponent.reset(darkTravelerPic);
    });

    smokeManager = new SmokeManager();
    smokeManager.createPuffsOfSmokeOverTime();
    //puffOfSmoke = new PuffOfSmoke(player.x, player.y + (player.pic.height)*0.45);

    miniMap.setSizes();

    if (tireTracks) tireTracks.reset();

    countDown(true); // reset
}

function countDown(reset=false)
{
    currentLevelCountDown--;    
    if (reset) {
        currentLevelCountDown = deltaTime * 3;
    }

    return currentLevelCountDown < 0;
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
    if (!countDown()) {
        camera.follow(player);        
        return;
    }
    
    player.move();
    opponents.forEach(function(opponent) {
        opponent.move();
    });

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
    opponents.forEach(function(opponent) {
        opponent.draw();
    });

    smokeManager.drawPuffsOfSmoke();
    // Restore the context
    canvasContext.restore();

    // Draw the minimap
    miniMap.draw();

    if (currentLevelCountDown > -deltaTime) {
        var countDownText = currentLevelCountDown > 0 ? Math.ceil(currentLevelCountDown / deltaTime) : "GO!";        
        var countDownTextXPos = canvas.width / 2 + (currentLevelCountDown > 0 ? 0 : -35);
        var countDownTextYPos = canvas.height / 2;
        colorText(countDownText, countDownTextXPos, countDownTextYPos, 'red', 70);
    }
}

function clearScreen()
{
    colorRect(0, 0, canvas.width, canvas.height, "black");
}
