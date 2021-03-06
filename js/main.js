const FRAME_PER_SECOND = 30
const UI_WIDTH = 200;
const UI_SPACING = 50;
const UI_OFFSET_X = 15;
const UI_SHIELD_BAR_WIDTH = 100;
let VERBOSE = false;

var canvas, canvasContext, deltaTime;

var camera = new Camera();
var player = new Player("Player", playerPic, stunnedOpponentSpriteSheet);
var editor = new Editor();
var miniMap = new MiniMap();

var paused = false;

var opponents = [new Opponent("Opponent 1", lightRiderPic, stunnedLightriderSpriteSheet), 
                 new Opponent("Opponent 2", darkTravelerPic, stunnedDarktravelerSpriteSheet)];

var allSpaceships = opponents.concat([player]);

var playerPositionInRace = 1;

var currentLevelIdx = 0;
var currentLevel;
var currentLevelCountDown = 0;

var decals;

let puffOfSmoke;
// let smokeManager;
let bulletManager;
let testE_Bomb;

var debugAIMode = false;
var debugFreezeAI = false;
var debugFreezeAIButOne = false;
var debugFollowAI = false;
var debugDeactivateZoom = false;

// Variables to control level-to-level transitions
var didFadeOut = false;
var transitioning = false;
var transitioningToEndRace = false;
var transitionRate = 750; // 1000 = 1 second full fade & 1 more second to full restore
var levelToTransitionTo = 0;
var transitionAlpha = 0;
var transitioningTime = 0;

var isEditorModeAccessible = false;

var myFont = new FontFace("myFont", 'url(Fonts/Dream-MMA.ttf)');

window.onload = function()
{
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext("2d");
    
    canvasContext.imageSmoothingEnabled = true;

    colorRect(0, 0, canvas.width, canvas.height, "black");
    colorText("Loading...", canvas.width / 2, canvas.height / 2, "white", "Arial");

    AudioMan.init();

    myFont.load().then(function(font){
        // with canvas, if this is ommited won't work
        document.fonts.add(font);  
        document.body.style.fontFamily = 'myFont, Arial';    
    }).catch(function(error) {
        // error occurred
    });  

    loadImages();

    // document.addEventListener("mouseup", function() {AudioMan.playMusic("Audio/aetherFuel140bpm.wav", 0.25)});
}

window.onblur = function() {    
    paused = true;    
}

window.onfocus = function() {    
    if (currentLevelCountDown > -60) {
        paused = false;
    }
}

function imageLoadingDoneSoStartGame()
{
    deltaTime = 1000 / FRAME_PER_SECOND;
    setInterval(updateAll, deltaTime);

    setupInput();
    editor.initialize();

    checkIfAllSpaceshipNamesAreUnique()
    allSpaceships.forEach(function(spaceship){ console.log(spaceship.name); });

    // loadLevel(currentLevelIdx);
    AudioMan.playMusic("Audio/aetherFuel140bpm.wav", 0.4)

    decals = new decalManager(canvas);
}

function transitionToLevel(whichLevel) 
{
    transitioning = true;
    levelToTransitionTo = whichLevel;
    transitioningTime += deltaTime;

    if (!didFadeOut) {
        if (transitionAlpha <= 0.95) {
            transitionAlpha = Math.sin(transitioningTime / transitionRate);
            if (transitionAlpha > 1) {
                transitionAlpha = 1;
                didFadeOut = true;
                loadLevel(levelToTransitionTo);
                menuMode = false;
                endRaceMenu.setActive(false);
            }
        } else {
            didFadeOut = true;
            loadLevel(levelToTransitionTo);
            menuMode = false;
            endRaceMenu.setActive(false);
        }
    } else if (transitionAlpha >= 0.05) {
        transitionAlpha = Math.sin(transitioningTime / transitionRate);
        if (transitionAlpha <= 0) {
            transitionAlpha = 0;
            didFadeOut = false;
            transitioning = false;
            levelToTransitionTo = 0;
            transitioningTime = 0;
        }
    } else {
        transitioning = false;
        didFadeOut = false;
        levelToTransitionTo = 0;
        transitioningTime = 0;
    }
}

function transitionToEndRaceScreen()
{
    transitioningToEndRace = true;

    transitioningTime += deltaTime;

    if (!didFadeOut) {
        if (transitionAlpha <= 0.95) {
            transitionAlpha = Math.sin(transitioningTime / transitionRate);
            if (transitionAlpha > 1) {
                transitionAlpha = 1;
                didFadeOut = true;
                endRaceMenu.setActive(true);
            }
        } else {
            didFadeOut = true;
            endRaceMenu.setActive(true);
        }
    }
    else if (transitionAlpha >= 0.95) {
        transitionAlpha = Math.sin(transitioningTime / transitionRate);
        if (transitionAlpha <= 0.9) {
            transitionAlpha = 0;
            didFadeOut = false;
            transitioningToEndRace = false;
            levelToTransitionTo = 0;
            transitioningTime = 0;
        }
    } else {
        transitionAlpha = 0;
        transitioningToEndRace = false;
        didFadeOut = false;
        levelToTransitionTo = 0;
        transitioningTime = 0;
    }
}

