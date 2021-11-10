const TRACK_W = 40;
const TRACK_H = 40;
// const TRACK_COUNT = trackNumCols * trackNumRows;

const TRACK_ROAD = 0;
const TRACK_WALL = 1;
const TRACK_START = 2;
const TRACK_GOAL = 3;
const TRACK_TREE = 4;
const TRACK_FLAG = 5;

const TRACK_WAYPOINT = 9;

var trackNumRows;
var trackNumCols;

var playerStart;

var trackGrid = [];

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

function setTrackTypeAtIJ(trackI, trackJ, value)
{
    if (trackI >= 0 && trackI < trackNumRows &&
        trackJ >= 0 && trackJ < trackNumCols)
    {
        trackGrid[trackI * trackNumCols + trackJ] = value;
    }
}

// Draws all track tile from trackStartX to trackEndX and from trackStartY to trackEndY
function drawTracks(trackStartJ, trackEndJ, trackStartI, trackEndI)
{
    drawBackGround(trackStartJ, trackEndJ, trackStartI, trackEndI);

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
                canvasContext.drawImage(useImg,
                                        drawTileX,
                                        drawTileY, 
                                        useImg.width,
                                        useImg.height);
            }
            else
            {
                var useImg = playerPic
                canvasContext.globalAlpha = 0.5;
                drawBitmapCenteredWithRotation(useImg,
                                               (drawTileX + useImg.width/2),
                                               (drawTileY + useImg.height/2),
                                               -Math.PI / 2, 
                                               useImg.width,
                                               useImg.height);
                canvasContext.globalAlpha = 1.0;
            }

            drawTileX += TRACK_W;
        }
    }

    if (editorMode)
    {
        drawAllWaypoints();
    }
}

function drawBackGround(trackStartJ, trackEndJ, trackStartI, trackEndI)
{
    for (var i = trackStartI; i < trackEndI ; i++)
    {
        var drawTileY = i * TRACK_H;

        for (var j = trackStartJ; j < trackEndJ; j++)
        {
            var drawTileX = j * TRACK_W;

            var useImg = trackPix[TRACK_ROAD];

            canvasContext.drawImage(useImg, drawTileX, drawTileY, 
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