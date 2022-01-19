var menuMode = true;

function MainMenu()
{
    this.levelOneColor = "LightBlue";
    this.levelTwoColor = "LightBlue";
    this.levelThreeColor = "LightBlue";

    this.levelButtonWidth = 250;
    this.levelButtonHeight = 200;

    this.levelOneX = 10;
    this.levelOneY = 100;

    this.levelTwoX = 275;
    this.levelTwoY = 100;

    this.levelThreeX = 540;
    this.levelThreeY = 100;

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
        clearScreen("black");

        if (!this.hasSelectedLevel)
        {
            this.levelOneColor = this.isMouseOnLevelOne ? "magenta" : "LightBlue";
            colorRect(this.levelOneX, this.levelOneY, this.levelButtonWidth, this.levelButtonHeight, this.levelOneColor);
            colorText("Level 1", 50, 215, "black", 30, "myFont");

            this.levelTwoColor = this.isMouseOnLevelTwo ? "magenta" : "LightBlue";
            colorRect(this.levelTwoX, this.levelTwoY, this.levelButtonWidth, this.levelButtonHeight, this.levelTwoColor);
            colorText("Level 2", 315, 215, "black", 30);

            this.levelThreeColor = this.isMouseOnLevelThree ? "magenta" : "LightBlue";
            colorRect(this.levelThreeX, this.levelThreeY, this.levelButtonWidth, this.levelButtonHeight, this.levelThreeColor);
            colorText("Level 3", 580, 215, "black", 30);
        }
        else 
        {
            colorText("Select your ship!", 50, 200, "red", 50);

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
                colorText("GO!", 350, this.playButtonY + 70, "black", 50);
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