const DEBUG_PLAYER = false;

function Player(name, pic, stunnedPic)
{
    Spaceship.call(this, name, pic, stunnedPic);

    this.setupInput = function(upKey, rightKey, downKey, leftKey, spaceKey)
    {
        this.controlKeyUp = upKey;
        this.controlKeyRight = rightKey;
        this.controlKeyDown = downKey;
        this.controlKeyLeft = leftKey;        
        this.controlKeySpace = spaceKey;
    }

    this.superDraw = this.draw;
    this.draw = function()
    {
        this.superDraw();
        this.debugDraw();
    }

    this.debugDraw = function()
    {
        if (!DEBUG_PLAYER) return;

        colorCircle(this.x, this.y, 5, "gold");

        proj = projectPointToSegment(
            this, 
            {"x": this.waypointForPosition.leftX, "y": this.waypointForPosition.leftY},
            {"x": this.waypointForPosition.rightX, "y": this.waypointForPosition.rightY});
        
        colorCircle(proj.x, proj.y, 10, "black"); 
    }
}

Object.setPrototypeOf(Player.prototype, Spaceship.prototype);
