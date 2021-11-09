function Player(name)
{
    Spaceship.call(this, name);

    this.setupInput = function(upKey, rightKey, downKey, leftKey)
    {
        this.controlKeyUp = upKey;
        this.controlKeyRight = rightKey;
        this.controlKeyDown = downKey;
        this.controlKeyLeft = leftKey;        
    }

    this.move = function()
    {
        this.speed *= GROUND_SPEED_DECAY_MULT;

        if (this.keyHeldGas) 
        {
            this.speed += GAS_POWER;
        }
        if (this.keyHeldReverse)
        {
            this.speed -= REVERSE_POWER;
        }

        if (this.engineSound != null) this.engineSound.rate = lerp(0.75, 2, Math.abs(this.speed/16));

        if (Math.abs(this.speed) > MIN_SPEED_TO_TURN)
        {   
            if (this.keyHeldTurnLeft)
            {
                this.ang -= TURN_SPEED;
            }
            if (this.keyHeldTurnRight)
            {
                this.ang += TURN_SPEED;
            }   
        }

        this.x += this.speed * Math.cos(this.ang);
        this.y += this.speed * Math.sin(this.ang);
        this.updateRowColIdx();

        if (tireTracks) {
            // FIXME track alpha could check accel/turn state for skids
            let tireTrackAlpha = 0.1;  // barely visible
            tireTracks.add(this.x, this.y, this.ang, tireTrackAlpha);
        }
    }
}

Object.setPrototypeOf(Player.prototype, Spaceship.prototype);
