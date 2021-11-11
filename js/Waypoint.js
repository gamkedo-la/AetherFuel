var waypoints = [];
var isWaypointsLoopClosed = false;

function Waypoint(tileI, tileJ)
{
    this.tileI = tileI;
    this.tileJ = tileJ;

    this.next = null;

    this.setNextWaypoint = function(waypoint)
    {
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

function drawAllWaypoints()
{
    waypoints.forEach(function(waypoint){ waypoint.draw();});
}

function getExistingWaypointAtIJ(tileI, tileJ)
{
    for(var i = 0; i < waypoints.length; i++)
    {
        if(waypoints[i].checkIfExistsAtIJ(tileI, tileJ))
        {
            return waypoints[i];
        }
    }

    return null;  // Waypoint does not exist at tile (tileI, tileJ)
}