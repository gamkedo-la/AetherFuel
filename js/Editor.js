var editorMode = false;
var editorPaintType = 0;

const WAYPOINT_GAS_PERCENTAGE_INCREMENT = 0.1;
const NUM_WAYPOINT_ORIENTATIONS = 16;

var oldWaypointDataContainer = null;

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

    this.isPlacingWaypoint = false;
    this.isUpdatingExistingWaypoint = false;
    this.isPlacingDecals = false;
    this.decalData = "";

    this.initialize = function()
    {
        this.x = 0;
        this.y = 0;
    }

    this.move = function()
    {
        if (this.isPlacingWaypoint) return;
        if (this.isPlacingDecals) return;

        if(this.isMovingUp)
        {
            this.y -= this.speed / camera.zoom;
        }

        if(this.isMovingLeft)
        {
            this.x -= this.speed / camera.zoom;
        }

        if(this.isMovingDown)
        {
            this.y += this.speed / camera.zoom;
        }

        if(this.isMovingRight)
        {
            this.x += this.speed / camera.zoom;
        }
    }

    this.click = function()
    {
        if (editorPaintType == TRACK_WAYPOINT)
        {
            if (!this.isPlacingWaypoint)
            {
                this.createWaypoint();
            }
            else
            {
                this.endWaypointCreation();
                placeCurrentWaypointAtLastWaypoint();
            }
            return;
        }

        if (this.isPlacingDecals) {
            this.decalData += mouseX+","+mouseY+",";
            console.log("var decalData = ["+this.decalData+"];");
            return;
        }

        setTrackTypeAtIJ(mouseTileI, mouseTileJ, editorPaintType);

        if (editorPaintType != TRACK_START)
        {
            this.isSelectingMultipleTiles = true;
            this.firstTileSelected = mouseIdx;
            
            this.firstTileSelectedI = mouseTileI;
            this.firstTileSelectedJ = mouseTileJ;
        }
    }

    this.endWaypointCreation = function()
    {
        this.isPlacingWaypoint = false;
        this.isUpdatingExistingWaypoint = false;
    }

    this.createWaypoint = function()
    {
        var existingWaypoint = getExistingWaypointAtXY(mouseX, mouseY);

        if (existingWaypoint != null)
        {
            this.updateExistingWaypoint(existingWaypoint);
        }
        else{
            this.createNewWaypoint();
        }
    }

    this.deleteAllWaypoints = function()
    {
        firstWaypoint = null;
        currentWaypoint = null;
    }

    this.createNewWaypoint = function()
    {
        var waypointData = {
            "x": mouseX,
            "y": mouseY,
            "angle": 0,
            "thickness": 100,
            "percentageGasAppliedTime":0.8,
            "next": null
        };
        var newWaypoint = new Waypoint(waypointData);

        if (currentWaypoint != null)
        {
            currentWaypoint.addWaypoint(newWaypoint);
            currentWaypoint = newWaypoint;
        }
        else
        {
            currentWaypoint = newWaypoint;
            firstWaypoint = newWaypoint;
        }
        console.log(currentWaypoint.percentageGasAppliedTime);
        this.isPlacingWaypoint = true;
    }

    this.updateExistingWaypoint = function(existingWaypoint)
    {
        currentWaypoint = existingWaypoint;
        oldWaypointDataContainer = existingWaypoint.exportData();

        this.isPlacingWaypoint = true;
        this.isUpdatingExistingWaypoint = true;
    }

    this.updateWaypointAngle = function()
    {
        if (!this.isPlacingWaypoint) return;
        var anglePortion = Math.max(0, (mouseOnScreenX - UI_WIDTH) / (canvas.width - UI_WIDTH));
        anglePortion = Math.floor(anglePortion * NUM_WAYPOINT_ORIENTATIONS);
        currentWaypoint.updateAngle(anglePortion * 2 * Math.PI / NUM_WAYPOINT_ORIENTATIONS);
    }

    this.releaseClick = function()
    {
        if (!this.isSelectingMultipleTiles){ return; }
        if (editorPaintType == TRACK_WAYPOINT){ return; }

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
                setTrackTypeAtIJ(trackI, trackJ, editorPaintType);
            }
        }

        this.isSelectingMultipleTiles = false;
    }

    this.draw = function()
    {
        if (!editorMode){ return; }

        if (editorPaintType == TRACK_START)
        {
            this.drawTrackStartAtMousePosition();
        }
        else if (editorPaintType == TRACK_WAYPOINT)
        {
            if (!this.isPlacingWaypoint)
            {
                this.drawWaypointAtMousePosition();
            }
        } else if (this.isPlacingDecals) {
            // FIXME draw the decal sprite under the mouse cursor
        }
        else
        {
            var useImg;
            if (editorPaintType == TRACK_ROAD)
            {
                useImg = currentLevelIdx == LEVEL_ICE ? roadPix[LEVEL_ICE] : roadPix[LEVEL_SAND];
            }
            else
            {
                useImg = trackPix[editorPaintType];
            }

            if (!this.isSelectingMultipleTiles)
            {
                this.drawSingleTrackTypeAtMousePosition(useImg);
            }
            else
            {
                this.drawMultipleTiles(useImg);
            }
        }
    }

    this.drawTrackStartAtMousePosition = function()
    {
        var useImg = playerPic;
        canvasContext.globalAlpha = 0.5;
        drawBitmapCenteredWithRotation(useImg,
            mouseTileJ * TRACK_W + useImg.width / 2,
            mouseTileI * TRACK_H + useImg.height / 2,
            -Math.PI / 2,
            useImg.width,
            useImg.height);
        canvasContext.globalAlpha = 1.0;
    }

    this.drawWaypointAtMousePosition = function()
    {
        drawBitmapCenteredWithRotation(waypointPic, mouseX, mouseY, 
            0.0, waypointPic.width, waypointPic.height);
    }

    this.drawSingleTrackTypeAtMousePosition = function(useImg)
    {
        colorRect(mouseTileJ * TRACK_W,
            mouseTileI * TRACK_H,
            useImg.width,
            useImg.height,
            "black");

        canvasContext.drawImage(useImg,
            mouseTileJ * TRACK_W + 2,
            mouseTileI * TRACK_H + 2,
            (useImg.width - 4),
            (useImg.height - 4));
    }

    this.drawMultipleTiles = function(useImg)
    {
        var minTileJ = Math.min(this.firstTileSelectedJ, mouseTileJ);
        var maxTileJ = Math.max(this.firstTileSelectedJ, mouseTileJ);

        var minTileI = Math.min(this.firstTileSelectedI, mouseTileI);
        var maxTileI = Math.max(this.firstTileSelectedI, mouseTileI);

        for (var tileJ = minTileJ; tileJ < maxTileJ + 1; tileJ++) {
            for (var tileI = minTileI; tileI < maxTileI + 1; tileI++) {
                colorRect(tileJ * TRACK_W,
                    tileI * TRACK_H,
                    useImg.width + 2,
                    useImg.height + 2,
                    "black");

                canvasContext.drawImage(useImg,
                    tileJ * TRACK_W + 2,
                    tileI * TRACK_H + 2,
                    useImg.width - 2,
                    useImg.height - 2);
            }
        }
    }
    
    this.displayEditorLabel = function() 
    {
        var offsetY = miniMapCanvas.height * miniMap.scale

        canvasContext.globalAlpha = 0.75;
        colorRect(0, offsetY, 175, 40, "red");
        canvasContext.globalAlpha = 1.0;
        colorText("EDITOR", 5, offsetY + 30, "black");

        // and some edit mode help because I keep forgetting
        var hx=5,hy= offsetY + 40,hs=17;
        
        colorRect(0, hy, 175, hs*16+5, "rgba(0,0,0,0.33)");
        colorText("Mouse Wheel - Zoom", hx, hy+=hs, "white", 16);
        colorText("TAB to Return", hx, hy+=hs, "white", 16);
        colorText("0 - Starting Line", hx, hy+=hs, "white", 16);
        colorText("1 - Road", hx, hy+=hs, "white", 16);
        colorText("2 - Wall", hx, hy+=hs, "white", 16);
        colorText("3 - Finish line", hx, hy+=hs, "white", 16);
        colorText("4 - Sand With E_Bomb", hx, hy+=hs, "white", 16);
        colorText("5 - Tree", hx, hy+=hs, "white", 16);
        colorText("8 - Decal Paint", hx, hy+=hs, "white", 16);
        colorText("9 - Waypoint", hx, hy+=hs, "white", 16);
        colorText("R - Resize", hx, hy+=hs, "white", 16);
        colorText("Z - Mirror Map", hx, hy+=hs, "white", 16);
        colorText("X - Fill Map", hx, hy+=hs, "white", 16);
        colorText("C - Corners", hx, hy+=hs, "white", 16);
        colorText("E - Export", hx, hy+=hs, "white", 16);
        colorText("Q - Delete All Waypoints", hx, hy+=hs, "white", 16);
        colorText("T - Load a Level", hx, hy+=hs, "white", 16);
        colorText("N - Create a new Level", hx, hy+=hs, "white", 16);
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
                trackGrid = JSON.parse(levels[currentLevelIdx]).track.slice();
                trackNeedsRefreshing = true;
                miniMap.reset();
            }
            return;
        }

        if (this.isPlacingWaypoint)
        {
            switch(keyCode)
            {
                case KEY_UP_ARROW:
                    currentWaypoint.percentageGasAppliedTime += WAYPOINT_GAS_PERCENTAGE_INCREMENT;
                    currentWaypoint.percentageGasAppliedTime = clipBetween(currentWaypoint.percentageGasAppliedTime, 0.3, 1.0);
                    console.log(currentWaypoint.percentageGasAppliedTime);
                    break;
                case KEY_DOWN_ARROW:
                    currentWaypoint.percentageGasAppliedTime -= WAYPOINT_GAS_PERCENTAGE_INCREMENT;
                    currentWaypoint.percentageGasAppliedTime = clipBetween(currentWaypoint.percentageGasAppliedTime, 0.3, 1.0);
                    console.log(currentWaypoint.percentageGasAppliedTime);
                    break;

                case KEY_ESC:
                    if (this.isUpdatingExistingWaypoint)
                    {    
                        currentWaypoint.resetData(oldWaypointDataContainer);

                        oldWaypointDataContainer = null;
                        this.endWaypointCreation();
                        placeCurrentWaypointAtLastWaypoint();
                    }
                    break;

                default:
                    break;
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

            case KEY_NUM_ROW_4:
                editorPaintType = TRACK_SAND_WITH_E_BOMB;
                break;

            case KEY_NUM_ROW_5:
                editorPaintType = TRACK_TREE;
                break;

            case KEY_NUM_ROW_8:
                this.isPlacingDecals = !this.isPlacingDecals;
                console.log("Decal Mode "+(this.isPlacingDecals?"ON":"OFF"));
                break;

            case KEY_NUM_ROW_9:
                editorPaintType = TRACK_WAYPOINT;
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
                currentLevel.track = trackGrid.slice();
                currentLevel.firstWaypoint = firstWaypoint;
                //currentLevel.decalData = decalData;
                console.log(JSON.stringify(currentLevel));
                break;

            case KEY_TAB:
                editorMode = false;
                currentWaypoint = firstWaypoint;
                
                player.reset(playerPic);
                camera.initialize(player.x, player.y, -player.ang);
                
                opponents.forEach(function(opponent) {
                    opponent.reset(firstWaypoint);
                });
                
                trackNeedsRefreshing = true;
                miniMap.reset();
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

            case KEY_R:
                this.resizeTrackGrid();
                break;

            case KEY_Q:
                this.deleteAllWaypoints();
                break;

            case KEY_T:       
                var whichLevel = window.prompt("Which level do you want to load?");
                loadLevel(whichLevel - 1);
                break;

            case KEY_N:
                var newLevel = createNewLevel();
                console.log(newLevel);
                levels.push(newLevel);
                loadLevel(levels.length - 1);
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

    this.resizeTrackGrid = function()
    {
        var nrows = parseInt(window.prompt("How Many Rows? - Current = " + trackNumRows));
        var ncols = parseInt(window.prompt("How Many cols? - Current = " + trackNumCols));

        currentLevel.numRows = nrows;
        currentLevel.numCols = ncols;

        var newTrack = new Array(nrows * ncols);

        this.initializeNewTrack(nrows, ncols, newTrack);

        trackNumRows = nrows;
        trackNumCols = ncols;
        trackGrid = newTrack.slice();
    }

    this.initializeNewTrack = function(nrows, ncols, newTrack)
    {
        if (USE_OFFSCREEN_TRACK_BUFFER) trackNeedsRefreshing = true;
        
        var isTrackStartFound = false;
        var firstRoadIdx = -1;

        for (var i = 0; i < nrows; i++)
        {
            for (var j = 0; j < ncols; j++)
            {
                var newTrackIdx = i * ncols + j;

                // If the newtrack overlap the old track, copy the old track
                if (i < trackNumRows && j < trackNumCols)
                {
                    var oldTrackIdx = i * trackNumCols + j;
                    newTrack[newTrackIdx] = trackGrid[oldTrackIdx];

                    if (newTrack[newTrackIdx] == TRACK_START) { isTrackStartFound = true; }
                }
                // Else initialize with road
                else
                {
                    newTrack[newTrackIdx] = TRACK_ROAD;
                }
                
                // If no TRACK_START found, will put the player start at the first
                // TRACK_ROAD found
                if (newTrack[newTrackIdx] == TRACK_ROAD && firstRoadIdx < 0) 
                {
                    firstRoadIdx = newTrackIdx;
                }

            }  // end for j
        }  // end for i

        // Make sure we keep a TRACK_START in the trackGrid - avoid weird bugs if
        // we exit the editor mode without it
        if (!isTrackStartFound) { newTrack[firstRoadIdx] = TRACK_START; }
    }
}