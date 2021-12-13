const MIN_TIME_BEFORE_TARGET_CHANGE = 300.0;  // in milliseconds
const MAX_TIME_BEFORE_TARGET_CHANGE = 1000.0;  // in milliseconds
const MIN_TIME_SINCE_LAST_BUMP_TO_WALL = 1000.0;
const TIME_FOR_RECOVERY_MODE = 500.0 // in milliseconds

function Opponent(name, pic)
{
    Spaceship.call(this, name);

    this.decalPic = neonLinePic;
    this.dualDecalDist = 20; // how far apart are the two trails?

    this.currentWaypoint = null;
    this.previousWaypoint = null;
    this.target = null;

    this.recoveryMode = false;
    this.dodgeTimer = 0.0;
    this.dodgeAngTurn = 0.0;
    this.timeSinceRecoveryMode = 0.0;

    this.timeSinceLastTargetSelection = 0.0;
	this.pic = pic;
    this.timeSinceLastBumpToWall = MIN_TIME_SINCE_LAST_BUMP_TO_WALL;

    this.maxDistToProbForWall = 3 * TRACK_W;
    this.maxAngleNumberToProbe = 10;

    // this.targetSpeed; 

    this.activateGas = function()
    {
        if (this.currentWaypoint == null) return ;
        
        if (this.recoveryMode)
        {
            this.holdGas = false;
            this.holdReverse = Math.random() < 0.5;
        }
        else
        {
            this.holdGas = Math.random() < 2;  //this.currentWaypoint.percentageGasAppliedTime;
            this.holdReverse = false;

            // check if wall is in fornt of us
            var testerPointX = this.x + Math.cos(this.ang) * this.maxDistToProbForWall;
            var testerPointY = this.y + Math.sin(this.ang) * this.maxDistToProbForWall;

            if (returnTrackTypeAtPixelXY(testerPointX, testerPointY) == TRACK_WALL)
            {
                this.holdGas = Math.random() < 0.5;
                this.dodgeTimer = 1;
                this.dodgeAngTurn = 0.1;  // to be finessed
            }
        }
    }

    this.steerWheels = function()
    {
        if (this.currentWaypoint == null) return;
        if (this.target == null) return ;

        var rightDir = {
            "x": -Math.sin(this.ang),
            "y": Math.cos(this.ang)
        };

        var distToWaypoint = distanceBetweenTwoPoints(this, this.currentWaypoint);
        var dirToWaypoint = {
            "x": (this.target.x - this.x) / distToWaypoint,
            "y": (this.target.y - this.y) / distToWaypoint,
        }

        var dotProd = rightDir.x * dirToWaypoint.x + rightDir.y * dirToWaypoint.y;
        var signum = this.recoveryMode ? -1 : 1;

        if (Math.abs(dotProd) < 0.1)
        {
            this.holdTurnRight = 0;
            this.holdTurnLeft = 0;
        }
        else if (signum * dotProd > 0)
        {
            this.holdTurnRight = 1;
            this.holdTurnLeft = 0;
        }
        else
        {
            this.holdTurnRight = 0;
            this.holdTurnLeft = 1; 
        }

        // if (this.dodgeTimer > 0.0)
        // {
        //     this.holdTurnLeft = false;
        //     this.holdTurnRight = false;

        //     this.dodgeTimer--;
        //     this.ang += Math.sign(dotProd) * this.dodgeAngTurn;
        // }
    }

    this.selectTarget = function()
    {
        var targetWaypoint = this.recoveryMode ? this.previousWaypoint : this.currentWaypoint;
        if (targetWaypoint == null) return;
        
        var randVal = Math.random();

        if (randVal < 0.25)
        {
            this.target = {
                "x": (targetWaypoint.leftX + targetWaypoint.midLeftX) / 2,
                "y": (targetWaypoint.leftY + targetWaypoint.midLeftY) / 2,
            }
        }
        else if (randVal < 0.5)
        {
            this.target = {
                "x": (targetWaypoint.midLeftX + targetWaypoint.x) / 2,
                "y": (targetWaypoint.midLeftY + targetWaypoint.y) / 2,
            }
        }
        else if (randVal < 0.75)
        {
            this.target = {
                "x": (targetWaypoint.x + targetWaypoint.midRightX) / 2,
                "y": (targetWaypoint.y + targetWaypoint.midRightY) / 2,
            }
        }
        else
        {
            this.target = {
                "x": (targetWaypoint.midRightX + targetWaypoint.rightX) / 2,
                "y": (targetWaypoint.midRightY + targetWaypoint.rightY) / 2,
            }
        }

        // Reset timeSinceLastTargetSelection
        this.timeSinceLastTargetSelection = 0.0;
    }

    this.checkIfCloseEnoughToCurrentWaypoint = function()
    {
        if (this.currentWaypoint == null) return;
        
        // Check if spaceship has crossed waypoint thickness
        var dotProd = (this.x - this.currentWaypoint.x) * Math.cos(this.currentWaypoint.angle) +
                      (this.y - this.currentWaypoint.y) * Math.sin(this.currentWaypoint.angle);

        if (dotProd > 0)
        {
            this.previousWaypoint = this.currentWaypoint;
            this.currentWaypoint = this.currentWaypoint.next == null ? firstWaypoint : this.currentWaypoint.next;
            this.selectTarget();
        }
    }

    this.updateTimeSinceLastWaypointChange = function ()
    {
        this.timeSinceLastTargetSelection += deltaTime;

        if (this.timeSinceLastTargetSelection > randomFloatFromInterval(MIN_TIME_BEFORE_TARGET_CHANGE,
                                                                        MAX_TIME_BEFORE_TARGET_CHANGE))
        {
            this.selectTarget();
        }
    }

    this.superReset = this.reset;
    this.reset = function(waypoint)
    {
        this.superReset(this.pic);
        this.currentWaypoint = waypoint;
        this.selectTarget();
    }

    this.superdraw = this.draw;
    this.draw = function()
    {
        if (debugAIMode && this.currentWaypoint != null)
        {
            lineBetweenTwoPoints(this.x, this.y, this.target.x, this.target.y, "red");
            
            for (var angleFrac = 0; angleFrac < this.maxAngleNumberToProbe; angleFrac++)
            {
                var currentAngle = angleFrac * 2 * Math.PI / this.maxAngleNumberToProbe;
                var isWallNear = this.checkIfWallInThisDirectionAtMaxProbDistAdvance(currentAngle);
                if (isWallNear) console.log("wall ahead!!");

                var testerPointX = this.x + Math.cos(currentAngle) * this.maxDistToProbForWall;
                var testerPointY = this.y + Math.sin(currentAngle) * this.maxDistToProbForWall;

                var currentColor = isWallNear ? "magenta" : "blue"; 
                lineBetweenTwoPoints(this.x, this.y, testerPointX, testerPointY, currentColor);
            }
        }

        this.superdraw();
    }

    this.superHandleCollision = this.handleCollisionWithTracksAdvanced;
    this.handleCollisionWithTracksAdvanced = function()
    {
        this.superHandleCollision();
        this.timeSinceLastBumpToWall += deltaTime;

        if (this.getCurrentTrackType() == TRACK_ROAD || this.getCurrentTrackType() == TRACK_GOAL) return;
        if (this.timeSinceLastBumpToWall < MIN_TIME_SINCE_LAST_BUMP_TO_WALL)
        {
            console.log("Recovery: I think  you should stop and focus now");
            this.recoveryMode = true;
            this.timeSinceRecoveryMode = 0.0;
        }
        this.timeSinceLastBumpToWall = 0.0;
    }

    this.handleRecoveryModeIfNecessary = function()
    {
        if (!this.recoveryMode) return;

        this.timeSinceRecoveryMode += deltaTime;
            
        if (this.timeSinceRecoveryMode > TIME_FOR_RECOVERY_MODE)
        {
            console.log("Recovery: good to go");
            this.recoveryMode = false;
            this.selectTarget();
        }
    }

    this.freeze = function()
    {
        this.speed = 0; 
        this.slideX = 0;
        this.slideY = 0;
        this.holdGas = false;
        this.holdReverse = false;
        this.holdTurnLeft = false;
        this.holdTurnRight = false;
        console.log(this.name + " freezing");
    }

    this.checkIfWallInThisDirectionAtMaxProbDist = function(angle)
    {
        var tipX = this.x + Math.cos(angle) * this.maxDistToProbForWall;
        var tipY = this.y + Math.sin(angle) * this.maxDistToProbForWall;

        return returnTrackTypeAtPixelXY(tipX, tipY) == TRACK_WALL;
    }

    this.checkIfWallInThisDirectionAtMaxProbDistAdvance = function(angle)
    {
        // Prob the grid intersection in the vertical direction
        if(this.checkForRayWallIntersectionInVerticalSweep(angle)) return true;

        // Prob the grid intersection in the horizontal direction
        return this.checkForRayWallIntersectionInHorizontalSweep(angle);
    }

    this.checkForRayWallIntersectionInVerticalSweep = function(angle)
    {
        if (Math.sin(angle) == 0) return false;
        
        var rayDir = Math.sign(Math.sin(angle)) > 0 ? 1 : -1;

        var rayIntersectY = TRACK_H * Math.floor(this.y / TRACK_H);
        if (rayDir > 0) rayIntersectY += TRACK_H;

        var rayIntersectX = this.x + Math.cos(angle) * Math.abs(this.y - rayIntersectY);
        
        var rayIntersect = {"x": rayIntersectX, "y": rayIntersectY};

        while (distanceBetweenTwoPoints(this, rayIntersect) < this.maxDistToProbForWall)
        {
            var isWallFound = returnTrackTypeAtPixelXY(rayIntersect.x, rayIntersect.y + rayDir * 0.1 * TRACK_H) == TRACK_WALL;
            if (isWallFound) return true;
            
            rayIntersect.x += Math.cos(angle) * TRACK_H;
            rayIntersect.y += rayDir * TRACK_H;
        }

        return false;
    }

    this.checkForRayWallIntersectionInHorizontalSweep = function(angle)
    {
        if (Math.cos(angle) == 0) return false;
        
        var rayDir = Math.sign(Math.cos(angle)) > 0 ? 1 : -1;

        var rayIntersectX = TRACK_W * Math.floor(this.x / TRACK_W);
        if (rayDir > 0) rayIntersectX += TRACK_W;

        var rayIntersectY = this.y + Math.sin(angle) * Math.abs(this.x - rayIntersectX);
        
        var rayIntersect = {"x": rayIntersectX, "y": rayIntersectY};

        while (distanceBetweenTwoPoints(this, rayIntersect) < this.maxDistToProbForWall)
        {
            var isWallFound = returnTrackTypeAtPixelXY(rayIntersect.x + rayDir * 0.1 * TRACK_W, rayIntersect.y) == TRACK_WALL;
            if (isWallFound) return true;
            
            rayIntersect.x += rayDir * TRACK_W;
            rayIntersect.y += Math.sin(angle) * TRACK_W;
        }

        return false;
    }

    // this.checkForRayWallIntersectionInVerticalSweep = function(angle)
    // {
    //     if (Math.sin(angle) == 0) return false;
        
    //     var rayDir = Math.sign(Math.sin(angle)) > 0 ? 1 : -1;

    //     var rayIntersectY = TRACK_H * Math.floor(this.y / TRACK_H);
    //     if (rayDir > 0) rayIntersectY += TRACK_H;

    //     var rayIntersectX = this.x + Math.cos(angle) * Math.abs(this.y - rayIntersectY);
        
    //     var rayIntersect = {"x": rayIntersectX, "y": rayIntersectY};

    //     var isWallFound = returnTrackTypeAtPixelXY(rayIntersect.x, rayIntersect.y + rayDir * 0.1 * TRACK_H);
    //     if (isWallFound) return true;

    //     while (distanceBetweenTwoPoints(this, rayIntersect) < this.maxDistToProbForWall)
    //     {
    //         rayIntersect.y += rayDir * TRACK_H;
    //         rayIntersect.x += Math.cos(angle) * TRACK_H;

    //         var isWallFound = returnTrackTypeAtPixelXY(rayIntersect.x, rayIntersect.y + rayDir * 0.1 * TRACK_H);
    //         if (isWallFound) return true;
    //     }

    //     return false;
    // }
    
    this.superMove = this.move;
    this.move = function ()
    {
        if (!debugFreezeAI)
        {
            this.activateGas();
            this.steerWheels();
        }

        this.superMove();
        this.checkIfCloseEnoughToCurrentWaypoint();
        this.updateTimeSinceLastWaypointChange();
        this.handleRecoveryModeIfNecessary();
    }
}
Object.setPrototypeOf(Opponent.prototype, Spaceship.prototype);
