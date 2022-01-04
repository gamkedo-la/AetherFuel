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
	
    const scatter_random_decals_everywhere = true; // experimental
    const place_streetlights_automatically = true; // glowy lights
    const DEG2RAD = Math.PI/180;

    console.log("Initializing decal manager...");

	this.add = function(x,y,rot,alpha,img,decalCTX) {
		this.decalCount++;
		if (alpha === undefined) alpha = 0.1;
		if (alpha > 1) alpha = 1;
		if (alpha < 0) alpha = 0;
        if (img==undefined) img = tireTrackPic;
		//console.log('decals:'+x+','+y+','+rot+' alpha:'+alpha);

        if (decalCTX==undefined) decalCTX = this.tireTrackCTX;
		decalCTX.save();
		decalCTX.translate(x,y);
		decalCTX.rotate(rot);
		decalCTX.globalAlpha = alpha;
		decalCTX.drawImage(img, -9, -9); // FIXME
		decalCTX.restore()

		if (this.decalCount % 7 == 0) // every Xth decal, fade everything out a little
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

        if (scatter_random_decals_everywhere) {
            // FIXME - only spawn in certain regions
            // and only spawn depending on the level!!
            // small levels look too dense - adjust nums
            this.scatterMany(cracksPic,222,0,0,this.tireTrackCanvas.width,this.tireTrackCanvas.height);
            this.scatterMany(gravelPic,777,0,0,this.tireTrackCanvas.width,this.tireTrackCanvas.height);
            this.scatterMany(rocksPic,111,0,0,this.tireTrackCanvas.width,this.tireTrackCanvas.height);
            this.scatterMany(rubblePic,88,0,0,this.tireTrackCanvas.width,this.tireTrackCanvas.height);
        }

        if (place_streetlights_automatically) {
            let ofs = 32; // distance from edge of track to place a light
            // top mid
            this.add(this.tireTrackCanvas.width/2,ofs,90*DEG2RAD,1.0,streetlightPic);
            // bottom mid
            this.add(this.tireTrackCanvas.width/2,this.tireTrackCanvas.height-ofs,-90*DEG2RAD,1.0,streetlightPic);
            // left mid
            this.add(ofs,this.tireTrackCanvas.height/2,0*DEG2RAD,1.0,streetlightPic);
            // right mid
            this.add(this.tireTrackCanvas.width-ofs,this.tireTrackCanvas.height/2,180*DEG2RAD,1.0,streetlightPic);
        }

	};
  
    this.scatterMany = function(img,num=1000,xmin=0,ymin=0,xmax=4000,ymax=4000,alpha=0.2,forceCTX) {
        if (img==undefined) img = tireTrackPic;
        console.log("scattering "+num+" decals...");
        for (let n=0; n<num; n++) {
            // random decal placement in the box specified
            let x = Math.round((Math.random()*(xmax-xmin))+xmin);
            let y = Math.round((Math.random()*(ymax-ymin))+ymin);
            let rot = Math.random()*Math.PI*2; // any rotation
            this.add(x,y,rot,alpha,img,forceCTX);
        }
    }

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
