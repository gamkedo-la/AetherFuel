const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;

const KEY_D = 68;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;

// used by editor
const KEY_Z = 90;
const KEY_X = 88;
const KEY_C = 67;

const KEY_E = 69;

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

const KEY_R = 82;

var mouseX, mouseY;
var mouseTileI = 0;
var mouseTileJ = 0;
var mouseIdx = 0;

function keySet(keyEvt, player, setTo)
{
    if (editorMode){ return; }
    
    if (keyEvt.keyCode == player.controlKeyLeft)
    {
        player.keyHeldTurnLeft = setTo;
    }
    if (keyEvt.keyCode == player.controlKeyUp)
    {
        player.keyHeldGas = setTo;
    }
    if (keyEvt.keyCode == player.controlKeyRight)
    {
        player.keyHeldTurnRight = setTo;
    }
    if (keyEvt.keyCode == player.controlKeyDown)
    {
        player.keyHeldReverse = setTo;
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
    if (!editorMode)
    {
        keySet(evt, player, false);
    }
    else
    {
        editor.releaseKey(evt.keyCode);
    }
}

function handleClick(evt)
{
    if (!editorMode){ return; }
    editor.click();
}

function handleClickReleased(evt)
{
    if (!editorMode){ return; }
    editor.releaseClick();
}

function updateMousePos(evt)
{
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;

    mouseX = mouseX / camera.zoom + camera.panX;
    mouseY = mouseY / camera.zoom + camera.panY;
    
    mouseIdx = getTrackIdxFromXY(mouseX, mouseY);
    
    mouseTileI = Math.floor(mouseIdx / trackNumCols);
    mouseTileJ = mouseIdx % trackNumCols;
}

function handleWheel(evt)
{
    console.log(evt.deltaY);

    camera.zoom += evt.deltaY / 6000.0;
}

function setupInput()
{
    canvas.addEventListener("mousemove", updateMousePos);
    canvas.addEventListener("mousedown", handleClick);
    canvas.addEventListener("mouseup", handleClickReleased);
    canvas.addEventListener("wheel", handleWheel);

    document.addEventListener("keydown", keyPressed);
    document.addEventListener("keyup", keyReleased);

    player.setupInput(KEY_W, KEY_D, KEY_S, KEY_A);
}
