var currentWaypoint = null;
var firstWaypoint = null;

function Waypoint(data)
{
    this.x = data.x;
    this.y = data.y;
    this.angle = 0.0;

    this.next = data.next == null? null : new Waypoint(data.next);

    // add waypoint thickness
    this.thickness;  // in pixels 

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
        drawBitmapCenteredWithRotation(waypointPic, this.x, this.y, 
                                       this.angle, waypointPic.width, waypointPic.height);
    
        var nextWaypoint = this.next != null ? this.next : firstWaypoint;
        var lineColor = this.next != null ? "black" : "red"

        lineBetweenTwoPoints(this.x,
                             this.y,
                             nextWaypoint.x,
                             nextWaypoint.y,
                             lineColor);
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