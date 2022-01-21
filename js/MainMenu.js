var menuMode = true;
var showCredits = false;

const CREDITS_RGBA = "rgba(30,80,255,1.0)";


function MainMenu()
{
    this.bgScroll = 0.0;

    this.levelOneColor = "LightBlue";
    this.levelTwoColor = "LightBlue";
    this.levelThreeColor = "LightBlue";

    this.levelButtonWidth = 250;
    this.levelButtonHeight = 200;

    this.levelOneX = 10;
    this.levelOneY = 150;

    this.levelTwoX = 275;
    this.levelTwoY = 150;

    this.levelThreeX = 540;
    this.levelThreeY = 150;

    this.spaceshipOneX = 200;
    this.spaceshipOneY = 350;

    this.spaceshipTwoX = 400;
    this.spaceshipTwoY = 350;

    this.spaceshipThreeX = 600;
    this.spaceshipThreeY = 350;

    this.playButtonX = 250
    this.playButtonY = 450

    this.playButtonWidth = 300
    this.playButtonHeight = 100

    this.isMouseOnLevelOne = false;
    this.isMouseOnLevelTwo = false;
    this.isMouseOnLevelThree = false;

    this.isMouseOnSpaceshipOne = false;
    this.isMouseOnSpaceshipTwo = false;
    this.isMouseOnSpaceshipThree = false;

    this.isSpaceshipOneSelected = false;
    this.isSpaceshipTwoSelected = false;
    this.isSpaceshipThreeSelected = false;

    this.isMouseOnPlayButton = false;

    this.hasSelectedLevel = false;

    this.load = function()
    {
        menuMode = true;
        endRaceMenu.setActive(false);

        this.isMouseOnLevelOne = false;
        this.isMouseOnLevelTwo = false;
        this.isMouseOnLevelThree = false;

        this.isMouseOnSpaceshipOne = false;
        this.isMouseOnSpaceshipTwo = false;
        this.isMouseOnSpaceshipThree = false;

        this.isSpaceshipOneSelected = false;
        this.isSpaceshipTwoSelected = false;
        this.isSpaceshipThreeSelected = false;

        this.isMouseOnPlayButton = false;
        this.hasSelectedLevel = false;
    }

    this.draw = function()
    {
        // draw the space background
        this.bgScroll++;
        var wrappedScroll = this.bgScroll % spaceBackGroundMenu.height;
        canvasContext.drawImage(spaceBackGroundMenu, 0, wrappedScroll, spaceBackGroundMenu.width, spaceBackGroundMenu.height - wrappedScroll,
            0, 0, spaceBackGroundMenu.width, spaceBackGroundMenu.height - wrappedScroll);
        canvasContext.drawImage(spaceBackGroundMenu, 0, spaceBackGroundMenu.height-wrappedScroll);    

        // draw the logo
        drawBitmapCenteredWithRotation(logoPic, canvas.width / 2, logoPic.height / 2 + 20);
        drawBitmapCenteredWithRotation(lightRiderPicLarge, lightRiderPicLarge.width / 2 + 50, logoPic.height / 2 + 20, 0);
        drawBitmapCenteredWithRotation(darkTravelerPicLarge, canvas.width - darkTravelerPicLarge.width / 2 - 50, logoPic.height / 2 + 20, Math.PI);

        // draw the level/ship select menus
        if (!this.hasSelectedLevel)
        {
            if(showCredits) {
                drawCredits();
            } else {
                this.levelOneColor = this.isMouseOnLevelOne ? "magenta" : "LightBlue";
                colorRect(this.levelOneX, this.levelOneY, this.levelButtonWidth, this.levelButtonHeight, this.levelOneColor);
                colorTextCenter("level 1",this.levelOneX + this.levelButtonWidth/2, 
                                215,//this.levelOneY + this.levelButtonHeight/2,
                                "black", 30, "myFont");
                this.levelTwoColor = this.isMouseOnLevelTwo ? "magenta" : "LightBlue";
                colorRect(this.levelTwoX, this.levelTwoY, this.levelButtonWidth, this.levelButtonHeight, this.levelTwoColor);
                colorText("level 2", 315, 215, "black", 30);
                this.levelThreeColor = this.isMouseOnLevelThree ? "magenta" : "LightBlue";
                colorRect(this.levelThreeX, this.levelThreeY, this.levelButtonWidth, this.levelButtonHeight, this.levelThreeColor);
                colorText("level 3", 580, 215, "black", 30);

                colorText("Press C to show credits".toLowerCase(),20,canvas.height-20,CREDITS_RGBA);
            }
        }
        else 
        {
            colorText("select your ship", 50, 200, "red", 50);

            drawBitmapCenteredWithRotation(lightRiderPicLarge, this.spaceshipOneX, this.spaceshipOneY, -Math.PI/2, lightRiderPicLarge.width, lightRiderPicLarge.height);
            if (this.isMouseOnSpaceshipOne || this.isSpaceshipOneSelected){
                canvasContext.lineWidth = 5;
                strokeRect(this.spaceshipOneX - lightRiderPicLarge.width/2, 
                        this.spaceshipOneY - lightRiderPicLarge.height/2,
                        lightRiderPicLarge.width, lightRiderPicLarge.height, "red");
            }

            drawBitmapCenteredWithRotation(darkTravelerPicLarge, this.spaceshipTwoX, this.spaceshipTwoY, -Math.PI/2, darkTravelerPicLarge.width, darkTravelerPicLarge.height);
            if (this.isMouseOnSpaceshipTwo || this.isSpaceshipTwoSelected){
                canvasContext.lineWidth = 5;
                strokeRect(this.spaceshipTwoX - darkTravelerPicLarge.width/2, 
                        this.spaceshipTwoY - darkTravelerPicLarge.height/2,
                        darkTravelerPicLarge.width, darkTravelerPicLarge.height, "red");
            }

            drawBitmapCenteredWithRotation(playerPicLarge, this.spaceshipThreeX, this.spaceshipThreeY, -Math.PI/2, playerPicLarge.width, playerPicLarge.height);
            if (this.isMouseOnSpaceshipThree || this.isSpaceshipThreeSelected){
                canvasContext.lineWidth = 5;
                strokeRect(this.spaceshipThreeX - playerPicLarge.width/2, 
                        this.spaceshipThreeY - playerPicLarge.height/2,
                        playerPicLarge.width, playerPicLarge.height, "red");
            }

            if (this.isSpaceshipOneSelected || this.isSpaceshipTwoSelected || this.isSpaceshipThreeSelected)
            {
                var playButtonColor = this.isMouseOnPlayButton ? "magenta" : "LightBlue";
                colorRect(this.playButtonX, this.playButtonY, this.playButtonWidth, this.playButtonHeight, playButtonColor);
                colorText("go", 350, this.playButtonY + 70, "black", 50);
            }
        }
    }

    this.handleMousePosition = function()
    {
        if (!menuMode) return;

        if (!this.hasSelectedLevel)
        {
            if (mouseOnScreenX > this.levelOneX && mouseOnScreenX < this.levelOneX + this.levelButtonWidth &&
                mouseOnScreenY > this.levelOneY && mouseOnScreenY < this.levelOneY + this.levelButtonHeight)
            {
                this.isMouseOnLevelOne = true;
            }
            else if (this.isMouseOnLevelOne)
            {
                this.isMouseOnLevelOne = false;
            }

            if (mouseOnScreenX > this.levelTwoX && mouseOnScreenX < this.levelTwoX + this.levelButtonWidth &&
                mouseOnScreenY > this.levelTwoY && mouseOnScreenY < this.levelTwoY + this.levelButtonHeight)
            {
                this.isMouseOnLevelTwo = true;
            }
            else if (this.isMouseOnLevelTwo)
            {
                this.isMouseOnLevelTwo = false;
            }
            
            if (mouseOnScreenX > this.levelThreeX && mouseOnScreenX < this.levelThreeX + this.levelButtonWidth &&
                mouseOnScreenY > this.levelThreeY && mouseOnScreenY < this.levelThreeY + this.levelButtonHeight)
            {
                this.isMouseOnLevelThree = true;
            }
            else if (this.isMouseOnLevelThree)
            {
                this.isMouseOnLevelThree = false;
            }
        }
        else if (!this.isSpaceshipOneSelected && !this.isSpaceshipTwoSelected && !this.isSpaceshipThreeSelected)
        {
            if (mouseOnScreenX > this.spaceshipOneX - lightRiderPicLarge.width / 2 && mouseOnScreenX < this.spaceshipOneX + lightRiderPicLarge.width / 2 &&
                mouseOnScreenY > this.spaceshipOneY - lightRiderPicLarge.height / 2 && mouseOnScreenY < this.spaceshipOneY + lightRiderPicLarge.height / 2)
            {
                this.isMouseOnSpaceshipOne = true;
            }
            else if (this.isMouseOnSpaceshipOne)
            {
                this.isMouseOnSpaceshipOne = false;
            }
    
            if (mouseOnScreenX > this.spaceshipTwoX - darkTravelerPicLarge.width / 2 && mouseOnScreenX < this.spaceshipTwoX + darkTravelerPicLarge.width / 2 &&
                mouseOnScreenY > this.spaceshipTwoY - darkTravelerPicLarge.height / 2 && mouseOnScreenY < this.spaceshipTwoY + darkTravelerPicLarge.height / 2)
            {
                this.isMouseOnSpaceshipTwo = true;
            }
            else if (this.isMouseOnSpaceshipTwo)
            {
                this.isMouseOnSpaceshipTwo = false;
            }
    
            if (mouseOnScreenX > this.spaceshipThreeX - playerPicLarge.width / 2 && mouseOnScreenX < this.spaceshipThreeX + playerPicLarge.width / 2 &&
                mouseOnScreenY > this.spaceshipThreeY - playerPicLarge.height / 2 && mouseOnScreenY < this.spaceshipThreeY + playerPicLarge.height / 2)
            {
                this.isMouseOnSpaceshipThree = true;
            }
            else if (this.isMouseOnSpaceshipThree)
            {
                this.isMouseOnSpaceshipThree = false;
            }
        }
        else
        {
            if (mouseOnScreenX > this.playButtonX && mouseOnScreenX < this.playButtonX + this.playButtonWidth &&
                mouseOnScreenY > this.playButtonY && mouseOnScreenY < this.playButtonY + this.playButtonHeight)
            {
                this.isMouseOnPlayButton = true;
            }
            else if (this.isMouseOnPlayButton)
            {
                this.isMouseOnPlayButton = false;
            }
        }
    }

    this.handleMouseClick = function()
    {
        if (!this.hasSelectedLevel)
        {
            if (this.isMouseOnLevelOne)
            {
                this.isMouseOnLevelOne = false;
                currentLevelIdx = 0;
                this.hasSelectedLevel = true;
            }
            else if (this.isMouseOnLevelTwo)
            {
                this.isMouseOnLevelTwo = false;
                currentLevelIdx = 1;
                this.hasSelectedLevel = true;
            }
            else if (this.isMouseOnLevelThree)
            {
                this.isMouseOnLevelThree = false;
                currentLevelIdx = 2;
                this.hasSelectedLevel = true;
            }
        }
        else if (!this.isSpaceshipOneSelected && !this.isSpaceshipTwoSelected && !this.isSpaceshipThreeSelected)
        {
            if (this.isMouseOnSpaceshipOne)
            {
                this.isSpaceshipOneSelected = true;
            }
            else if (this.isMouseOnSpaceshipTwo)
            {
                this.isSpaceshipTwoSelected = true;
            }
            else if (this.isMouseOnSpaceshipThree)
            {
                this.isSpaceshipThreeSelected = true;
            }
        }
        else
        {
            if (this.isMouseOnPlayButton)
            {
                if (this.isSpaceshipOneSelected)
                {
                    player.pic = lightRiderPic;
                    player.stunnedPic = stunnedLightriderSpriteSheet;
                    
                    opponents[0].pic = darkTravelerPic;
                    opponents[0].stunnedPic = stunnedDarktravelerSpriteSheet;
                    
                    opponents[1].pic = playerPic;
                    opponents[1].stunnedPic = stunnedOpponentSpriteSheet;
                }
                else if (this.isSpaceshipTwoSelected)
                {
                    player.pic = darkTravelerPic;
                    player.stunnedPic = stunnedDarktravelerSpriteSheet;
                    
                    opponents[0].pic = lightRiderPic;
                    opponents[0].stunnedPic = stunnedLightriderSpriteSheet;
                    
                    opponents[1].pic = playerPic;
                    opponents[1].stunnedPic = stunnedOpponentSpriteSheet;
                }
                else
                {
                    player.pic = playerPic;
                    player.stunnedPic = stunnedOpponentSpriteSheet;
                    
                    opponents[0].pic = lightRiderPic;
                    opponents[0].stunnedPic = stunnedLightriderSpriteSheet;
                    
                    opponents[1].pic = darkTravelerPic;
                    opponents[1].stunnedPic = stunnedDarktravelerSpriteSheet;
                }
                menuMode = false;
                loadLevel(currentLevelIdx);
            }
        }
    }
}

