var currentWaypoint = null;
var firstWaypoint = null;

function Waypoint(data)
{
    this.x = data.x;
    this.y = data.y;
    this.angle = data.angle;

    this.percentageGasAppliedTime = 0.8;
    // this.targetSpeedToCrossItAt ([0, 1] - when close enough to pixel - percentage)
    // percentage of time at which I hold gas
    // 

    this.next = data.next == null? null : new Waypoint(data.next);

    // add waypoint thickness
    this.thickness = data.thickness;  // in pixels 
    this.leftX = this.x + this.thickness / 2 * Math.sin(this.angle);
    this.leftY = this.y - this.thickness / 2 * Math.cos(this.angle);
    
    this.midLeftX = this.x + this.thickness / 4 * Math.sin(this.angle);
    this.midLeftY = this.y - this.thickness / 4 * Math.cos(this.angle);

    this.midRightX = this.x - this.thickness / 4 * Math.sin(this.angle);
    this.midRightY = this.y + this.thickness / 4 * Math.cos(this.angle);

    this.rightX = this.x - this.thickness / 2 * Math.sin(this.angle);
    this.rightY = this.y + this.thickness / 2 * Math.cos(this.angle);

    this.addWaypoint = function(waypoint)
    {
        if (this.next != null)
        {
            this.next.addWaypoint(waypoint);
            return;
        }

        this.next = waypoint;
    }

    this.checkIfExistsAtIJ = function(x, y)
    {
        // replace with a distance check if not tile locked
        return this.x == x && this.y == y;
    }

    this.draw = function()
    {
        this.drawThickness();
        this.drawConnectionToNextWaypoint();
        this.drawWaypointImage();
    }

    this.drawConnectionToNextWaypoint = function()
    {
        var nextWaypoint = this.next != null ? this.next : firstWaypoint;

        canvasContext.lineWidth = 3;
        // lineBetweenTwoPoints(this.leftX, this.leftY, nextWaypoint.leftX, nextWaypoint.leftY, "black");
        // lineBetweenTwoPoints(this.midLeftX, this.midLeftY, nextWaypoint.midLeftX, nextWaypoint.midLeftY, "black");
        // lineBetweenTwoPoints(this.x, this.y, nextWaypoint.x, nextWaypoint.y, "black");
        // lineBetweenTwoPoints(this.midRightX, this.midRightY, nextWaypoint.midRightX, nextWaypoint.midRightY, "black");
        // lineBetweenTwoPoints(this.rightX, this.rightY, nextWaypoint.rightX, nextWaypoint.rightY, "black");

        areaWithinPolygon(this.x - this.thickness / 2 * Math.sin(this.angle),
                          this.y + this.thickness / 2 * Math.cos(this.angle),
                          nextWaypoint.x - nextWaypoint.thickness / 2 * Math.sin(nextWaypoint.angle),
                          nextWaypoint.y + nextWaypoint.thickness / 2 * Math.cos(nextWaypoint.angle),
                          nextWaypoint.x + nextWaypoint.thickness / 2 * Math.sin(nextWaypoint.angle),
                          nextWaypoint.y - nextWaypoint.thickness / 2 * Math.cos(nextWaypoint.angle),
                          this.x + this.thickness / 2 * Math.sin(this.angle),
                          this.y - this.thickness / 2 * Math.cos(this.angle),
                          "red")
    }

    this.drawWaypointImage = function()
    {
        drawBitmapCenteredWithRotation(waypointPic, this.x, this.y,
            this.angle, waypointPic.width, waypointPic.height);
    }

    this.drawThickness = function()
    {
        canvasContext.lineWidth = 5;
        lineBetweenTwoPoints(this.leftX, this.leftY, this.rightX, this.rightY, "green");
        
        colorCircle(this.leftX, this.leftY, 4, "magenta");
        colorCircle(this.midLeftX, this.midLeftY, 4, "gold");
        colorCircle(this.midRightX, this.midRightY, 4, "chartreuse");
        colorCircle(this.rightX, this.rightY, 4, "white");
    }

    this.updateThickness = function(value)
    {
        this.thickness += value;
        this.updateLeftRightTags();
    }

    this.updateAngle = function(value)
    {
        this.angle = value;
        this.updateLeftRightTags();
    }

    this.updateLeftRightTags = function()
    {
        this.leftX = this.x + this.thickness / 2 * Math.sin(this.angle);
        this.leftY = this.y - this.thickness / 2 * Math.cos(this.angle);
        
        this.midLeftX = this.x + this.thickness / 4 * Math.sin(this.angle);
        this.midLeftY = this.y - this.thickness / 4 * Math.cos(this.angle);

        this.midRightX = this.x - this.thickness / 4 * Math.sin(this.angle);
        this.midRightY = this.y + this.thickness / 4 * Math.cos(this.angle);

        this.rightX = this.x - this.thickness / 2 * Math.sin(this.angle);
        this.rightY = this.y + this.thickness / 2 * Math.cos(this.angle);
    }
}

function drawAllWaypoints()
{
    var tempWaypoint = firstWaypoint;

    while (tempWaypoint != null)
    {
        tempWaypoint.draw();
        tempWaypoint = tempWaypoint.next;
    }
}

function getExistingWaypointAtIJ(x, y)
{
    var tempWaypoint = currentWaypoint;

    while (tempWaypoint != null)
    {
        if(tempWaypoint.checkIfExistsAtIJ(x, y))
        {
            return tempWaypoint;
        }

        tempWaypoint = tempWaypoint.next;
    }

    return null;  // Waypoint does not exist at tile (tileI, tileJ)
}