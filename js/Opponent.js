function Opponent(name)
{
    Spaceship.call(this, name);

    this.activateGas = function()
    {
        if (currentWaypoint == null) return ;
        this.holdGas = 1;
    }

    this.steerWheels = function()
    {
        if (currentWaypoint == null) return ;

        var distToWaypoint = distanceBetweenTwoPoints(this, currentWaypoint);
        if (distToWaypoint < 10)
        {
            currentWaypoint = currentWaypoint.next;
            return
        }

        var rightDir = {
            "x": -Math.sin(this.ang),
            "y": Math.cos(this.ang)
        };

        var dirToWaypoint = {
            "x": (currentWaypoint.x - this.x) / distToWaypoint,
            "y": (currentWaypoint.x - this.y) / distToWaypoint,
        }

        var dotProd = rightDir.x * dirToWaypoint.x + rightDir.y * dirToWaypoint.y;

        if (Math.abs(dotProd) < 0.01)
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
            this.holdTurnLeft = 1;        }
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