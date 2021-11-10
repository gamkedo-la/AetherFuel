var waypoints = [new Waypoint(5, 8)]

function Waypoint(tileI, tileJ)
{
    this.tileI = tileI;
    this.tileJ = tileJ;

    this.draw = function()
    {
        canvasContext.drawImage(waypointPic,
                                this.tileJ * TRACK_W,
                                this.tileI * TRACK_H);
    }
}

function drawAllWaypoints()
{
    waypoints.forEach(function(waypoint){ waypoint.draw();});
}