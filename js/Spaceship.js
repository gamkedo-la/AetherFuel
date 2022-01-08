const WALL_COLLISIONS_LEAVE_DECALS = true;
const SHIP_WALL_COLLISION_CIRCLES = true;
const GROUND_SPEED_DECAY_MULT = 0.94;
const GAS_POWER = 1.0;
const REVERSE_POWER = 0.8;
const TURN_SPEED = 0.1;
const MIN_SPEED_TO_TURN = 0.5;
const COLLISION_WITH_SPACESHIP_STRENGTH = 5;
const SLIDE_DECAY = 0.1;

const MIN_DIST_BETWEEN_SPACESHIPS = 30;

const EBOMB_SPEED = 10;

const MAX_NUM_AMMO = 5;
const MAX_SHIELD_LEVEL = 3;

const SHIELD_RADIUS = 2/3 * 40;

var maxLapsPassedByASpaceship = 0;

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
    this.hasReachedHalfTrack = false;
    this.pic;
    this.startIdx = 0;

    this.slideX = 0;
    this.slideY = 0;

    this.currentWeaponState = 'E_Bomb';
    this.stunned = false;
    this.currentStunnedSheetIndex = 0;
    this.stunnedSheetIndexWidth = 40;
    this.stunnedSheetIndexHeight = 40;
    this.minStunnedSheetIndex = 0;
    this.maxStunnedSheetIndex = 2;
    this.stunnedSheetDirection = 1;
    this.stunnedPic = stunnedOpponentSpriteSheet;

    this.fire = false;
    this.numAmmo = 5;

    this.shieldLevel = MAX_SHIELD_LEVEL;

    this.currentTrackType = undefined;

    this.engineSoundFile = "Audio/temp_engine1.ogg"
    this.engineSound = null;

    this.e_Bomb_Fire_SoundFile = "Audio/E_Bomb_Fire.wav";

    this.pickupSoundFile = "Audio/Pickup.wav";

    this.decalPic = tireTrackPic;
    this.dualDecalDist = 0; // 0=draw ONE line, else draw two lines offset this many px

    this.waypointForPosition = null;
    this.distToWaypointForPosition = 100;
}

Spaceship.prototype.update = function()
{
    this.move();
}

Spaceship.prototype.move = function()
{
    if (!this.stunned)
    {
        this.handlesSpeed();
        this.handlesTurns();
    }

    this.decreaseSlidingDueToFriction();
    this.updatePosition();
    this.getWaypointForPosition();
    this.checkIfCloseEnoughToHalfWaypoint();
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
        }
        // removed this else because it looks even cooler with both! =)
        // else { // one centered line of tire tracks
        //    decals.add(this.x, this.y, this.ang, tireTrackAlpha, this.decalPic);
        //}
        
        // FIXME: this adds tire tracks to EVERY vehicle
        // to go back to either/or, uncomment the above and remove the below
        decals.add(this.x, this.y, this.ang, tireTrackAlpha, tireTrackPic);
    }
}

Spaceship.prototype.handlesSpeed = function()
{
    this.speed *= GROUND_SPEED_DECAY_MULT;

    if (this.holdGas) 
    {
        this.speed += GAS_POWER;
    }
    if (this.holdReverse)
    {
        this.speed -= REVERSE_POWER;
    }

    // Engine audio
    if (this.engineSound != null) this.engineSound.rate = lerp(0.75, 2, Math.abs(this.speed/16));
}

Spaceship.prototype.handlesTurns = function()
{
    if (Math.abs(this.speed) <= MIN_SPEED_TO_TURN) return;

    if (this.holdTurnLeft)
    {
        this.ang -= TURN_SPEED;
    }
    if (this.holdTurnRight)
    {
        this.ang += TURN_SPEED;
    }   
}

