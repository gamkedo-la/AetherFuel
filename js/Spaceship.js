const GROUND_SPEED_DECAY_MULT = 0.94;
const GAS_POWER = 1.0;
const REVERSE_POWER = 0.8;
const TURN_SPEED = 0.1;
const MIN_SPEED_TO_TURN = 0.5;
const COLLISION_WITH_SPACESHIP_STRENGTH = 2;
const SLIDE_DECAY = 0.1;

const MIN_DIST_BETWEEN_SPACESHIPS = 30;

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

    this.slideX = 0;
    this.slideY = 0;

    this.currentWeaponState = 'none';
    this.stunned = false;
    this.currentStunnedSheetIndex = 0;
    this.stunnedSheetIndexWidth = 40;
    this.stunnedSheetIndexHeight = 40;
    this.minStunnedSheetIndex = 0;
    this.maxStunnedSheetIndex = 2;
    this.stunnedSheetDirection = 1;

    this.currentTrackType = undefined;

    this.engineSoundFile = "Audio/temp_engine1.ogg"
    this.engineSound = null;

    this.e_Bomb_Fire_SoundFile = "Audio/E_Bomb_Fire.wav";

    this.pickupSoundFile = "Audio/Pickup.wav";

    this.decalPic = tireTrackPic;
    this.dualDecalDist = 0; // 0=draw ONE line, else draw two lines offset this many px
}

Spaceship.prototype.getCurrentTrackType = function()
{
    this.currentTrackType = returnTrackTypeAtIJ(this.colIdx, this.rowIdx);
}

Spaceship.prototype.move = function()
{
    if (this.stunned)
    {       
        return;
    }
    
    // Slide decay every frame (minimum value is 0) 
    this.slideX = Math.sign(this.slideX) * clipBetween(Math.abs(this.slideX) - SLIDE_DECAY, 0, Math.abs(this.slideX));
    this.slideY = Math.sign(this.slideY) * clipBetween(Math.abs(this.slideY) - SLIDE_DECAY, 0, Math.abs(this.slideY));
    
    this.speed *= GROUND_SPEED_DECAY_MULT;

    if (this.holdGas) 
    {
        this.speed += GAS_POWER;
    }
    if (this.holdReverse)
    {
        this.speed -= REVERSE_POWER;
    }
    if (this.fire)
    {
        //console.log("anything");
        this.launchAttack();
    }

    if (this.engineSound != null) this.engineSound.rate = lerp(0.75, 2, Math.abs(this.speed/16));

    if (Math.abs(this.speed) > MIN_SPEED_TO_TURN)
    {   
        if (this.holdTurnLeft)
        {
            this.ang -= TURN_SPEED;
        }
        if (this.holdTurnRight)
        {
            this.ang += TURN_SPEED;
        }   
    }

    this.x += this.speed * Math.cos(this.ang) + this.slideX;
    this.y += this.speed * Math.sin(this.ang) + this.slideY;

    this.updateRowColIdx();
    this.currentTrackType = returnTrackTypeAtIJ(this.rowIdx,this.colIdx);

    if (this.currentTrackType == TRACK_SAND_WITH_E_BOMB)
    {
        let currentTrackIndex = getTrackIdxFromXY(this.x, this.y);
        this.currentWeaponState = "E_Bomb";
        AudioMan.createSound3D(this.pickupSoundFile, {x: this.x, y: this.y}, false, 0.75).play();
        trackGrid[currentTrackIndex] = TRACK_ROAD;
    }

    this.handleCollisionWithTracksAdvanced();
    this.checkIfCollidingWithOtherSpaceships();

    if (decals)
    {
        // FIXME track alpha could check accel/turn state for skids
        let tireTrackAlpha = 0.1;  // barely visible
        if (this.dualDecalDist) { 
            let leftx = this.dualDecalDist * Math.cos(this.ang - Math.PI/2);
            let lefty = this.dualDecalDist * Math.sin(this.ang - Math.PI/2);
            let rightx = this.dualDecalDist * Math.cos(this.ang + Math.PI/2);
            let righty = this.dualDecalDist * Math.sin(this.ang + Math.PI/2);
            decals.add(this.x+leftx, this.y+lefty, this.ang, tireTrackAlpha, this.decalPic);
            decals.add(this.x+rightx, this.y+righty, this.ang, tireTrackAlpha, this.decalPic);
        } else { // one centered line
            decals.add(this.x, this.y, this.ang, tireTrackAlpha, this.decalPic);
        }
    }
}

