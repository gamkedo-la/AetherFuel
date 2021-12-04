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
            this.holdGas = Math.random() < this.currentWaypoint.percentageGasAppliedTime;
            this.holdReverse = false;

            // // check if wall is in fornt of us
            // var testerPointX = this.x + Math.cos(this.ang) * TRACK_W * 2;
            // var testerPointY = this.y + Math.sin(this.ang) * TRACK_H * 2;

            // if (returnTrackTypeAtPixelXY(testerPointX, testerPointY) == TRACK_WALL)
            // {
            //     // this.holdGas = false;
            //     this.dodgeTimer = 15;
            //     this.dodgeAngTurn = 0.2;  // to be finessed
            // }
        }
        
        // Random reevaluaiton of gas holding
        // frequency of reevaluation
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

        if (this.dodgeTimer > 0.0)
        {
            this.holdTurnLeft = false;
            this.holdTurnRight = false;

            this.dodgeTimer--;
            this.ang += this.dodgeAngTurn;
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

        var distToWaypoint = distanceBetweenTwoPoints(this, this.target);
        if (distToWaypoint < TRACK_W)
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
        this.superdraw();

        if (this.currentWaypoint == null) return;

        if (debugAIMode)
        {
            lineBetweenTwoPoints(this.x, this.y, this.target.x, this.target.y, "red");
        }
    }

    this.superHandleCollision = this.handleCollisionWithTracksAdvanced;
    this.handleCollisionWithTracksAdvanced = function()
    {
        this.superHandleCollision();
        this.timeSinceLastBumpToWall += deltaTime;

        if (this.getCurrentTrackType() != TRACK_WALL) return;
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


    // this.pushOther(other)
    // {
    //     other.slideX += 1;
    // }
}
Object.setPrototypeOf(Opponent.prototype, Spaceship.prototype);
