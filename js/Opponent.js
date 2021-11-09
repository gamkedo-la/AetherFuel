function Opponent(name)
{
    Spaceship.call(this, name);

    this.move = function()
    {
        this.speed = player.speed;
        this.ang = player.ang;

        if (this.engineSound != null) this.engineSound.rate = lerp(0.75, 2, Math.abs(this.speed/16));

        this.x += this.speed * Math.cos(this.ang);
        this.y += this.speed * Math.sin(this.ang);
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