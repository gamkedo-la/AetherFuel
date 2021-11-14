const GROUND_SPEED_DECAY_MULT = 0.94;
const GAS_POWER = 1.0;
const REVERSE_POWER = 0.8;
const TURN_SPEED = 0.1;
const MIN_SPEED_TO_TURN = 0.5;

function Spaceship(name)
{
    this.name = name;

    this.x;
    this.y;
    this.rowIdx;
    this.colIdx;
    this.ang = Math.PI / 2;
    this.speed = 0;
    this.lapsPassed = 0;
    this.isLap = false;
    this.pic;
    this.startIdx = 0;

    this.engineSoundFile = "Audio/temp_engine1.ogg"
    this.engineSound = null;
}

Spaceship.prototype.reset = function(whichPic)
{
    this.pic = whichPic;

    this.ang = -Math.PI / 2;
    this.speed = 0;
    this.lapsPassed = 0;
    this.isLap = false

    let didWeFindTrackStart = false;
    for (var i = 0; i < trackNumRows ; i++)
    {
        for (var j = 0; j < trackNumCols; j++)
        {
            var trackIdx = i * trackNumCols + j;

            if (trackGrid[trackIdx] == TRACK_START)
            {
                didWeFindTrackStart = true;
                console.log(this.name + " didWeFindTrackStart: " + didWeFindTrackStart);

                trackGrid[trackIdx] = TRACK_ROAD;
                this.startIdx = trackIdx;

                this.x = j * TRACK_W + TRACK_W / 2;
                this.y = i * TRACK_H + TRACK_H / 2;
                
                break;
            }  // end if track_start found  
        }  // end for j

        if (didWeFindTrackStart){ break; }
    }  // end for i

    if (!didWeFindTrackStart)
    {
        console.log("NO START FOUND FOR " + this.name);
    }

    if (this.engineSound != null) this.engineSound.stop();
    this.engineSound = AudioMan.createSound3D(this.engineSoundFile, this, true, 0.25);
    this.engineSound.play();
}

Spaceship.prototype.updateRowColIdx = function()
{
    this.colIdx = Math.floor(this.x / TRACK_W);
    this.rowIdx = Math.floor(this.y / TRACK_H);
}

Spaceship.prototype.handleCollisionWithTracksAdvanced = function()
{
    if (getTrackIdxFromXY(this.x, this.y) < -1) { return; }

    var trackType = this.getCurrentTrackType();

    if (trackType == TRACK_WALL)
    {
        this.x -= 1.5 * this.speed * Math.cos(this.ang);
        this.y -= 1.5 * this.speed * Math.sin(this.ang);
        this.speed *= -0.5;            
    }
    else if (trackType == TRACK_GOAL)
    {
        if (!this.isLap) {
            this.lapsPassed++;
            this.isLap = true;
        }

        if (this.lapsPassed < currentLevel.laps) {
            return;
        }

        console.log(this.name + " wins!!!");

        if (currentLevelIdx == levels.length - 1)
        {
            currentLevelIdx = 0;
        }
        else
        {
            currentLevelIdx++;
        }
        
        loadLevel(currentLevelIdx);
    }
    else 
    {
        this.isLap = false;
    }
}

Spaceship.prototype.getCurrentTrackType = function()
{
    return returnTrackTypeAtIJ(this.rowIdx, this.colIdx);
}

Spaceship.prototype.draw = function()
{
    drawBitmapCenteredWithRotation(this.pic, this.x, this.y, this.ang,
                                    this.pic.width,
                                    this.pic.height);
}

function SmokeManager()
{
    let arrayOfSmokePuffs = [];

    this.createAPuffOfSmoke = function()
    {
        let puffOfSmoke = new PuffOfSmoke(player.x, player.y);
        arrayOfSmokePuffs.push(puffOfSmoke);
    }

    this.createPuffsOfSmokeOverTime = function()
    {
        setTimeout(function() 
            { 
                smokeManager.createAPuffOfSmoke(); 
                smokeManager.createPuffsOfSmokeOverTime();
            }, 50);
    }

    this.updatePuffsOfSmoke = function()
    {
        for (let i = 0; i < arrayOfSmokePuffs.length; i++)
        {
            arrayOfSmokePuffs[i].update();
        }

        this.garbageCollectPuffsOfSmoke();
    }

    this.drawPuffsOfSmoke = function()
    {
        for (let i = 0; i < arrayOfSmokePuffs.length; i++)
        {
            arrayOfSmokePuffs[i].draw();
        }
    }

    this.garbageCollectPuffsOfSmoke = function()
    {
        for (let i = 0; i < arrayOfSmokePuffs.length; i++)
        {
            if (arrayOfSmokePuffs[i].alpha < 0.05)
            {
                arrayOfSmokePuffs.splice(i,1);
            }
        }
    }
}