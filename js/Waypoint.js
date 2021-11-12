var currentWaypoint = null;
var isWaypointsLoopClosed = false;

function Waypoint(tileI, tileJ)
{
    this.tileI = tileI;
    this.tileJ = tileJ;

    this.x = tileJ * TRACK_W;
    this.y = tileI * TRACK_H;

    this.next = null;
    this.isLoopClosure = false;

    this.addWaypoint = function(waypoint)
    {
        if (this.next != null)
        {
            this.next.addWaypoint(waypoint);
            return;
        }

        this.next = waypoint;
    }

    this.checkIfExistsAtIJ = function(tileI, tileJ)
    {
        return this.tileI == tileI && this.tileJ == tileJ;
    }

    this.draw = function()
    {
        canvasContext.drawImage(waypointPic,
                                this.tileJ * TRACK_W,
                                this.tileI * TRACK_H);

        if (this.next != null)
        {
            lineBetweenTwoPoints((this.tileJ + 1 / 2) * TRACK_W,
                                 (this.tileI + 1 / 2) * TRACK_H,
                                 (this.next.tileJ + 1 / 2) * TRACK_W,
                                 (this.next.tileI + 1 / 2) * TRACK_H);
        }
    }
}

function setLoopClosure(waypoint)
{
    var tempWaypoint = currentWaypoint;

    while (tempWaypoint.next != null)
    {
        tempWaypoint = tempWaypoint.next;
    }

    tempWaypoint.isLoopClosure = true;
    tempWaypoint.next = waypoint;
    isWaypointsLoopClosed = true;
}

function drawAllWaypoints()
{
    var tempWaypoint = currentWaypoint;

    while (tempWaypoint != null)
    {
        tempWaypoint.draw();

        if (tempWaypoint.isLoopClosure)
        {
            break;
        }

        tempWaypoint = tempWaypoint.next;
    }
}

function getExistingWaypointAtIJ(tileI, tileJ)
{
    var tempWaypoint = currentWaypoint;

    while (tempWaypoint != null)
    {
        if(tempWaypoint.checkIfExistsAtIJ(tileI, tileJ))
        {
            return tempWaypoint;
        }

        tempWaypoint = tempWaypoint.next;
    }

    return null;  // Waypoint does not exist at tile (tileI, tileJ)
}