Spaceship.prototype.decreaseSlidingDueToFriction = function()
{
    // Slide decay every frame (minimum value is 0) 
    this.slideX = Math.sign(this.slideX) * clipBetween(Math.abs(this.slideX) - SLIDE_DECAY, 0, Math.abs(this.slideX));
    this.slideY = Math.sign(this.slideY) * clipBetween(Math.abs(this.slideY) - SLIDE_DECAY, 0, Math.abs(this.slideY));
}

Spaceship.prototype.updatePosition = function()
{
    this.x += this.speed * Math.cos(this.ang) + this.slideX;
    this.y += this.speed * Math.sin(this.ang) + this.slideY;

    this.updateRowColIdx();
    this.currentTrackType = returnTrackTypeAtIJ(this.rowIdx,this.colIdx);
}

Spaceship.prototype.getCurrentTrackType = function()
{
    this.currentTrackType = returnTrackTypeAtIJ(this.colIdx, this.rowIdx);
}

Spaceship.prototype.getWaypointForPosition = function()
{
    if (this.waypointForPosition == null) return;
        
    // Check if spaceship has crossed waypoint thickness
    var dotProd = (this.x - this.waypointForPosition.x) * Math.cos(this.waypointForPosition.angle) +
                  (this.y - this.waypointForPosition.y) * Math.sin(this.waypointForPosition.angle);

    if (dotProd > 0)
    {
        this.waypointForPosition = this.waypointForPosition.next == null ? firstWaypoint : this.waypointForPosition.next;
    }

    // Update distance to waypoint for position
    this.distToWaypointForPosition = distanceBetweenPointAndSegment(
        this, 
        {"x": this.waypointForPosition.leftX, "y": this.waypointForPosition.leftY},
        {"x": this.waypointForPosition.rightX, "y": this.waypointForPosition.rightY});
}

Spaceship.prototype.launchAttack = function()
{
    if (this.fire) return;
    if (this.stunned) return;
    if (this.numAmmo <= 0) return;

    this.fire = true;

    if (VERBOSE) console.log(this.name + " is shooting!!");
    
    switch(this.currentWeaponState) 
    {
        case 'Bullet':
            bulletManager.createABullet();
            break;
        case 'E_Bomb':
            let xSpeed = Math.cos(this.ang) * (EBOMB_SPEED + this.speed);
            let ySpeed = Math.sin(this.ang) * (EBOMB_SPEED + this.speed);

            var ebombInstance = new E_Bomb(this.x,this.y, xSpeed,ySpeed, this.name)
            ebombsList.push(ebombInstance)
            AudioMan.createSound3D(this.e_Bomb_Fire_SoundFile, ebombInstance, false, 0.75).play();

            this.numAmmo--;

            break;
        case 'none':
            return;
    }   
}

Spaceship.prototype.stopAttack = function()
{
    if (!this.fire) return;
    this.fire = false;
}

Spaceship.prototype.reloadWeapon = function()
{
    this.numAmmo = MAX_NUM_AMMO;
}