function loadLevel(whichLevel)
{
    if (VERBOSE) console.log("loading " + whichLevel);
    
    currentLevelIdx = whichLevel;

    AudioMan.reset();
    AudioMan.playMusic("Audio/aetherFuel140bpm.wav", 0.4)

    var levelData = levels[whichLevel];
    currentLevel = JSON.parse(levelData);

    trackNumRows = currentLevel.numRows;
    trackNumCols = currentLevel.numCols;

    maxNumColsOutside = Math.ceil((canvas.width / 2) / TRACK_W);
    maxNumRowsOutside = Math.ceil(canvas.height / TRACK_H);

    trackGrid = currentLevel.track.slice();
    
    firstWaypoint = currentLevel.firstWaypoint == null ? null : new Waypoint(currentLevel.firstWaypoint);
    currentWaypoint = firstWaypoint;
    setHalfWayPoint();

    player.reset(playerPic);
    player.engineSound.mixVolume *= 0.4;
    camera.initialize(player.x, player.y, -player.ang);

    var engineSounds = [
    "Audio/engine_01.wav",
    "Audio/engine_02.wav",
    "Audio/engine_03.wav",
    "Audio/engine_04.wav",
    "Audio/engine_05.wav",]

    opponents.forEach(function(opponent) {
        opponent.engineSoundFile = engineSounds[Math.floor(Math.random() * engineSounds.length)];
        opponent.reset(firstWaypoint);
    });

    // smokeManager = new SmokeManager();
    bulletManager = new BulletManager();
    // smokeManager.createPuffsOfSmokeOverTime();
    // puffOfSmoke = new PuffOfSmoke(player.x, player.y + (player.pic.height)*0.45);

    miniMap.reset();

    if (decals) decals.reset();
    
    if (editorMode) trackGrid = currentLevel.track.slice();
    trackNeedsRefreshing = true; // see track.js optimization
    drawBackGround();

    countDown(true); // reset
    camera.zoom = 1.0;
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
    if (editorMode)
    {
        
        countDown(true);
        editorMoveAll()
        editorDrawAll();
    }
    else if (menuMode)
    {
        // Menu stuff
        mainMenu.draw();
        if (transitioning) transitionToLevel(levelToTransitionTo)
    }
    else if (endRaceMenu.isActive)
    {
        endRaceMenu.draw();
        
        if (transitioning) transitionToLevel(levelToTransitionTo);
        if (transitioningToEndRace) transitionToEndRaceScreen();
    }
    else
    {
        if (!paused && !transitioning) {
            gameUpdateAll();
        } else if (transitioning) {
            transitionToLevel(levelToTransitionTo)
        }
        
        if (transitioningToEndRace) {
            transitionToEndRaceScreen();
        }
        gameDrawAll(); 
        AudioMan.update();
    }

    if (transitioning || transitioningToEndRace) {
        canvasContext.save();
        canvasContext.globalAlpha = transitionAlpha;
        clearScreen();
        canvasContext.restore();
    }
}

function editorMoveAll()
{
    editor.move();
    camera.follow(editor);
}

function editorDrawAll()
{
    clearScreen("LightGray");
    // canvasContext.drawImage(backGroundCanvas, 0, 0);

    // Translate the context for camera scrolling
    camera.translate();

    // Draw all images
    drawTracks(camera.minTrackSeenJ, camera.maxTrackSeenJ,
               camera.minTrackSeenI, camera.maxTrackSeenI);

    // Editor
    editor.draw();

    // Restore the context
    canvasContext.restore();

    // Black band on the left for the UI
    colorRect(0, 0, UI_WIDTH, canvas.height, "black");

    // Draw the minimap
    miniMap.draw();

    // Display editor help
    editor.displayEditorLabel()
}

function gameUpdateAll()
{
    if(!countDown())
    {
        if (debugFollowAI) camera.follow(opponents[0]);  
        else camera.follow(player);        
        return;
    }
    
    player.update();

    for (var i = 0 ; i < ebombsList.length ; i++)
    {
        ebombsList[i].update();
    }

    if (debugFreezeAIButOne)
    {
        opponents[0].update();
    }
    else
    {
        opponents.forEach(function(opponent) {
            opponent.update();
        });
    }

    playerPositionInRace = getPlayerPosition();

    // smokeManager.updatePuffsOfSmoke();
    bulletManager.updateBullets();

    if (debugFollowAI) camera.follow(opponents[0]);  
    else camera.follow(player);       
    
    if (debugDeactivateZoom) return;
    if (camera.zoom > 0.7 && player.speed > 10) {
        camera.zoom -= 0.01
    }
    else if (camera.zoom < 1 && player.speed < 10) {
        camera.zoom += 0.01
    }

    deleteExplodedEBombs();
}

