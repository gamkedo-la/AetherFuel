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
    this.firstTileSelectedI = 0;
    this.firstTileSelectedJ = 0;

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
            
            this.firstTileSelectedI = mouseTileI;
            this.firstTileSelectedJ = mouseTileJ;
        }
    }

    this.releaseClick = function()
    {
        var lastTileSelectedI = mouseTileI;
        var lastTileSelectedJ = mouseTileJ;

        // trackI * trackNumCols + trackJ
        var selectedTileMinI = clipBetween(Math.min(lastTileSelectedI, this.firstTileSelectedI), 0, trackNumRows - 1);
        var selectedTileMaxI = clipBetween(Math.max(lastTileSelectedI, this.firstTileSelectedI), 0, trackNumRows - 1) + 1;

        var selectedTileMinJ = clipBetween(Math.min(lastTileSelectedJ, this.firstTileSelectedJ), 0, trackNumCols - 1);
        var selectedTileMaxJ = clipBetween(Math.max(lastTileSelectedJ, this.firstTileSelectedJ), 0, trackNumCols - 1) + 1;

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

            if (!this.isSelectingMultipleTiles)
            {
                colorRect(mouseTileJ * TRACK_W,
                          mouseTileI * TRACK_H,
                          useImg.width,
                          useImg.height,
                          "black")
    
                canvasContext.drawImage(useImg,
                                        mouseTileJ * TRACK_W + 2,
                                        mouseTileI * TRACK_H + 2,
                                        useImg.width - 4,
                                        useImg.height - 4);
            }
            else
            {
                for (var tileJ = this.firstTileSelectedJ; tileJ < mouseTileJ + 1; tileJ++)
                {
                    for (var tileI = this.firstTileSelectedI; tileI < mouseTileI + 1; tileI++)
                    {
                        colorRect(tileJ * TRACK_W,
                            tileI * TRACK_H,
                            useImg.width + 2,
                            useImg.height + 2,
                            "black")
      
                        canvasContext.drawImage(useImg,
                                                tileJ * TRACK_W + 2,
                                                tileI * TRACK_H + 2,
                                                useImg.width - 2,
                                                useImg.height - 2);
                    }
                }
            }
        }
    }
    
    this.displayEditorLabel = function() 
    {
        canvasContext.globalAlpha = 0.75;
        colorRect(0, 0, 125, 40, "red");
        canvasContext.globalAlpha = 1.0;
        colorText("EDITOR", 5, 30, "black");

        // and some edit mode help because I keep forgetting
        var hx=5,hy=40,hs=17;
        colorRect(0, hy, 125, hs*6+5, "rgba(0,0,0,0.33)");
        colorText("TAB to Return", hx, hy+=hs, "white", 16);
        colorText("0 - Start", hx, hy+=hs, "white", 16);
        colorText("1 - Road", hx, hy+=hs, "white", 16);
        colorText("2 - Wall", hx, hy+=hs, "white", 16);
        colorText("3 - Finish", hx, hy+=hs, "white", 16);
        colorText("E - Export", hx, hy+=hs, "white", 16);
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