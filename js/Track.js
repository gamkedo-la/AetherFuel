const USE_OFFSCREEN_TRACK_BUFFER = true; // optimization

const TRACK_W = 40;
const TRACK_H = 40;
const TRACK_ROAD = 0;
const TRACK_WALL = 1;
const TRACK_START = 2;
const TRACK_GOAL = 3;
const TRACK_TREE = 4;
const TRACK_FLAG = 5;
const TRACK_SAND_WITH_E_BOMB = 6;
const TRACK_WAYPOINT = 9;

var trackNumRows;
var trackNumCols;
var trackGrid = [];

// to one huge offscreen canvas ONCE 
// and reuse it to draw each frame really fast
// in one single drawImage() call vs thousands
// this also eliminates the seams between tiles on rotation
var trackCanvas = null; // a large offscreen canvas
var backGroundCanvas = null;  // a canvas for the background
var trackNeedsRefreshing = true; // set to true if you change trackGrid[] data

function getTrackIdxFromXY(xPos, yPos)
{
    var trackJ = Math.floor(xPos / TRACK_W);
    var trackI = Math.floor(yPos / TRACK_H);

    if (trackJ < 0 || trackJ >= trackNumCols ||
        trackI < 0 || trackI >= trackNumRows)
    {
        return -1;   
    }

    return  trackI * trackNumCols + trackJ;
}

function returnTrackTypeAtIJ(trackI, trackJ)
{
    if (trackI >= 0 && trackI < trackNumRows &&
        trackJ >= 0 && trackJ < trackNumCols)
    {
        return trackGrid[trackI * trackNumCols + trackJ];
    }

    return TRACK_WALL;
}

function returnTrackTypeAtPixelXY(pixelX, pixelY)
{
    var trackJ = Math.floor(pixelX / TRACK_W);
    var trackI = Math.floor(pixelY / TRACK_H);

    return returnTrackTypeAtIJ(trackI, trackJ);
}

function setTrackTypeAtIJ(trackI, trackJ, value)
{
    if (trackI >= 0 && trackI < trackNumRows &&
        trackJ >= 0 && trackJ < trackNumCols)
    {
        trackGrid[trackI * trackNumCols + trackJ] = value;
        trackNeedsRefreshing = true;
        miniMap.reset();
    }
}

function drawBackGround()
{
    if (!backGroundCanvas)
    {
        backGroundCanvas = document.createElement("canvas");
        backGroundCanvas.width = canvas.width;
        backGroundCanvas.height = canvas.height;
        console.log("created track canvas sized "+backGroundCanvas.width+"x"+backGroundCanvas.height);
    }

    var useImg = currentLevelIdx == 1 ? roadPix[LEVEL_ICE] : roadPix[LEVEL_SAND];
    backGroundCanvasCtx = backGroundCanvas.getContext("2d");
    
    for (var i = 0; i < trackNumRows ; i++)
    {
        var drawTileY = i * TRACK_H;

        for (var j = 0; j < trackNumCols; j++)
        {
            var drawTileX = j * TRACK_W;

            backGroundCanvasCtx.drawImage(useImg, drawTileX, drawTileY, 
                                 useImg.width,
                                 useImg.height);
        }
    }
}

// Draws all track tile from trackStartX to trackEndX and from trackStartY to trackEndY
function drawTracks(trackStartJ, trackEndJ, trackStartI, trackEndI)
{
    var drawOnThis = canvasContext; // default slow rendering

    if (USE_OFFSCREEN_TRACK_BUFFER) {
        
        if (!trackCanvas) { // first time only
            trackCanvas = document.createElement("canvas");
            trackCanvas.width = TRACK_W * trackNumCols;
            trackCanvas.height = TRACK_H * trackNumRows;
            console.log("created track canvas sized "+trackCanvas.width+"x"+trackCanvas.height);
        }

        //FIXME? ensure we draw the ENTIRE track
        //trackStartI = 0;
        //trackEndI = TRACK_H;
        //trackStartJ = 0;
        //trackEndJ = TRACK_W;

        // we draw the entire map once to an offscreen buffer
        // and reuse it on subsequent frames
        drawOnThis = trackCanvas.getContext("2d");
        // may have changed sizes - fixme: is this slow to run every frame? probably
        if (trackNeedsRefreshing) {
            trackCanvas.width = TRACK_W * trackNumCols;
            trackCanvas.height = TRACK_H * trackNumRows;
            drawOnThis.fillStyle = "orange"; // bright bg just for debug
            drawOnThis.fillRect(0,0,trackCanvas.width,trackCanvas.height);
            drawOnThis.fillStyle = "white";
            drawOnThis.globalAlpha = 1;
            console.log("pre-rendering "+trackEndI+"x"+trackEndJ+"x2="+(trackEndI*trackEndJ*2)+" track tiles!");
        }
    }

    if (!USE_OFFSCREEN_TRACK_BUFFER || 
        (USE_OFFSCREEN_TRACK_BUFFER && trackNeedsRefreshing)) {
        
        drawBackGroundCTX(drawOnThis, trackStartJ, trackEndJ, trackStartI, trackEndI);

        for (var i = trackStartI; i < trackEndI ; i++)
        {
            var drawTileY = i * TRACK_H;

            for (var j = trackStartJ; j < trackEndJ; j++)
            {
                var drawTileX = j * TRACK_W;

                var trackIdx = i * trackNumCols + j;
                
                var tileKind = trackGrid[trackIdx];

                if (tileKind == TRACK_ROAD){ continue; }

                if (tileKind != TRACK_START)
                {
                    var useImg = trackPix[tileKind];
                    drawOnThis.drawImage(useImg,
                                            drawTileX,
                                            drawTileY, 
                                            useImg.width,
                                            useImg.height);
                }
                else
                {
                    var useImg = playerPic;
                    drawOnThis.globalAlpha = 0.5;
                    drawBitmapCenteredWithRotationCTX(drawOnThis,
                                                useImg,
                                                (drawTileX + useImg.width/2),
                                                (drawTileY + useImg.height/2),
                                                -Math.PI / 2, 
                                                useImg.width,
                                                useImg.height);
                    drawOnThis.globalAlpha = 1.0;
                }

                drawTileX += TRACK_W;
            }
        }
    
        trackNeedsRefreshing = false; // never redraw the tiles again
    
    } // end if we needed to redraw map

    if (USE_OFFSCREEN_TRACK_BUFFER) {
        // draw the entire map really fast
        canvasContext.drawImage(trackCanvas,0,0);
    }

    // not cached - might render a bit slow but that's fine
    if (editorMode || debugAIMode)
    {
        drawAllWaypoints();
    }
}

function drawBackGroundCTX(drawOnThis, trackStartJ, trackEndJ, trackStartI, trackEndI)
{
    for (var i = trackStartI; i < trackEndI ; i++)
    {
        var drawTileY = i * TRACK_H;

        for (var j = trackStartJ; j < trackEndJ; j++)
        {
            var drawTileX = j * TRACK_W;

            var useImg = currentLevelIdx == 1 ? roadPix[LEVEL_ICE] : roadPix[LEVEL_SAND];

            drawOnThis.drawImage(useImg, drawTileX, drawTileY, 
                                    useImg.width,
                                    useImg.height);
            drawTileX += TRACK_W;
        }
    }
}


// function highlightTileIfEditorMode(trackIdx, drawTileX, drawTileY)
// {
//     if (!editorMode){ return; }

//     if (trackIdx == mouseIdx)
//     {
//         colorRect(drawTileX, drawTileY,
//                   TRACK_W - 1, TRACK_H - 1,
//                   "red");
//     }
// }                 