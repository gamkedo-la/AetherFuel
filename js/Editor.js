var editorMode = true;
var editorPaintType = 0;


function editorClick()
{
    if (!editorMode){ return; }

    trackGrid[mouseIdx] = editorPaintType;
}


function editorDraw()
{
    if (!editorMode){ return; }

    displayEditorLabel();

    var useImg = trackPix[editorPaintType];

    colorRect(mouseX - useImg.width / 2 - 2,
              mouseY - useImg.height / 2 - 2,
              useImg.width + 4,
              useImg.height + 4,
              "black")
              
    canvasContext.drawImage(useImg, mouseX - useImg.width / 2, mouseY - useImg.height / 2);
}


function displayEditorLabel() 
{
    canvasContext.globalAlpha = 0.75;
    colorRect(0, 0, 125, 40, "red");
    canvasContext.globalAlpha = 1.0;
    colorText("EDITOR", 5, 30, "black");
}

function editorKey(keyCode)
{
    if (!editorMode)
    {
        if (keyCode == KEY_TAB)
        {
            editorMode = true;
        }
        return;
    }

    switch(keyCode)
    {
        case KEY_NUM_ROW_1:
            editorPaintType = TRACK_ROAD;
            
            break;
        
        case KEY_NUM_ROW_2:
            editorPaintType = TRACK_WALL;
            break;

        case KEY_E:
            var trackGridExport = trackGrid.slice();
            trackGridExport[playerStart] = TRACK_START;
            console.log(trackGridExport);
            break;

        case KEY_TAB:
            editorMode = false;
            break;
        
        default:
            break;
    }
}