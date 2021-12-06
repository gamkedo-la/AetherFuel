var miniMapCanvas, miniMapCanvasCtx;

function MiniMap()
{
    this.scale = 0.1;

    this.margin_x = 10;
    this.margin_y = 10;

    this.x = 0;
    this.y = 0;

    this.alpha = 0.5;

    this.reset = function()
    {
        this.scale = UI_WIDTH / (trackNumCols * TRACK_W);  // so the minimap fills the whole width of the ui

        if (!miniMapCanvas)
        {
            miniMapCanvas = document.createElement("canvas");
        }
        
        miniMapCanvas.width = trackNumCols * TRACK_W;
        miniMapCanvas.height = trackNumRows * TRACK_H;
        
        miniMapCanvasCtx = miniMapCanvas.getContext("2d");
        
        miniMapCanvasCtx.fillStyle = "black";
        miniMapCanvasCtx.fillRect(0, 0, miniMapCanvas.width, miniMapCanvas.height, "black");

        for (var i = 0; i < trackNumRows ; i++)
        {
            var drawTileY = i * TRACK_H;

            for (var j = 0; j < trackNumCols; j++)
            {
                var drawTileX = j * TRACK_W;

                var trackIdx = i * trackNumCols + j;
                var tileKind = trackGrid[trackIdx];

                if (tileKind == TRACK_WALL)
                {
                    miniMapCanvasCtx.fillStyle = "grey";
                    miniMapCanvasCtx.fillRect(drawTileX, drawTileY, TRACK_W, TRACK_H);
                }
                else if (tileKind == TRACK_GOAL)
                {
                    miniMapCanvasCtx.fillStyle = "white";
                    miniMapCanvasCtx.fillRect(drawTileX, drawTileY, TRACK_W, TRACK_H);
                }
            }
        }
    }

    this.draw = function()
    {
        canvasContext.save();
        canvasContext.scale(this.scale, this.scale);

        // this.drawMap();
        canvasContext.drawImage(miniMapCanvas, 0, 0);
        this.drawOpponents();
        this.drawPlayer();
        
        canvasContext.restore();
    }

    this.drawMap = function()
    {
        colorRect(this.x, this.y, trackNumCols * TRACK_W, trackNumRows * TRACK_H, "black");

        for (var i = 0; i < trackNumRows ; i++)
        {
            var drawTileY = this.y + i * TRACK_H;

            for (var j = 0; j < trackNumCols; j++)
            {
                var drawTileX = this.x + j * TRACK_W;

                var trackIdx = i * trackNumCols + j;
                var tileKind = trackGrid[trackIdx];

                if (tileKind == TRACK_WALL)
                {
                    colorRect(drawTileX, drawTileY, TRACK_W, TRACK_H, "grey");
                }
                else if (tileKind == TRACK_GOAL)
                {
                    colorRect(drawTileX, drawTileY, TRACK_W, TRACK_H, "white");
                }
            }
        }
    }

    this.drawPlayer = function()
    {
        var playerXInMap = this.x + player.x;
        var playerYInMap = this.y + player.y;

        colorCircle(playerXInMap, playerYInMap, TRACK_W / 2, "red");
    }

    this.drawOpponents = function()
    {
        for (var i = 0; i < opponents.length; i++)
        {
            var opponentXInMap = this.x + opponents[i].x;
            var opponentYInMap = this.y + opponents[i].y;
            colorCircle(opponentXInMap, opponentYInMap, TRACK_W / 2, "green");
        }
    }
}