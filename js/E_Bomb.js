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

    this.delete = false;

	this.draw = function()
    {
        if (this.delete) return;
        colorCircle(this.x, this.y, this.size, this.color);
    }

    this.update = function()
    {
        if (this.delete) return;
        
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
            decals.add(this.x-bombCraterPic.width/2, this.y-bombCraterPic.height/2, Math.random(Math.PI*2), 0.5, bombCraterPic);
            this.delete = true;
            return;
        }

        let E_BombTrackIndex = getTrackIdxFromXY(this.x, this.y);
        
        for (var i = 0; i < allSpaceships.length ; i++)
        {
            if (allSpaceships[i].name == this.launcherName) continue;  // cannot shoot yourself with an ebomb
        
            var currentBombTarget = allSpaceships[i];

            if (currentBombTarget.checkIfHasShield())
            {
                console.log("ebomb aiming at " + currentBombTarget.name);
                
                var distToBombTarget = distanceBetweenTwoPoints(this, currentBombTarget);
                if (distToBombTarget < SHIELD_RADIUS)
                {
                    currentBombTarget.getShieldDamage();
                    this.playSounds();
                    this.markForDeletion();
                    return;
                }
            }
            else
            {
                let opponentTrackIndex = getTrackIdxFromXY(currentBombTarget.x,currentBombTarget.y);
            
                if (E_BombTrackIndex == opponentTrackIndex)
                {
                    currentBombTarget.getStunned();
                    this.playSounds();
                    this.markForDeletion();
                    this.leaveScorchMark();

                    return;
                }
            }
        }
    }

    this.markForDeletion = function()
    {
        this.delete = true;
    }

    this.playSounds = function()
    {
        this.e_Bomb_Collision_Stun_Sound = AudioMan.createSound3D(this.e_Bomb_Collision_Stun_Sound_File, this, false, 1);
        this.e_Bomb_Collision_Stun_Sound.play();
    }

    this.leaveScorchMark = function()
    {
        console.log("e_Bomb hit an opponent! leaving a scroch mark on the ground");
        decals.add(this.x-bombCraterPic.width/2, this.y-bombCraterPic.height/2,
                   Math.random(Math.PI*2), 0.5, bombCraterPic);
    }

    this.updateRowColIdx = function()
    {
        this.colIdx = Math.floor(this.x / TRACK_W);
        this.rowIdx = Math.floor(this.y / TRACK_H);
    }
}

function deleteExplodedEBombs ()
{
    for (var i = 0; i < ebombsList.length ; i++)
    {
        if (ebombsList[i].delete) ebombsList.splice(i, i+1);
    }
}