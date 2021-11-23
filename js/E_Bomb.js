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
            console.log("e_Bomb hit a wall! leaving a scroch mark on the ground");
            tireTracks.add(this.x-bombCraterPic.width/2, this.y-bombCraterPic.height/2, Math.random(Math.PI*2), 0.5, bombCraterPic);
        }
        if (E_BombTrackIndex == opponentTrackIndex)
        {
        	opponents[0].stunned = true;
            opponents[0].pic = stunnedOpponentSpriteSheet;
        	setTimeout(function()
                {
                    opponents[0].stunned = false
                    opponents[0].pic = darkTravelerPic;
                }, 2000);
        	testE_Bomb = undefined;
            console.log("e_Bomb hit an opponent! leaving a scroch mark on the ground");
            tireTracks.add(this.x-bombCraterPic.width/2, this.y-bombCraterPic.height/2, Math.random(Math.PI*2), 0.5, bombCraterPic);
        }
         
    }

    this.updateRowColIdx = function()
    {
        this.colIdx = Math.floor(this.x / TRACK_W);
        this.rowIdx = Math.floor(this.y / TRACK_H);
    }
}