const DEBUG_AI = false; // if true we get console logs every frame
const MIN_TIME_BEFORE_TARGET_CHANGE = 300.0;  // in milliseconds
const MAX_TIME_BEFORE_TARGET_CHANGE = 1000.0;  // in milliseconds
const MIN_TIME_SINCE_LAST_BUMP_TO_WALL = 1000.0;
const TIME_FOR_RECOVERY_MODE = 2000.0 // in milliseconds
const TIME_FOR_BACKWARD_RECOVERY_MODE = 1000.0  // in milliseconds

const MIN_TIME_BEFORE_SELECTING_TARGET_IN_RECOVERY = 200.0;  // in milliseconds
const MAX_TIME_BEFORE_SELECTING_TARGET_IN_RECOVERY = 800.0;  // in milliseconds

function Opponent(name, pic)
{
    Spaceship.call(this, name);

    this.decalPic = neonLinePic;
    this.dualDecalDist = 20; // how far apart are the two trails?

    this.currentWaypoint = null;
    this.previousWaypoint = null;
    this.target = null;

    this.recoveryMode = false;
    this.timeSinceRecoveryMode = 0.0;

    this.dodgeTimer = 0.0;
    this.dodgeAngTurn = 0.0;

    this.timeSinceLastTargetSelection = 0.0;
	this.pic = pic;
    this.timeSinceLastBumpToWall = MIN_TIME_SINCE_LAST_BUMP_TO_WALL;

    this.maxDistToProbForWall = 3 * TRACK_W;
    this.maxAngleNumberToProbe = 32;

    // this.targetSpeed; 

    this.activateGas = function()
    {
        if (this.currentWaypoint == null) return ;
        
        if (this.recoveryMode && this.timeSinceRecoveryMode < TIME_FOR_BACKWARD_RECOVERY_MODE)
        {
            this.holdGas = false;
            this.holdReverse = Math.random() < 0.5;
        }
        else
        {
            this.holdGas = Math.random() < 2;  //this.currentWaypoint.percentageGasAppliedTime;
            this.holdReverse = false;

            // var testerPointX = this.x + Math.cos(this.ang) * this.maxDistToProbForWall;
            // var testerPointY = this.y + Math.sin(this.ang) * this.maxDistToProbForWall;

            // if (returnTrackTypeAtPixelXY(testerPointX, testerPointY) == TRACK_WALL)
            // {
            //     this.holdGas = Math.random() < 0.5;
            //     if (this.dodgeTimer <= 0)
            //     {
            //         this.dodgeTimer = 5;
            //         this.dodgeAngTurn = 0.1;  // to be finessed
            //     }
            // }
        }
    }

    this.steerWheels = function()
    {
        if (this.currentWaypoint == null) return;
        if (this.target == null) return ;
        if (this.recoveryBackwardTime > 0) return;

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
        var signum = 1;
        // var signum = this.recoveryMode ? -1 : 1;

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

        if (this.dodgeTimer > 0.0)
        {
            this.holdTurnLeft = false;
            this.holdTurnRight = false;

            this.dodgeTimer--;
            this.ang += Math.sign(dotProd) * this.dodgeAngTurn;
        }
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

        var distToTarget = this.target != null ? distanceBetweenTwoPoints(this, this.target) : TRACK_H * 3;

        if (dotProd > 0 || distToTarget < 2 * TRACK_H )
        {
            this.previousWaypoint = this.currentWaypoint;
            this.currentWaypoint = this.currentWaypoint.next == null ? firstWaypoint : this.currentWaypoint.next;
            this.selectTarget();
        }
    }

    this.updateTimeSinceLastWaypointChange = function ()
    {
        if (this.recoveryMode) return;

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
            if (this.recoveryMode)
            {
                for (var angleFrac = 0; angleFrac < this.maxAngleNumberToProbe; angleFrac++)
                {
                    var currentAngle = this.ang + angleFrac * Math.PI / (2 * this.maxAngleNumberToProbe) -  Math.PI / 4;

                    var isWallNear = this.checkIfWallInThisDirectionAtMaxProbDistAdvance(currentAngle);

                    var testerPointX = this.x + Math.cos(currentAngle) * this.maxDistToProbForWall;
                    var testerPointY = this.y + Math.sin(currentAngle) * this.maxDistToProbForWall;

                    var currentColor = isWallNear ? "magenta" : "blue"; 
                    lineBetweenTwoPoints(this.x, this.y, testerPointX, testerPointY, currentColor);
                }   
            }

            if (this.target != null){
                lineBetweenTwoPoints(this.x, this.y, this.target.x, this.target.y, "red");
                colorCircle(this.target.x, this.target.y, TRACK_H / 4, "magenta");
            }

            var modeColor = this.recoveryMode ? "red" : "green";
            colorCircle(this.x + TRACK_W * Math.cos(this.ang), this.y + TRACK_H * Math.sin(this.ang), TRACK_H / 3, modeColor);
        }

        this.superdraw();
    }

    this.superHandleCollision = this.handleCollisionWithTracksAdvanced;
    this.handleCollisionWithTracksAdvanced = function()
    {
        this.superHandleCollision();
        this.timeSinceLastBumpToWall += deltaTime;

        if (this.getCurrentTrackType() == TRACK_ROAD || this.getCurrentTrackType() == TRACK_GOAL) return;
        if (this.recoveryMode) return;
        
        if (this.timeSinceLastBumpToWall < MIN_TIME_SINCE_LAST_BUMP_TO_WALL)
        {
            this.recoveryMode = true; //  enter recovery mode
            this.target = null;  // stop thinking about the current target
            this.timeSinceRecoveryMode = 0.0;
        }
        this.timeSinceLastBumpToWall = 0.0;
    }

    this.handleRecoveryModeIfNecessary = function()
    {
        if (!this.recoveryMode) return;

        this.timeSinceRecoveryMode += deltaTime;
        
        // If no new target has been selected, select one
        if (this.target == null && this.timeSinceRecoveryMode > MIN_TIME_BEFORE_SELECTING_TARGET_IN_RECOVERY)
        {
            if (this.timeSinceRecoveryMode < MAX_TIME_BEFORE_SELECTING_TARGET_IN_RECOVERY)
            {
                if (Math.random() < 0.5) this.selectTargetForRecoveryMode();
            }
            else this.selectTargetForRecoveryMode();
        }

        if (this.timeSinceRecoveryMode > TIME_FOR_RECOVERY_MODE)
        {
            this.recoveryMode = false;
            this.selectTarget();
        }
    }

    this.selectTargetForRecoveryMode = function()
    {
        var pointerLeft = 0;
        var pointerRight = this.maxAngleNumberToProbe -1;
        var isPointerLeft = true;

        for (var ptrIdx = 0; ptrIdx < this.maxAngleNumberToProbe; ptrIdx++)
        {
            var angleFrac = 0;

            if (isPointerLeft)
            {
                angleFrac = pointerLeft;
                pointerLeft++
                isPointerLeft = false; 
            }
            else
            {
                angleFrac = pointerRight;
                pointerRight--
                isPointerLeft = true;
            }

            var currentAngle = this.ang + angleFrac * Math.PI / (2 * this.maxAngleNumberToProbe) -  Math.PI / 4;

            // if there is no wall in this direction
            if (!this.checkIfWallInThisDirectionAtMaxProbDistAdvance(currentAngle))
            {
                console.log(currentAngle);
                this.target = {
                    "x": this.x + Math.cos(currentAngle) * this.maxDistToProbForWall,
                    "y": this.y + Math.sin(currentAngle) * this.maxDistToProbForWall
                }
                break;
            }
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
        
        // Direction in which the ray is facing in vertical direction
        var rayDir = Math.sign(Math.sin(angle)) > 0 ? 1 : -1;

        // Initialize ray intersect in y dierection
        var rayIntersectY = TRACK_H * Math.floor(this.y / TRACK_H);
        if (rayDir > 0) rayIntersectY += TRACK_H;

        // Initialize ray intersect in x direction
        var rayIntersectX = this.x + (rayIntersectY - this.y) / Math.tan(angle);
        
        // Set the increment step
        var incrementY = rayDir * TRACK_H;
        var incrementX = incrementY / Math.tan(angle);

        // Create ray intersect variable
        var rayIntersect = {"x": rayIntersectX, "y": rayIntersectY};

        while (distanceBetweenTwoPoints(this, rayIntersect) < this.maxDistToProbForWall)
        {
            var tileKind = returnTrackTypeAtPixelXY(rayIntersect.x, rayIntersect.y + 0.01*incrementY);
            var isWallFound = (tileKind == TRACK_WALL) || (tileKind == TRACK_TREE);
            
            if (isWallFound)
            {
                var trackJ = Math.floor(rayIntersect.x / TRACK_W);
                var trackI = Math.floor((rayIntersect.y + + 0.01*incrementY) / TRACK_H);
                canvasContext.globalAlpha = 0.5;
                colorRect(trackJ * TRACK_W, trackI * TRACK_H, TRACK_W, TRACK_H, "red");
                canvasContext.globalAlpha = 1.0;
                return true;
            }
            
            rayIntersect.x += incrementX;
            rayIntersect.y += incrementY;
        }

        return false;
    }

    this.checkForRayWallIntersectionInHorizontalSweep = function(angle)
    {
        if (Math.cos(angle) == 0) return false;

        // Direction in which the ray is facing in horizontal direction
        var rayDir = Math.sign(Math.cos(angle)) > 0 ? 1 : -1;

        // Initialize ray intersect in x direction
        var rayIntersectX = TRACK_W * Math.floor(this.x / TRACK_W);
        if (rayDir > 0) rayIntersectX += TRACK_W;

        // Initialize ray intersect in y direction
        var rayIntersectY = this.y + Math.tan(angle) * (rayIntersectX - this.x);
        
        // Set the increment step
        var incrementX = rayDir * TRACK_W;
        var incrementY = incrementX * Math.tan(angle);

        // Create ray intersect variable
        var rayIntersect = {"x": rayIntersectX, "y": rayIntersectY};

        while (distanceBetweenTwoPoints(this, rayIntersect) < this.maxDistToProbForWall)
        {
            var isWallFound = returnTrackTypeAtPixelXY(rayIntersect.x + 0.01*incrementX, rayIntersect.y) == TRACK_WALL;
            if (isWallFound)
            {
                var trackJ = Math.floor((rayIntersect.x  + 0.01*incrementX) / TRACK_W);
                var trackI = Math.floor(rayIntersect.y / TRACK_H);
                canvasContext.globalAlpha = 0.5;
                colorRect(trackJ * TRACK_W, trackI * TRACK_H, TRACK_W, TRACK_H, "red");
                canvasContext.globalAlpha = 1.0;
                return true;
            } 
            
            rayIntersect.x += incrementX;
            rayIntersect.y += incrementY;
        }

        return false;
    }
    
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