var mainMenu = new MainMenu();

function drawCredits() {
    colorRect(0, 0, canvas.width, canvas.height, 'black');
    canvasContext.fillStyle = 'cyan';

    var lineX = 20;
    var lineY = 20;
    var creditsSize = 17;
    var lineSkip = creditsSize+5;
    canvasContext.font = creditsSize+"px Helvetica";
    for(var i=0;i<creditsList.length;i++) {
        canvasContext.fillText(creditsList[i], lineX, lineY+=lineSkip);
    }
}

var creditsList = [
"Ian Cherabier: Project lead, core gameplay, AI waypoint system, main track editor functionality, minimap, main level design, core collision system, real-time spatial debugging visualizations, asset integration, surface backgrounds, calculating relative vehicle places, menu with scrolling background image, custom font selection",
"Michael \"Misha\" Fewkes: Audio manager, dynamic doppler sounds, relative sound source panning, engine sounds, sound mixing",
"Stebs: Background music, stun bomb functionality and track pickup, smoke trail, player shots, stun effect animation, sounds (e-bomb, pickup), waypoint authoring improvements, spiral level track",
"Gonzalo Delgado: Light rider and dark traveler ships, graviton shield animation, e-bomb art, palm tree sprite",
"Christer \"McFunkypants\" Kaitila: Track cached rendering optimization, decal system, assorted decal effects authoring, light trails, track editor UI buttons, streetlights and rubble decorations, font fix, credit renderer",
"Randy Tan Shaoxian: Speed-based zoom, countdown at start, lap indicator, laps as part of level data, pause toggle",
"H Trayford: Level fade transition effect, decal optimization, circle-circle collision support, debugging cleanup",
"Ashleigh M.: El Dorado comet slider art",
"Tyler Funk: Camera rotation interpolatation",
" ",
"Game developed by members of HomeTeamGameDev.com Apollo Group",
" ",
"- Press C or click anywhere to return -"
];