Spaceship.prototype.launchAttack = function()
{
    switch(this.currentWeaponState) 
    {
        case 'Bullet':
            bulletManager.createABullet();
            break;
        case 'E_Bomb':
            if (testE_Bomb)
            {
                return;
            }
            let xSpeed = Math.cos(player.ang) * 15;
            let ySpeed = Math.sin(player.ang) * 15;
            testE_Bomb = new E_Bomb(player.x,player.y, xSpeed,ySpeed);
            AudioMan.createSound3D(this.e_Bomb_Fire_SoundFile, testE_Bomb, false, 0.75).play();
            break;
        case 'none':
            return;
    }   
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
    this.engineSound = AudioMan.createSound3D(this.engineSoundFile, this, true, 0.75);
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
        this.x -= 1.5 * (this.speed * Math.cos(this.ang) + this.slideX);
        this.y -= 1.5 * (this.speed * Math.sin(this.ang) + this.slideY);
        this.speed *= -0.5;            
        this.slideX = 0;
        this.slideY = 0;
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
    if (this.stunned)
    {
        drawBitmapFromSpriteSheetCenteredWithRotation(this.pic, this.currentStunnedSheetIndex,
            this.stunnedSheetIndexWidth,this.stunnedSheetIndexHeight, this.x,this.y, this.ang, 
            this.stunnedSheetIndexWidth,this.stunnedSheetIndexHeight);
        
        this.currentStunnedSheetIndex += this.stunnedSheetDirection;
        if (this.currentStunnedSheetIndex == this.minStunnedSheetIndex || this.currentStunnedSheetIndex == this.maxStunnedSheetIndex)
        {
            this.stunnedSheetDirection *= -1;
        }
    }
    else
    {
        drawBitmapCenteredWithRotation(this.pic, this.x, this.y, this.ang,
                                       this.pic.width,
                                       this.pic.height);
    }
}

Spaceship.prototype.handleCollisionWithOtherSpaceship = function(otherSpaceship)
{
    if (otherSpaceship.name == this.name) return;
    if (distanceBetweenTwoPoints(this, otherSpaceship) >= MIN_DIST_BETWEEN_SPACESHIPS) return;

    this.x -= 1.1 * this.speed * Math.cos(this.ang);
    this.y -= 1.1 * this.speed * Math.sin(this.ang);

    // Push the other ship
    otherSpaceship.slideX += COLLISION_WITH_SPACESHIP_STRENGTH * Math.cos(this.ang);
    otherSpaceship.slideY += COLLISION_WITH_SPACESHIP_STRENGTH * Math.sin(this.ang);
}

Spaceship.prototype.checkIfCollidingWithOtherSpaceships = function()
{
    for (var i = 0; i < allSpaceships.length; i++)
    {
        this.handleCollisionWithOtherSpaceship(allSpaceships[i]);
    }
}

function checkIfAllSpaceshipNamesAreUnique()
{
    var listOfNames = [allSpaceships[0].name];  // initialize the list of names
    var idx = 1;

    for(var i = 1; i < allSpaceships.length; i++)
    {
        var spaceship = allSpaceships[i];
        var spaceshipName = spaceship.name;
        
        for(var j = 0; j < i; j++)
        {
            var existingName = listOfNames[j];
            if (existingName != spaceshipName) continue;

            spaceship.name= spaceshipName + "_" + idx;
            idx++;
        }
    }
}