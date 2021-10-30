function MiniMap()
{
    this.width = 10;
    this.height = 10;
    this.percentage = 0.1;

    this.margin_x = 10;
    this.margin_y = 10;

    this.x = 0;
    this.y = 0;

    this.alpha = 0.5;

    this.setSizes = function()
    {
        this.width = this.percentage * (trackNumCols * TRACK_W);
        this.height = this.percentage * (trackNumRows * TRACK_H);

        // this.x = canvas.width - this.width - this.margin_x;
        // this.y = canvas.height - this.height - this.margin_y;
    }

    this.draw = function()
    {
        canvasContext.globalAlpha = this.alpha;
        canvasContext.save();
        canvasContext.scale(0.5, 0.5);
        this.drawMap();
        this.drawPlayer();

        canvasContext.restore();

        canvasContext.globalAlpha = 1.0;
    }

    this.drawMap = function()
    {
        colorRect(this.x, this.y, this.width, this.height, "white");

        for (var i = 0; i < trackNumRows ; i++)
        {
            var drawTileY = this.y + i * TRACK_H * this.percentage;

            for (var j = 0; j < trackNumCols; j++)
            {
                var drawTileX = this.x + j * TRACK_W * this.percentage;

                var trackIdx = i * trackNumCols + j;
                var tileKind = trackGrid[trackIdx];
                
                if (tileKind != TRACK_ROAD){ continue; }

                colorRect(drawTileX, drawTileY, this.percentage*TRACK_W, this.percentage*TRACK_H, "black");
            }
        }
    }

    this.drawPlayer = function()
    {
        var playerXInMap = this.x + player.x * this.percentage;
        var playerYInMap = this.y + player.y * this.percentage;

        colorCircle(playerXInMap, playerYInMap, this.percentage * TRACK_W / 2, "red");
    }
}