function gameDrawAll()
{
    // clearScreen();
    canvasContext.drawImage(backGroundCanvas, 0, 0);

    // Translate the context for camera scrolling
    camera.translate();

    drawTracks(camera.minTrackSeenJ, camera.maxTrackSeenJ,
               camera.minTrackSeenI, camera.maxTrackSeenI);


    if (decals) decals.draw(canvasContext);

    player.draw();
    opponents.forEach(function(opponent) {
        opponent.draw();
    });

    // smokeManager.drawPuffsOfSmoke();
    bulletManager.drawBullets();
    for (var i = 0 ; i < ebombsList.length ; i++)
    {
        ebombsList[i].draw();
    }
    // Restore the context
    canvasContext.restore();

    //Draw UI
    drawUI();

    // Count Down
    if (currentLevelCountDown > -deltaTime)
    {
        var countDownText = currentLevelCountDown > 0 ? Math.ceil(currentLevelCountDown / deltaTime) : "go";        
        var countDownTextXPos = canvas.width / 2 + (currentLevelCountDown > 0 ? 0 : -35);
        var countDownTextYPos = canvas.height / 2;
        colorText(countDownText, countDownTextXPos, countDownTextYPos, 'red', 70);
    }
    else if (paused)
    {
        colorText("paused", canvas.width / 2 - 98, canvas.height / 2, 'red', 70);
    }

    // Debug mouse position
    if (DEBUG_AI){
        colorText(mouseX.toFixed(2) + " , " + mouseY.toFixed(2), miniMap.x + 5, miniMap.y + miniMapCanvas.height * miniMap.scale + 100, "red", 30);
        colorText(mouseTileI + " , " + mouseTileJ, miniMap.x + 5, miniMap.y + miniMapCanvas.height * miniMap.scale + 150, "red", 30);
    }
}

function clearScreen(color="black")
{
    colorRect(0, 0, canvas.width, canvas.height, color);
}

function drawUI()
{
    var offsetY = 0;

    // Black band on the left for the UI
    colorRect(0, 0, UI_WIDTH, canvas.height, "black");

    // Draw the minimap
    miniMap.draw();
    offsetY += miniMap.y + miniMapCanvas.height * miniMap.scale + UI_SPACING;

    // Draw Remaining ammo
    drawBitmapCenteredWithRotation(
        ebombPic,
        UI_OFFSET_X + SHIELD_RADIUS,  // ebombPic.width / 2,
        offsetY + ebombPic.height / 2,
        0, ebombPic.width, ebombPic.height);

    colorText(
        `${player.numAmmo}`,
        2 * UI_OFFSET_X + SHIELD_RADIUS * 2,  // ebombPic.width,
        offsetY + 30,
        'red', 40);

    colorText(
        "space key",
        UI_OFFSET_X,  // ebombPic.width,
        offsetY + 60,
        'red', 20);
    
    offsetY += ebombPic.height + UI_SPACING + 20;
    
    // Draw Shield Level
    drawBitmapFromSpriteSheetCenteredWithRotation(
			gravitonShieldSheet,
			0,
			56, 55,
			UI_OFFSET_X + SHIELD_RADIUS / 2 + 5, offsetY + SHIELD_RADIUS, 0,
			56, 55,
    );

    colorRect(2 * UI_OFFSET_X + SHIELD_RADIUS * 2, offsetY + SHIELD_RADIUS - 10, UI_SHIELD_BAR_WIDTH, 20, "grey");
    
    var shieldLevel = player.shieldLevel / MAX_SHIELD_LEVEL * UI_SHIELD_BAR_WIDTH;
    colorRect(2 * UI_OFFSET_X + SHIELD_RADIUS * 2, offsetY + SHIELD_RADIUS - 10, shieldLevel, 20, "red");
    
    offsetY += SHIELD_RADIUS * 2 + UI_SPACING;

    // Indicate lap number
    colorRect(UI_OFFSET_X - 2, offsetY - 2, TRACK_W + 4, TRACK_H + 4, "lightGrey")
    canvasContext.drawImage(trackPix[TRACK_GOAL], UI_OFFSET_X, offsetY,)

    var lapsDisplay = Math.min(player.lapsPassed, currentLevel.laps - 1);
    colorText(
        `${lapsDisplay + 1} / ${currentLevel.laps}`,
        UI_OFFSET_X + TRACK_W + 20, offsetY + 30,
        'red', 30);

    offsetY += 70 + UI_SPACING;

    // Indicate lap number
    var playerPositionText = " th";
    if (playerPositionInRace == 1) playerPositionText = " st";
    else if (playerPositionInRace == 2) playerPositionText = " nd";
    else if (playerPositionInRace == 3) playerPositionText = " rd";

    colorText(
        playerPositionInRace + playerPositionText,
        UI_OFFSET_X, offsetY,
        'red', 40);
}