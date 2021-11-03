function Level(numRows, numCols)
{
    this.numRows = numRows;
    this.numCols = numCols;
    this.playerStart = 0;

    this.track = [];
}

// Locates the player start tile index
Level.prototype.getPlayerStart = function()
{
    for(var idx=0; idx < this.numRows * this.numCols ; idx++)
    {
        if(this.track[idx] == TRACK_START)
        {
            this.playerStart = idx;
            return;
        }
    }

    console.log("NO PLAYER START WAS FOUND!!!");
}