function lineWrapCredits() { // note: gets calling immediately after definition!
  const newCut = [];
  var maxLineChar = 95;
  var findEnd;

  for(let i = 0; i < creditsList.length; i++) {
    const currentLine = creditsList[i];
    for(let j = 0; j < currentLine.length; j++) {
      /*const aChar = currentLine[j];
      if(aChar === ":") {
        if(i !== 0) {
          newCut.push("\n");
        }

        newCut.push(currentLine.substring(0, j + 1));
        newCut.push(currentLine.substring(j + 2, currentLine.length));
        break;
      } else*/ if(j === currentLine.length - 1) {
        if((i === 0) || (i >= creditsList.length - 2)) {
          newCut.push(currentLine);
        } else {
          newCut.push(currentLine.substring(0, currentLine.length));
        }
      }
    }
  }

  const newerCut = [];
  for(var i=0;i<newCut.length;i++) {
    while(newCut[i].length > 0) {
      findEnd = maxLineChar;
      if(newCut[i].length > maxLineChar) {
        for(var ii=findEnd;ii>0;ii--) {
          if(newCut[i].charAt(ii) == " ") {
            findEnd=ii;
            break;
          }
        }
      }
      newerCut.push(newCut[i].substring(0, findEnd));
      newCut[i] = newCut[i].substring(findEnd, newCut[i].length);
    }
  }

  creditsList = newerCut;
}
lineWrapCredits(); // note: calling immediately as part of init, outside the function