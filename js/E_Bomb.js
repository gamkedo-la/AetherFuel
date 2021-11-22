function E_Bomb(x,y, xSpeed,ySpeed)
{        
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;

	this.x = x;
	this.y = y;

	this.colIdx = Math.floor(this.x / TRACK_W);
    this.rowIdx = Math.floor(this.y / TRACK_H);

	this.hue = 240;
	this.saturation = 50;
	this.lightness = 50;
	this.color = 'hsl(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%)';

	this.size = 8;	

	this.draw = function()
    {    
        colorCircle(this.x, this.y, this.size, this.color);
    }

    this.update = function()
    {
    	this.lightness += 4;
    	if (this.lightness > 100)
    	{
    		this.lightness = 50;
    	}
    	this.color = 'hsl(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%)';

        this.x += this.xSpeed;
        this.y += this.ySpeed;

        this.updateRowColIdx();
        this.currentTrackType = returnTrackTypeAtIJ(this.rowIdx, this.colIdx);

        let E_BombTrackIndex = getTrackIdxFromXY(this.x, this.y);
        let opponentTrackIndex = getTrackIdxFromXY(opponents[0].x,opponents[0].y);
        if (this.currentTrackType == TRACK_WALL)
        {
            testE_Bomb = undefined;
        }
        if (E_BombTrackIndex == opponentTrackIndex)
        {
        	opponents[0].stunned = true;
        	setTimeout(function(){opponents[0].stunned = false}, 2000);
        	testE_Bomb = undefined;
        }
         
    }

    this.updateRowColIdx = function()
    {
        this.colIdx = Math.floor(this.x / TRACK_W);
        this.rowIdx = Math.floor(this.y / TRACK_H);
    }
}