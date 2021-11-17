var currentWaypoint = null;
var firstWaypoint = null;

function Waypoint(data)
{
    this.x = data.x;
    this.y = data.y;
    this.angle = 0.0;

    this.next = data.next == null? null : new Waypoint(data.next);

    // add waypoint thickness
    this.thickness = 100.0;  // in pixels 

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
        var lineColor = this.next != null ? "black" : "red";

        canvasContext.lineWidth = 5;

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

        lineBetweenTwoPoints(this.x - this.thickness / 2 * Math.sin(this.angle),
                             this.y + this.thickness / 2 * Math.cos(this.angle),
                             this.x + this.thickness / 2 * Math.sin(this.angle),
                             this.y - this.thickness / 2 * Math.cos(this.angle),
                             "green");

        colorCircle(this.x + this.thickness / 2 * Math.sin(this.angle),
                    this.y - this.thickness / 2 * Math.cos(this.angle), 5, "magenta");
                    
        colorCircle(this.x - this.thickness / 2 * Math.sin(this.angle),
                    this.y + this.thickness / 2 * Math.cos(this.angle), 5, "white");
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