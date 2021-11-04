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
        this.y = 0;
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
            trackGrid[playerStart] = TRACK_ROAD;
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
        if (!this.isSelectingMultipleTiles){ return; }

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
                                           mouseTileJ * TRACK_W + useImg.width / 2,
                                           mouseTileI * TRACK_H  + useImg.height / 2,
                                           -Math.PI / 2,
                                           useImg.width,
                                           useImg.height);
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
                                        (useImg.width - 4),
                                        (useImg.height - 4));
            }
            else
            {
                var minTileJ = Math.min(this.firstTileSelectedJ, mouseTileJ);
                var maxTileJ = Math.max(this.firstTileSelectedJ, mouseTileJ);

                var minTileI = Math.min(this.firstTileSelectedI, mouseTileI);
                var maxTileI = Math.max(this.firstTileSelectedI, mouseTileI);

                for (var tileJ = minTileJ; tileJ < maxTileJ + 1; tileJ++)
                {
                    for (var tileI = minTileI; tileI < maxTileI + 1; tileI++)
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
        colorRect(0, 0, 175, 40, "red");
        canvasContext.globalAlpha = 1.0;
        colorText("EDITOR", 5, 30, "black");

        // and some edit mode help because I keep forgetting
        var hx=5,hy=40,hs=17;
        colorRect(0, hy, 175, hs*10+5, "rgba(0,0,0,0.33)");
        colorText("TAB to Return", hx, hy+=hs, "white", 16);
        colorText("0 - Starting Line", hx, hy+=hs, "white", 16);
        colorText("1 - Road", hx, hy+=hs, "white", 16);
        colorText("2 - Wall", hx, hy+=hs, "white", 16);
        colorText("3 - Finish line", hx, hy+=hs, "white", 16);
        colorText("Z - Mirror Map", hx, hy+=hs, "white", 16);
        colorText("X - Fill Map", hx, hy+=hs, "white", 16);
        colorText("C - Corners", hx, hy+=hs, "white", 16);
        colorText("E - Export", hx, hy+=hs, "white", 16);
        colorText("Mouse Wheel - Zoom", hx, hy+=hs, "white", 16);
    }

    // erases the entire map and fills it with a single tile
    this.fillMap = function() {
        for (let i=0; i<trackGrid.length; i++) {
            trackGrid[i] = editorPaintType;
        }
    }        

    // adds smooth curves on the four corners of the map
    this.curvyCorners = function(radius) {
        var curveTemplate = [
            [1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,0],
            [1,1,1,1,1,0,0,0],
            [1,1,1,1,0,0,0,0],
            [1,1,1,0,0,0,0,0],
            [1,1,0,0,0,0,0,0],
            [1,1,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0]
        ];
        
        // top left curve
        for (let r=0; r<8; r++) {
            for (let c=0; c<8; c++) {
                let val = curveTemplate[r][c];
                if (val) setTrackTypeAtIJ(r,c,val);
            }
        }

        this.mirrorSymmetry(); // the other three

    }        

    // copies the top left corner 3x on map
    this.mirrorSymmetry = function() {
        var rows = Math.floor(trackNumRows/2);
        var cols = Math.floor(trackNumCols/2);
        var val;
        for (let r=0; r<rows; r++) {
            for (let c=0; c<cols; c++) {
                // get top left
                val = returnTrackTypeAtIJ(r,c);
                // set bottom right
                setTrackTypeAtIJ(trackNumRows-r,trackNumCols-c,val);
                // set top right
                setTrackTypeAtIJ(r,trackNumCols-c,val);
                // set bottom left
                setTrackTypeAtIJ(trackNumRows-r,c,val);
            }
        }
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

            case KEY_X:
                this.fillMap();
                break;

            case KEY_C:
                this.curvyCorners();
                break;

            case KEY_Z:
                this.mirrorSymmetry();
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