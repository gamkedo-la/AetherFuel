const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;

const KEY_D = 68;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;

const KEY_E = 69;

const KEY_NUM_ROW_1 = 49;
const KEY_NUM_ROW_2 = 50;
const KEY_NUM_ROW_3 = 51;

const KEY_TAB = 9;

var mouseX, mouseY;
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
    editor.click();
}

function setupInput()
{
    canvas.addEventListener("mousemove", updateMousePos);
    canvas.addEventListener("mousedown", handleClick);

    document.addEventListener("keydown", keyPressed);
    document.addEventListener("keyup", keyReleased);

    player.setupInput(KEY_W, KEY_D, KEY_S, KEY_A);
}
