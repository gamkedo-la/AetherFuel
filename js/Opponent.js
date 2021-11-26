const MIN_TIME_BEFORE_TARGET_CHANGE = 300.0;  // in milliseconds
const MAX_TIME_BEFORE_TARGET_CHANGE = 1000.0;  // in milliseconds
const MIN_TIME_SINCE_LAST_BUMP_TO_WALL = 1000.0;

function Opponent(name, pic)
{
    Spaceship.call(this, name);

    this.currentWaypoint = null;
    this.target = null;
    this.timeSinceLastTargetSelection = 0.0;
	this.pic = pic;
    this.timeSinceLastBumpToWall = MIN_TIME_SINCE_LAST_BUMP_TO_WALL;
    // this.targetSpeed; 

    this.activateGas = function()
    {
        if (this.currentWaypoint == null) return ;
        
        this.holdGas = Math.random() < this.currentWaypoint.percentageGasAppliedTime;

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
        if (this.currentWaypoint == null) return;
        
        var randVal = Math.random();

        if (randVal < 0.25)
        {
            this.target = {
                "x": (this.currentWaypoint.leftX + this.currentWaypoint.midLeftX) / 2,
                "y": (this.currentWaypoint.leftY + this.currentWaypoint.midLeftY) / 2,
            }
        }
        else if (randVal < 0.5)
        {
            this.target = {
                "x": (this.currentWaypoint.midLeftX + this.currentWaypoint.x) / 2,
                "y": (this.currentWaypoint.midLeftY + this.currentWaypoint.y) / 2,
            }
        }
        else if (randVal < 0.75)
        {
            this.target = {
                "x": (this.currentWaypoint.x + this.currentWaypoint.midRightX) / 2,
                "y": (this.currentWaypoint.y + this.currentWaypoint.midRightY) / 2,
            }
        }
        else
        {
            this.target = {
                "x": (this.currentWaypoint.midRightX + this.currentWaypoint.rightX) / 2,
                "y": (this.currentWaypoint.midRightY + this.currentWaypoint.rightY) / 2,
            }
        }

        // Reset timeSinceLastTargetSelection
        this.timeSinceLastTargetSelection = 0.0;
    }

    this.checkIfCloseEnoughToCurrentWaypoint = function()
    {
        if (this.currentWaypoint == null) return;

        var distToWaypoint = distanceBetweenTwoPoints(this, this.currentWaypoint);
        if (distToWaypoint < 80)
        {
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
            console.log("change target my friend!");
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

        lineBetweenTwoPoints(this.x, this.y, this.target.x, this.target.y, "red");
    }

    this.superHandleCollision = this.handleCollisionWithTracksAdvanced;
    this.handleCollisionWithTracksAdvanced = function()
    {
        this.superHandleCollision();
        this.timeSinceLastBumpToWall += deltaTime;

        if (this.getCurrentTrackType() != TRACK_WALL) return;
        if (this.timeSinceLastBumpToWall < MIN_TIME_SINCE_LAST_BUMP_TO_WALL)
        {
            console.log("I think  you should stop and focus now");
        }
        this.timeSinceLastBumpToWall = 0.0;
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
}
Object.setPrototypeOf(Opponent.prototype, Spaceship.prototype);
