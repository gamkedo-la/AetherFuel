var ebombsList = [];

function E_Bomb(x,y, xSpeed,ySpeed, launcherName)
{        
    this.launcherName = launcherName  // name of the spaceship who launched the ebomb
    
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

    this.e_Bomb_Collision_Stun_Sound_File = "Audio/E_Bomb_Collision_Stun_2.wav";
    this.e_Bomb_Sound_Sound = null;

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

        if (this.currentTrackType == TRACK_WALL)
        {
            testE_Bomb = undefined;
            console.log("e_Bomb hit a wall! leaving a scroch mark on the ground");
            decals.add(this.x-bombCraterPic.width/2, this.y-bombCraterPic.height/2, Math.random(Math.PI*2), 0.5, bombCraterPic);
        }

        let E_BombTrackIndex = getTrackIdxFromXY(this.x, this.y);
        
        for (var i = 0; i < allSpaceships.length ; i++)
        {
            if (allSpaceships[i].name == this.launcherName) continue;  // cannot shoot yourself with an ebomb
        
            var currentBombTarget = allSpaceships[i];
            let opponentTrackIndex = getTrackIdxFromXY(currentBombTarget.x,currentBombTarget.y);
            
            if (E_BombTrackIndex == opponentTrackIndex)
            {
                currentBombTarget.getStunned();
                // currentBombTarget.stunned = true;
                // console.log("aouch, that hurts!");
                
                // setTimeout(function()
                // {
                //     console.log("feeling better!");
                //     currentBombTarget.stunned = false
                // }, 2000);

                this.e_Bomb_Collision_Stun_Sound = AudioMan.createSound3D(this.e_Bomb_Collision_Stun_Sound_File, this, false, 1);
                this.e_Bomb_Collision_Stun_Sound.play();
                
                testE_Bomb = undefined;
                console.log("e_Bomb hit an opponent! leaving a scroch mark on the ground");
                decals.add(this.x-bombCraterPic.width/2, this.y-bombCraterPic.height/2, Math.random(Math.PI*2), 0.5, bombCraterPic);

                return;
            }
        }
    }

    this.updateRowColIdx = function()
    {
        this.colIdx = Math.floor(this.x / TRACK_W);
        this.rowIdx = Math.floor(this.y / TRACK_H);
    }
}