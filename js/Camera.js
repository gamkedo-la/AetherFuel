const PLAYER_DIST_FROM_CENTER_BEFORE_CAM_PAN_X = 150;
const PLAYER_DIST_FROM_CENTER_BEFORE_CAM_PAN_Y = 100;

const SAFETY_EXTRA_TRACKS_SEEN = 2;


function Camera()
{
    this.panX = 0;  // Shift from the top left corner
    this.panY = 0;  // Shift from the top left corner

    this.maxPanX = 0;
    this.maxPanY = 0;

    this.minTrackSeenX = 0;
    this.maxTrackSeenX = 0;
    this.minTrackSeenY = 0;
    this.maxTrackSeenY = 0;

    this.numRowsSeen;
    this.numColsSeen;

    this.angle = 0;
    this.rotationSpeed = 0.1;

    this.initialize = function()
    {
        this.maxPanX = trackNumCols * TRACK_W - canvas.width; 
        this.maxPanY = trackNumRows * TRACK_H - canvas.height; 

        this.numColsSeen = Math.floor(canvas.width / TRACK_W);
        this.numRowsSeen = Math.floor(canvas.height / TRACK_H);
    }
    
    this.follow = function(target)
    {
        this.panX = target.x; //- canvas.width / 2; 
        this.panY = target.y;// - canvas.height / 2; 

        this.angle = lerp(this.angle, -target.ang, this.rotationSpeed);
    
        // this.checkForCollisions();
        // this.updateTracksSeen();
        this.minTrackSeenJ = 0;
        this.maxTrackSeenJ = trackNumCols;

        this.minTrackSeenI = 0;
        this.maxTrackSeenI = trackNumRows;
    }

    this.translate = function()
    {
        canvasContext.save();

        canvasContext.translate(canvas.width / 2, canvas.height * 0.95);

        if (!editorMode)
        {
            canvasContext.rotate(this.angle - Math.PI / 2);
        }

        canvasContext.translate(-this.panX, -this.panY);
    }

    // WAS NOT BUILT FOR ROTATING CAMERA...
    // this.checkForCollisions = function() 
    // {
    //     if (this.panX < 0) {
    //         this.panX = 0;
    //     }
    //     else if (this.panX > this.maxPanX) {
    //         this.panX = this.maxPanX;
    //     }

    //     if (this.panY < 0) {
    //         this.panY = 0;
    //     }
    //     else if (this.panY > this.maxPanY) {
    //         this.panY = this.maxPanY;
    //     }
    // }

    // this.updateTracksSeen = function()
    // {
    //     var panTrackJ = Math.floor(this.panX / TRACK_W);
    //     var panTrackI = Math.floor(this.panY / TRACK_H);
        
    //     this.minTrackSeenJ = Math.max(0, panTrackJ - SAFETY_EXTRA_TRACKS_SEEN);
    //     this.maxTrackSeenJ = Math.min(trackNumCols, panTrackJ + this.numColsSeen + SAFETY_EXTRA_TRACKS_SEEN);

    //     this.minTrackSeenI = Math.max(0, panTrackI - SAFETY_EXTRA_TRACKS_SEEN);
    //     this.maxTrackSeenI = Math.min(trackNumRows, panTrackI + this.numRowsSeen + SAFETY_EXTRA_TRACKS_SEEN);
    // }
}
