function Player(name)
{
    Spaceship.call(this, name);

    this.setupInput = function(upKey, rightKey, downKey, leftKey, spaceKey)
    {
        this.controlKeyUp = upKey;
        this.controlKeyRight = rightKey;
        this.controlKeyDown = downKey;
        this.controlKeyLeft = leftKey;        
        this.controlKeySpace = spaceKey;
    }
}

Object.setPrototypeOf(Player.prototype, Spaceship.prototype);
