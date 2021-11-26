const MIN_TIME_BEFORE_TARGET_CHANGE = 300.0;  // in milliseconds
const MAX_TIME_BEFORE_TARGET_CHANGE = 1000.0;  // in milliseconds

function Opponent(name, pic)
{
    Spaceship.call(this, name);

    this.target = null;
    this.timeSinceLastTargetSelection = 0.0;
	this.pic = pic;
    // this.targetSpeed; 

    this.activateGas = function()
    {
        if (currentWaypoint == null) return ;
        
        this.holdGas = Math.random() < currentWaypoint.percentageGasAppliedTime;

        // Random reevaluaiton of gas holding
        // frequency of reevaluation
    }

    this.steerWheels = function()
    {
        if (currentWaypoint == null) return;
        if (this.target == null) return ;

        var rightDir = {
            "x": -Math.sin(this.ang),
            "y": Math.cos(this.ang)
        };

        var distToWaypoint = distanceBetweenTwoPoints(this, currentWaypoint);
        var dirToWaypoint = {
            "x": (this.target.x - this.x) / distToWaypoint,
            "y": (this.target.y - this.y) / distToWaypoint,
        }

        var dotProd = rightDir.x * dirToWaypoint.x + rightDir.y * dirToWaypoint.y;

        if (Math.abs(dotProd) < 0.1)
        {
            this.holdTurnRight = 0;
            this.holdTurnLeft = 0;
        }
        else if (dotProd > 0)
        {
            this.holdTurnRight = 1;
            this.holdTurnLeft = 0;
        }
        else
        {
            this.holdTurnRight = 0;
            this.holdTurnLeft = 1; 
        }
    }

    this.selectTarget = function()
    {
        if (currentWaypoint == null) return;
        
        var randVal = Math.random();

        if (randVal < 0.25)
        {
            this.target = {
                "x": (currentWaypoint.leftX + currentWaypoint.midLeftX) / 2,
                "y": (currentWaypoint.leftY + currentWaypoint.midLeftY) / 2,
            }
        }
        else if (randVal < 0.5)
        {
            this.target = {
                "x": (currentWaypoint.midLeftX + currentWaypoint.x) / 2,
                "y": (currentWaypoint.midLeftY + currentWaypoint.y) / 2,
            }
        }
        else if (randVal < 0.75)
        {
            this.target = {
                "x": (currentWaypoint.x + currentWaypoint.midRightX) / 2,
                "y": (currentWaypoint.y + currentWaypoint.midRightY) / 2,
            }
        }
        else
        {
            this.target = {
                "x": (currentWaypoint.midRightX + currentWaypoint.rightX) / 2,
                "y": (currentWaypoint.midRightY + currentWaypoint.rightY) / 2,
            }
        }

        // Reset timeSinceLastTargetSelection
        this.timeSinceLastTargetSelection = 0.0;
    }

    this.checkIfCloseEnoughToCurrentWaypoint = function()
    {
        if (currentWaypoint == null) return;

        var distToWaypoint = distanceBetweenTwoPoints(this, currentWaypoint);
        if (distToWaypoint < 80)
        {
            currentWaypoint = currentWaypoint.next == null ? firstWaypoint : currentWaypoint.next;
            this.selectTarget();
        }
    }

    this.updateTimeSinceLastWaypointChange = function ()
    {
        this.timeSinceLastTargetSelection += deltaTime;

        if (this.timeSinceLastTargetSelection > randomFloatFromInterval(MIN_TIME_BEFORE_TARGET_CHANGE,
                                                                        MAX_TIME_BEFORE_TARGET_CHANGE))
        {
            console.log("change target my friend!");
            this.selectTarget();
        }
    }

    this.superReset = this.reset;
    this.reset = function()
    {
        this.superReset(this.pic);
        this.selectTarget();
    }

    this.superdraw = this.draw;
    this.draw = function()
    {
        this.superdraw();

        if (currentWaypoint == null) return;

        lineBetweenTwoPoints(this.x, this.y, this.target.x, this.target.y, "red");
    }

    this.superMove = this.move;
    this.move = function ()
    {
        this.superMove();
        this.checkIfCloseEnoughToCurrentWaypoint();
        this.updateTimeSinceLastWaypointChange();
    }
    

    // this.pushOther(other)
    // {
    //     other.slideX += 1;
    // }

    // this.move = function()
    // {
    //     if (currentWaypoint == null){ return; }

    //     this.speed = 10.0;
    //     this.ang = Math.atan2(currentWaypoint.y - this.y + TRACK_H/2, currentWaypoint.x - this.x + TRACK_W/2);

    //     if (this.engineSound != null) this.engineSound.rate = lerp(0.75, 2, Math.abs(this.speed/16));

    //     this.x += this.speed * Math.cos(this.ang); // + slideX
    //     this.y += this.speed * Math.sin(this.ang); // + slideY --> push in the opposite direction

    //     // slideX *= 0.95; 
    //     // slideY *= 0.95; decay

    //     if (distanceBetweenTwoPoints(this, currentWaypoint) < TRACK_W)
    //     {
    //         if (currentWaypoint.next == null)
    //         {
    //             currentWaypoint = firstWaypoint;
    //         }
    //         else
    //         {
    //             currentWaypoint = currentWaypoint.next;
    //         }
    //     }

    //     this.updateRowColIdx();

    //     if (tireTracks)
    //     {
    //         // FIXME track alpha could check accel/turn state for skids
    //         let tireTrackAlpha = 0.1;  // barely visible
    //         tireTracks.add(this.x, this.y, this.ang, tireTrackAlpha);
    //     }

    //     this.handleCollisionWithTracksAdvanced();
    // }
}
Object.setPrototypeOf(Opponent.prototype, Spaceship.prototype);
