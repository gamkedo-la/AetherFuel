const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;

const KEY_D = 68;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;

const KEY_SPACE = 32;

// used by editor
const KEY_Z = 90;
const KEY_X = 88;
const KEY_C = 67;

const KEY_E = 69;
const KEY_F = 70;

const KEY_NUM_ROW_0 = 48;
const KEY_NUM_ROW_1 = 49;
const KEY_NUM_ROW_2 = 50;
const KEY_NUM_ROW_3 = 51;
const KEY_NUM_ROW_4 = 52;
const KEY_NUM_ROW_5 = 53;
const KEY_NUM_ROW_6 = 54;
const KEY_NUM_ROW_7 = 55;
const KEY_NUM_ROW_8 = 56;
const KEY_NUM_ROW_9 = 57;

const KEY_TAB = 9;

const KEY_P = 80;
const KEY_Q = 81;
const KEY_R = 82;
const KEY_T = 84;
const KEY_N = 78;
const KEY_V = 86; // toggle verbose flag

const KEY_ESC = 27;

var didInteract = false;

var mouseX = 0;
var mouseY = 0;
var mouseOnScreenX = 0;
var mouseOnScreenY = 0;
var mouseTileI = 0;
var mouseTileJ = 0;
var mouseIdx = 0;

var debugQuarterRotNum = 0;
// Add key to paralyze the ai

function keySet(keyEvt, player, setTo)
{
    if (editorMode){ return; }
    
    if (keyEvt.keyCode == player.controlKeyLeft)
    {
        player.holdTurnLeft = setTo;
    }
    if (keyEvt.keyCode == player.controlKeyUp)
    {
        player.holdGas = setTo;
    }
    if (keyEvt.keyCode == player.controlKeyRight)
    {
        player.holdTurnRight = setTo;
    }
    if (keyEvt.keyCode == player.controlKeyDown)
    {
        player.holdReverse = setTo;
    }
    if (keyEvt.keyCode == player.controlKeySpace)
    {
        if (setTo) player.launchAttack();
        else player.stopAttack();
    }
}

function keyPressed(evt)
{
    keySet(evt, player, true);

    // Editor
    editor.setKey(evt.keyCode);

    evt.preventDefault();
}

function keyReleased(evt)
{   
    if(menuMode) {
        if (evt.keyCode == KEY_C) {
            showCredits = !showCredits;
        }
        return;
    }
    if (!editorMode)
    {
        keySet(evt, player, false);
        
        if (evt.keyCode == KEY_F && debugAIMode)
        {
            if (debugFreezeAI)
            {
                if (VERBOSE) console.log("Freeze all but one AI");
                debugFreezeAI = false;
                debugFreezeAIButOne = true;
                opponents.forEach(function(opponent){opponent.freeze();});
            }
            else if (debugFreezeAIButOne)
            {
                if (VERBOSE) console.log("Release all AI");
                debugFreezeAI = false;
                debugFreezeAIButOne = false;
                opponents.forEach(function(opponent){opponent.freeze();});
            }
            else
            {
                if (VERBOSE) console.log("Freeze all AI");
                debugFreezeAI = true;
                debugFreezeAIButOne = false;
                opponents.forEach(function(opponent){opponent.freeze();});
            }
        }
        else if (evt.keyCode == KEY_P) {     
            if (currentLevelCountDown < -deltaTime)  {    
                paused = !paused;            
            }
        }
        else if (evt.keyCode == KEY_V) {
            VERBOSE = !VERBOSE
        }
        else if (evt.keyCode == KEY_NUM_ROW_1 && debugAIMode) {
            debugFollowAI = !debugFollowAI;
        }
        else if (evt.keyCode == KEY_NUM_ROW_2 && DEBUG_PLAYER)
        {
            player.speed = 0;
            player.slideX = 0;
            player.slideY = 0;
            player.ang = debugQuarterRotNum * Math.PI/ 2;

            debugQuarterRotNum++;
            if (debugQuarterRotNum == 4) debugQuarterRotNum = 0;
        }
        else if (evt.keyCode == KEY_NUM_ROW_1 && DEBUG_PLAYER) loadLevel(0);
        else if (evt.keyCode == KEY_NUM_ROW_2 && DEBUG_PLAYER) loadLevel(1);
        else if (evt.keyCode == KEY_NUM_ROW_3 && DEBUG_PLAYER) loadLevel(2);
    }
    else
    {
        editor.releaseKey(evt.keyCode);
    }
}

function handleClick(evt)
{
    didInteract = true;
    
    if (menuMode) mainMenu.handleMouseClick();
    else if (endRaceMenu.isActive) endRaceMenu.handleMouseClick();
    else if (editorMode) editor.click();
}

function handleClickReleased(evt)
{
    if(menuMode) {
        if(showCredits) {
            showCredits = !showCredits;
        }
        return;
    }

    if (!editorMode){ return; }
    editor.releaseClick();
}

function updateMousePos(evt)
{
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseOnScreenX = evt.clientX - rect.left - root.scrollLeft;
    mouseOnScreenY = evt.clientY - rect.top - root.scrollTop;

    mouseX = mouseOnScreenX / camera.zoom + camera.panX;
    mouseY = mouseOnScreenY / camera.zoom + camera.panY;

    if (editorMode)
    {
        mouseX =  (mouseOnScreenX - (canvas.width + UI_WIDTH) / 2) / camera.zoom + camera.panX;
        mouseY = mouseOnScreenY / camera.zoom + camera.panY;
    }
    else if (menuMode)
    {
        mainMenu.handleMousePosition();
    }
    else if (endRaceMenu.isActive)
    {
        endRaceMenu.handleMousePosition();
    }
    else
    {
        var tempMouseX = (mouseOnScreenX - (canvas.width + UI_WIDTH) / 2) / camera.zoom;
        var tempMouseY = (mouseOnScreenY - canvas.height * 0.95) / camera.zoom;  

        var angle = camera.angle - Math.PI / 2;
        mouseX = tempMouseX * Math.cos(angle) + tempMouseY * Math.sin(angle);
        mouseY = -tempMouseX * Math.sin(angle) + tempMouseY * Math.cos(angle);

        mouseX += camera.panX;
        mouseY += camera.panY; 
    }

    mouseIdx = getTrackIdxFromXY(mouseX, mouseY);
    
    mouseTileI = Math.floor(mouseIdx / trackNumCols);
    mouseTileJ = mouseIdx % trackNumCols;

    if (editorMode)
    {
        editor.updateWaypointAngle();
    }
}

function handleWheel(evt)
{
    if (editor.isPlacingWaypoint)
    {
        currentWaypoint.updateThickness(evt.deltaY / 50);
    }
    else
    {
        camera.zoom += evt.deltaY / 6000.0;
    }
}

function setupInput()
{
    canvas.addEventListener("mousemove", updateMousePos);
    canvas.addEventListener("mousedown", handleClick);
    canvas.addEventListener("mouseup", handleClickReleased);
    canvas.addEventListener("wheel", handleWheel);

    document.addEventListener("keydown", keyPressed);
    document.addEventListener("keyup", keyReleased);

    player.setupInput(KEY_W, KEY_D, KEY_S, KEY_A, KEY_SPACE);
}
