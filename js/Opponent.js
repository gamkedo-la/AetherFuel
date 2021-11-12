function Opponent(name)
{
    Spaceship.call(this, name);

    // this.pushOther(other)
    // {
    //     other.slideX += 1;
    // }

    this.move = function()
    {
        if (currentWaypoint == null){ return; }

        this.speed = 10.0;
        this.ang = Math.atan2(currentWaypoint.y - this.y + TRACK_H/2, currentWaypoint.x - this.x + TRACK_W/2);

        if (this.engineSound != null) this.engineSound.rate = lerp(0.75, 2, Math.abs(this.speed/16));

        this.x += this.speed * Math.cos(this.ang); // + slideX
        this.y += this.speed * Math.sin(this.ang); // + slideY --> push in the opposite direction

        // slideX *= 0.95; 
        // slideY *= 0.95; decay

        if (distanceBetweenTwoPoints(this, currentWaypoint) < TRACK_W)
        {
            if (currentWaypoint.next == null)
            {
                currentWaypoint = firstWaypoint;
            }
            else
            {
                currentWaypoint = currentWaypoint.next;
            }
        }

        this.updateRowColIdx();

        if (tireTracks)
        {
            // FIXME track alpha could check accel/turn state for skids
            let tireTrackAlpha = 0.1;  // barely visible
            tireTracks.add(this.x, this.y, this.ang, tireTrackAlpha);
        }

        this.handleCollisionWithTracksAdvanced();
    }
}
Object.setPrototypeOf(Opponent.prototype, Spaceship.prototype);