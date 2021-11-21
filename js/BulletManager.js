class Bullet
{
    constructor(x,y, xSpeed,ySpeed)
    {
        this.x = x;
        this.y = y;
        
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.size = 5;

        this.colIdx;
        this.rowIdx;
        this.rowColIdx;
        this.currentTrackType;
    }

    update()
    {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.updateRowColIdx();
        this.currentTrackType = returnTrackTypeAtIJ(this.rowIdx, this.colIdx);
    }

    draw()
    {
        colorRect(this.x, this.y, this.size, this.size, "black");
    }

    updateRowColIdx()
    {
        this.colIdx = Math.floor(this.x / TRACK_W);
        this.rowIdx = Math.floor(this.y / TRACK_H);
    }
}

function BulletManager()
{
    let arrayOfBullets = [];

    this.createABullet = function()
    {
        
        let xSpeed = Math.cos(player.ang) * 25;
        let ySpeed = Math.sin(player.ang) * 25;
        
        let bullet = new Bullet(player.x, player.y, xSpeed,ySpeed);
        arrayOfBullets.push(bullet);
    }

    this.updateBullets = function()
    {
        for (let i = 0; i < arrayOfBullets.length; i++)
        {
            arrayOfBullets[i].update();
        }

        this.garbageCollectBullets();
    }

    this.drawBullets = function()
    {
        
        for (let i = 0; i < arrayOfBullets.length; i++)
        {

            arrayOfBullets[i].draw();
        }
    }

    this.garbageCollectBullets = function()
    {
        for (let i = 0; i < arrayOfBullets.length; i++)
        {
            if (arrayOfBullets[i].currentTrackType == TRACK_WALL)
            {
                arrayOfBullets.splice(i,1);
            }

            let bulletTrackIndex = getTrackIdxFromXY(arrayOfBullets[i].x, arrayOfBullets[i].y);
            let opponentTrackIndex = getTrackIdxFromXY(opponents[0].x,opponents[0].y);
            if (bulletTrackIndex == opponentTrackIndex)
            {
                arrayOfBullets.splice(i,1);
            }
            // if (arrayOfBullets[i].x > opponents[0].x && arrayOfBullets[i].x < opponents[0].x + TRACK_W
            //     && arrayOfBullets[i].y < opponents[0].y && arrayOfBullets[i].y > opponents[0].y + TRACK_H)
            // {
            //     arrayOfBullets.splice(i,1);
            // }  

            console.log("opponents[0].y: " + opponents[0].y + " arrayOfBullets[0].y: " + arrayOfBullets[0].y);
            // for (let j = 0; j < opponents.length; j++)
            // {
            //     if (arrayOfBullets[i].x > opponents[j].x && arrayOfBullets[i].x < opponents[j].x + TRACK_W
            //         && arrayOfBullets[i].y > opponents[j].y && arrayOfBullets[i].y < opponents[j].y + TRACK_H)
            //     {
            //         arrayOfBullets.splice(i,1);
            //     }  
            // }//end of checking bullets colliding with opponents          
        }//end of all bullet collision checks
    }//end of 'garbage collection'
}//end of bullet manager