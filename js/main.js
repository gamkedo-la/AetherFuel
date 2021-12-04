const FRAME_PER_SECOND = 30

var canvas, canvasContext, deltaTime;

var camera = new Camera();
var player = new Player("Player");
var editor = new Editor();
var miniMap = new MiniMap();

var opponents = [new Opponent("Opponent 1", lightRiderPic), 
                 new Opponent("Opponent 2", darkTravelerPic)];

var allSpaceships = opponents.concat([player]);

var currentLevelIdx = 0;
var currentLevel;
var currentLevelCountDown = 0;

var decals;

let puffOfSmoke;
let smokeManager;
let bulletManager;
let testE_Bomb;

var debugAIMode = true;

window.onload = function()
{
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext("2d");
    
    canvasContext.imageSmoothingEnabled = true;

    colorRect(0, 0, canvas.width, canvas.height, "black");
    colorText("Loading...", canvas.width / 2, canvas.height / 2, "white");
    loadImages();
    AudioMan.init();

    // document.addEventListener("mouseup", function() {AudioMan.playMusic("Audio/aetherFuel140bpm.wav", 0.25)});
}

function imageLoadingDoneSoStartGame()
{
    deltaTime = 1000 / FRAME_PER_SECOND;
    setInterval(updateAll, deltaTime);

    setupInput();
    editor.initialize();

    checkIfAllSpaceshipNamesAreUnique()
    allSpaceships.forEach(function(spaceship){ console.log(spaceship.name); });

    loadLevel(currentLevelIdx);

    decals = new decalManager(canvas);
}


function loadLevel(whichLevel)
{
    AudioMan.reset();

    var levelData = levels[whichLevel];
    currentLevel = JSON.parse(levelData);

    trackNumRows = currentLevel.numRows;
    trackNumCols = currentLevel.numCols;

    trackGrid = currentLevel.track.slice();
    
    firstWaypoint = currentLevel.firstWaypoint == null ? null : new Waypoint(currentLevel.firstWaypoint);
    currentWaypoint = firstWaypoint;

    player.reset(playerPic);
    player.engineSound.mixVolume *= 0.10;
    camera.initialize(player.x, player.y, -player.ang);

    opponents.forEach(function(opponent) {
        opponent.reset(firstWaypoint);
    });

    smokeManager = new SmokeManager();
    bulletManager = new BulletManager();
    smokeManager.createPuffsOfSmokeOverTime();
    //puffOfSmoke = new PuffOfSmoke(player.x, player.y + (player.pic.height)*0.45);

    miniMap.setSizes();

    if (decals) decals.reset();
    
    trackNeedsRefreshing = true; // see track.js optimization

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
        countDown(true);
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
    if(!countDown())
    {
        camera.follow(player);        
        return;
    }
    
    player.move();
    if (testE_Bomb != undefined)
    {
        testE_Bomb.update();
    }
    opponents.forEach(function(opponent) {
        opponent.move();
    });

    smokeManager.updatePuffsOfSmoke();
    bulletManager.updateBullets();
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

    if (decals) decals.draw(canvasContext);

    player.draw();
    opponents.forEach(function(opponent) {
        opponent.draw();
    });

    smokeManager.drawPuffsOfSmoke();
    bulletManager.drawBullets();
    if (testE_Bomb != undefined)
    {
        testE_Bomb.draw();
    }
    
    // Restore the context
    canvasContext.restore();

    // Draw the minimap
    miniMap.draw();
    colorText(`Lap ${player.lapsPassed + 1} / ${currentLevel.laps}`, miniMap.x + 2, miniMap.y + miniMap.height / 2 + 20, 'red', 20);

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
