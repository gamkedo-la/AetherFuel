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
}

Object.setPrototypeOf(Player.prototype, Spaceship.prototype);
