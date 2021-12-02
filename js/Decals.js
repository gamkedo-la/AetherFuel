// DECALS - made with love my McFunkypants
// an overlay canvas that can be drawn onto
// for infinite scorchmarks, skidmarks, dents, mud, etc
//
// EXAMPLE:
//
// add this to your onload function
// var decals = new decalManager(canvas);
//
// call this anytime:
// decals.add(this.x, this.y, this.ang, tireTrackAlpha, anImage);
//
// and render ALL decals in one draw call using
// decals.draw(canvasContext);

function decalManager(canvas) {
	
    console.log("Initializing decal manager...");

	this.add = function(x,y,rot,alpha,img) {
		this.decalCount++;
		if (alpha === undefined) alpha = 0.1;
		if (alpha > 1) alpha = 1;
		if (alpha < 0) alpha = 0;
        if (img==undefined) img = tireTrackPic;
		
		//console.log('decals:'+x+','+y+','+rot+' alpha:'+alpha);
		this.tireTrackCTX.save();
		this.tireTrackCTX.translate(x,y);
		this.tireTrackCTX.rotate(rot);
		this.tireTrackCTX.globalAlpha = alpha;
		this.tireTrackCTX.drawImage(img, -9, -9); // FIXME
		
		this.tireTrackCTX.restore()

		if (this.decalCount % 7 == 0) // every Xth skidmark
		{
			this.fadeOut(); // fade out the entire decal canvas
		}
	};

	// warning, this function is costly, don't call every frame
	this.fadeOut = function() {
		/*
		// this way has to run on a real web browser due to cross-origin security
		// we aren't allowed to read pixels of images stored locally
		var myImageData = this.tireTrackCTX.getImageData(0,0,this.tireTrackCanvas.width,this.tireTrackCanvas.height);
		var data = myImageData.data;
		for (var i = 0; i < data.length; i += 4) {
		  //data[i] = data[i];     // red
		  //data[i + 1] = data[i + 1]; // green
		  //data[i + 2] = data[i + 2]; // blue
		  if (data[i + 3]>1) data[i + 3]--; // alpha gets fainter
		}
		this.tireTrackCTX.putImageData(myImageData, 0, 0);
		*/
	};

	this.draw = function(canvasContext) {
		canvasContext.drawImage(this.tireTrackCanvas, 0, 0);
	};

	this.resize = function() {
        this.tireTrackCanvas.width = TRACK_W * trackNumCols;
        this.tireTrackCanvas.height = TRACK_H * trackNumRows;
        console.log("decals canvas resized to "+this.tireTrackCanvas.width+"x"+this.tireTrackCanvas.height);
	};

	this.reset = function() {
        this.resize();
        this.tireTrackCTX.clearRect(0, 0, this.tireTrackCanvas.width, this.tireTrackCanvas.height);
	};
  
	//var img.crossOrigin = "Anonymous";
	this.clear = function() {
        
        if (!this.tireTrackCanvas) {
            // create an offscreen render canvas
            this.tireTrackCanvas = document.createElement("canvas");
        }
    	this.tireTrackCanvas.width = canvas.width;
		this.tireTrackCanvas.height = canvas.height;
        this.tireTrackCTX = this.tireTrackCanvas.getContext('2d'); 
        this.tireTrackCanvas.width = canvas.width;
        this.tireTrackCanvas.height = canvas.height;
        this.decalCount = 0;
        this.reset(); // resize for map dimensions
	};

	this.clear(); // right away

}
