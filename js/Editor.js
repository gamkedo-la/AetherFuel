var editorMode = false;
var editorPaintType = 0;


function Editor()
{
    this.x = 0;
    this.y = 0;
    this.ang = 0;

    this.speed = 20.0;

    this.isMovingUp = false;
    this.isMovingLeft = false;
    this.isMovingDown = false;
    this.isMovingRight = false;

    this.isSelectingMultipleTiles = false;
    this.firstTileSelected = 0;

    this.initialize = function()
    {
        this.x = 0;
        this.y = canvas.height;
    }

    this.move = function()
    {
        if(this.isMovingUp)
        {
            this.y -= this.speed;
        }

        if(this.isMovingLeft)
        {
            this.x -= this.speed;
        }

        if(this.isMovingDown)
        {
            this.y += this.speed;
        }

        if(this.isMovingRight)
        {
            this.x += this.speed;
        }
    }

    this.click = function()
    {
        trackGrid[mouseIdx] = editorPaintType;

        if (editorPaintType == TRACK_START)
        {
            trackGrid[playerStart] == TRACK_ROAD;
            playerStart = mouseIdx;
        }
        else
        {
            this.isSelectingMultipleTiles = true;
            this.firstTileSelected = mouseIdx;
        }
    }

    this.releaseClick = function()
    {
        console.log("released");

        var lastTileSelectedI = Math.floor(mouseIdx / trackNumCols);
        var lastTileSelectedJ = mouseIdx % trackNumCols;

        var firstTileSelectedI = Math.floor(this.firstTileSelected / trackNumCols);
        var firstTileSelectedJ = this.firstTileSelected % trackNumCols;

        // trackI * trackNumCols + trackJ
        var selectedTileMinI = Math.min(trackNumRows - 1, Math.max(0, Math.min(lastTileSelectedI, firstTileSelectedI)));
        var selectedTileMaxI = Math.min(trackNumRows - 1, Math.max(0, Math.max(lastTileSelectedI, firstTileSelectedI))) + 1;

        var selectedTileMinJ = Math.min(trackNumCols - 1, Math.max(0, Math.min(lastTileSelectedJ, firstTileSelectedJ)));
        var selectedTileMaxJ = Math.min(trackNumCols - 1, Math.max(0, Math.max(lastTileSelectedJ, firstTileSelectedJ))) + 1;

        console.log("[ " + selectedTileMinI + " , " + selectedTileMaxI + " ]");
        console.log("[ " + selectedTileMinJ + " , " + selectedTileMaxJ + " ]");

        // Update all the tracks in between
        for (var trackI = selectedTileMinI; trackI < selectedTileMaxI; trackI++)
        {
            for (var trackJ = selectedTileMinJ; trackJ < selectedTileMaxJ; trackJ++)
            {
                var trackIdx = trackI * trackNumCols + trackJ;
                trackGrid[trackIdx] = editorPaintType;
            }
        }

        this.isSelectingMultipleTiles = false;
    }

    this.draw = function()
    {
        if (!editorMode){ return; }

        this.displayEditorLabel();

        if (editorPaintType == TRACK_START)
        {
            var useImg = playerPic
            canvasContext.globalAlpha = 0.5;
            drawBitmapCenteredWithRotation(useImg,
                                           mouseX,
                                           mouseY,
                                           -Math.PI / 2);
            canvasContext.globalAlpha = 1.0;
        }
        else
        {
            var useImg = trackPix[editorPaintType];
            
            colorRect(mouseX - useImg.width / 2 - 2,
                      mouseY - useImg.height / 2 - 2,
                      useImg.width + 4,
                      useImg.height + 4,
                      "black")

            canvasContext.drawImage(useImg,
                                    mouseX - useImg.width / 2,
                                    mouseY - useImg.height / 2);
        }
    }
    
    this.displayEditorLabel = function() 
    {
        canvasContext.globalAlpha = 0.75;
        colorRect(0, 0, 125, 40, "red");
        canvasContext.globalAlpha = 1.0;
        colorText("EDITOR", 5, 30, "black");
    }

    this.setKey = function(keyCode)
    {
        if (!editorMode)
        {
            if (keyCode == KEY_TAB)
            {
                editorMode = true;
                trackGrid[playerStart] = TRACK_START;
            }
            return;
        }

        switch(keyCode)
        {
            case KEY_NUM_ROW_0:
                editorPaintType = TRACK_START;
                break;

            case KEY_NUM_ROW_1:
                editorPaintType = TRACK_ROAD;
                break;
            
            case KEY_NUM_ROW_2:
                editorPaintType = TRACK_WALL;
                break;

            case KEY_NUM_ROW_3:
                editorPaintType = TRACK_GOAL;
                break;

            case KEY_E:
                var trackGridExport = trackGrid.slice();
                trackGridExport[playerStart] = TRACK_START;
                console.log(trackGridExport);
                break;

            case KEY_TAB:
                editorMode = false;
                player.reset("Player", playerPic);
                break;

            case KEY_W:
                this.isMovingUp = true;
                break;
        
            case KEY_A:
                this.isMovingLeft = true;
                break;
    
            case KEY_S:
                this.isMovingDown = true;
                break;

            case KEY_D:
                this.isMovingRight = true;
                break;
                                                    
            default:
                break;
        }
    }

    this.releaseKey = function(keyCode)
    {
        switch(keyCode)
        {
            case KEY_W:
                this.isMovingUp = false;
                break;
        
            case KEY_A:
                this.isMovingLeft = false;
                break;
    
            case KEY_S:
                this.isMovingDown = false;
                break;

            case KEY_D:
                this.isMovingRight = false;
                break;
                                                    
            default:
                break;
        }
    }
}