Spaceship.prototype.reset = function(whichPic)
{
    this.pic = whichPic;

    this.ang = -Math.PI / 2;
    this.speed = 0;
    this.lapsPassed = 0;
    this.isLap = false
    this.slideX = 0;
    this.slideY = 0;
    this.fire = false;

    this.numAmmo = 2;
    this.shieldLevel = MAX_SHIELD_LEVEL;

    this.waypointForPosition = firstWaypoint;

    let didWeFindTrackStart = false;
    for (var i = 0; i < trackNumRows ; i++)
    {
        for (var j = 0; j < trackNumCols; j++)
        {
            var trackIdx = i * trackNumCols + j;

            if (trackGrid[trackIdx] == TRACK_START)
            {
                didWeFindTrackStart = true;
                if (VERBOSE) console.log(this.name + " didWeFindTrackStart: " + didWeFindTrackStart);

                setTrackTypeAtIJ(i, j, TRACK_ROAD);
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
        if (VERBOSE) console.log("NO START FOUND FOR " + this.name);
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
    let currentTrackIndex = getTrackIdxFromXY(this.x, this.y);
    if (currentTrackIndex < -1) { return; }

    if (this.currentTrackType == TRACK_WALL || this.currentTrackType == TRACK_TREE)
    {
        if (SHIP_WALL_COLLISION_CIRCLES) {
            var trackX = TRACK_W * (currentTrackIndex % trackNumCols) + TRACK_W / 2;
            var trackY = TRACK_H * Math.floor(currentTrackIndex / trackNumCols) + TRACK_H / 2;
    
            if (((trackX - this.x) * (trackX - this.x)) + ((trackY - this.y) * (trackY - this.y)) < TRACK_W * TRACK_W / 4) {
                if (WALL_COLLISIONS_LEAVE_DECALS) {
                    if (VERBOSE) console.log("colliding with a wall! that left a mark!");
                    decals.add(this.x-16,this.y-16,this.ang,0.5,bombCraterPic);
                }
                this.x -= 1.5 * (this.speed * Math.cos(this.ang) + this.slideX);
                this.y -= 1.5 * (this.speed * Math.sin(this.ang) + this.slideY);
                this.speed *= -0.5;            
                this.slideX = 0;
                this.slideY = 0;
            }
        }
        else {
            if (WALL_COLLISIONS_LEAVE_DECALS) {
                if (VERBOSE) console.log("colliding with a wall! that left a mark!");
                decals.add(this.x-16,this.y-16,this.ang,0.5,bombCraterPic);
            }
            this.x -= 1.5 * (this.speed * Math.cos(this.ang) + this.slideX);
            this.y -= 1.5 * (this.speed * Math.sin(this.ang) + this.slideY);
            this.speed *= -0.5;            
            this.slideX = 0;
            this.slideY = 0;
        }
    }
    else if (this.currentTrackType == TRACK_SAND_WITH_E_BOMB)
    {
        // let currentTrackIndex = getTrackIdxFromXY(this.x, this.y);
        this.currentWeaponState = "E_Bomb";
        AudioMan.createSound3D(this.pickupSoundFile, {x: this.x, y: this.y}, false, 0.75).play();
        trackGrid[currentTrackIndex] = TRACK_ROAD;
        trackNeedsRefreshing = true;
    }
    else if (this.currentTrackType == TRACK_GOAL && this.hasReachedHalfTrack)
    {
        if (!this.isLap) {
            this.lapsPassed++;

            if (maxLapsPassedByASpaceship < this.lapsPassed)
            {
                maxLapsPassedByASpaceship = this.lapsPassed;
            }

            this.isLap = true;
            this.hasReachedHalfTrack = false;
            this.reloadWeapon();
        }

        if (this.lapsPassed < currentLevel.laps) {
            return;
        }

        if (VERBOSE) console.log(this.name + " wins!!!");

        if (currentLevelIdx == levels.length - 1)
        {
            currentLevelIdx = 0;
        }
        else
        {
            currentLevelIdx++;
        }
        
        transitionToLevel(currentLevelIdx);
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
        drawBitmapFromSpriteSheetCenteredWithRotation(this.stunnedPic, this.currentStunnedSheetIndex,
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

        if (this.checkIfHasShield())
        {
            colorCircleOutline(this.x, this.y, SHIELD_RADIUS, "red");
        }
    }
}

Spaceship.prototype.handleCollisionWithOtherSpaceship = function(otherSpaceship)
{
    if (otherSpaceship.name == this.name) return;
    if (distanceBetweenTwoPoints(this, otherSpaceship) >= MIN_DIST_BETWEEN_SPACESHIPS) return;

    var dx = this.x - otherSpaceship.x;
    var dy = this.y - otherSpaceship.y;

    var pushAng = Math.atan2(-dy, -dx);

    this.x -= 1.1 * this.speed * Math.cos(this.ang);
    this.y -= 1.1 * this.speed * Math.sin(this.ang);

    // Push the other ship
    otherSpaceship.slideX += COLLISION_WITH_SPACESHIP_STRENGTH * Math.cos(pushAng);
    otherSpaceship.slideY += COLLISION_WITH_SPACESHIP_STRENGTH * Math.sin(pushAng);
}

Spaceship.prototype.checkIfCollidingWithOtherSpaceships = function()
{
    for (var i = 0; i < allSpaceships.length; i++)
    {
        this.handleCollisionWithOtherSpaceship(allSpaceships[i]);
    }
}

Spaceship.prototype.getStunned = function()
{
    this.stunned = true;
    this.speed = 0;

    setTimeout(function(spaceship)
    {
        spaceship.stunned = false;
    }, 2000, this);
}

Spaceship.prototype.getShieldDamage = function()
{
    if (this.shieldLevel <= 0) return;
    this.shieldLevel--;
}

Spaceship.prototype.checkIfCloseEnoughToHalfWaypoint = function()
{
    if (halfWaypoint == null) return;
    
    // Check if spaceship has crossed waypoint thickness
    var dotProd = (this.x - halfWaypoint.x) * Math.cos(halfWaypoint.angle) +
                  (this.y - halfWaypoint.y) * Math.sin(halfWaypoint.angle);

    var distToTarget = distanceBetweenTwoPoints(this, halfWaypoint);

    if (dotProd > 0 && distToTarget < 4 * TRACK_H)
    {
        this.hasReachedHalfTrack = true;
    }
}

Spaceship.prototype.checkIfHasShield = function()
{
    return this.shieldLevel > 0;
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

function getPlayerPosition()
{
    var playerPosition = 1;  // player start as being the leader
    var opponentsOnTheSameLapAsPlayer = [];

    // Check if player is leading in terms of laps passed
    for (var i = 0 ; i < opponents.length ; i++)
    {
        var currentOpponent = opponents[i];

        // If opponent has passed more laps, player loses a position
        if (currentOpponent.lapsPassed > player.lapsPassed)
        {
            playerPosition++;
        }
        // If they are on the same lap we will need to compare their target waypoints
        else if (currentOpponent.lapsPassed == player.lapsPassed)
        {
            opponentsOnTheSameLapAsPlayer.push(currentOpponent);
        }
    }

    // If no opponent is on the same lap, then player position has been found
    if (opponentsOnTheSameLapAsPlayer.length == 0)
    {
        return playerPosition;
    }

    // Check which spaceships has the furthest waypoint
    var tempWaypoint = firstWaypoint;
    var opponentsWaypointFound = 0;

    // Loop through all the waypoints
    while (tempWaypoint != null)
    {
        // Is this the waypoint the player is currently aiming at?
        var isPlayerAtThisWaypoint = player.waypointForPosition == tempWaypoint;

        for (var i = 0; i < opponentsOnTheSameLapAsPlayer.length ; i++)
        {
            // Is the opponent aiming at this waypoint
            var currentOpponent = opponentsOnTheSameLapAsPlayer[i];
            var isOpponentAtThisWaypoint = currentOpponent.waypointForPosition == tempWaypoint;

            // if the opponent is a this waypoint
            if (isOpponentAtThisWaypoint)
            {
                opponentsWaypointFound++; // we found a waypoint corresponding to an opponent

                // If the player and the opponent are at the same waypoint
                if (isPlayerAtThisWaypoint)
                {
                    // the player loses a position if the opponent is closer to it
                    if (player.distToWaypointForPosition > currentOpponent.distToWaypointForPosition)
                    {
                        playerPosition++;
                    }  // end if (player.distToWaypointForPosition > ...)
                }  // end if (isPlayerAtThisWaypoint)
            }  // end if (isOpponentAtThisWaypoint)
        }  // end for (opponentsOnTheSameLapAsPlayer)

        // If we found the waypoint corresponding to the player
        if (isPlayerAtThisWaypoint)
        {
            // If opponents are on the same lap and have not been found, this means they are in front of the player
            playerPosition += opponentsOnTheSameLapAsPlayer.length - opponentsWaypointFound;

            // No need to find the exact position of the other opponents
            break;
        }

        tempWaypoint = tempWaypoint.next;
    } // end while (tempWaypoint)

    return playerPosition;
}