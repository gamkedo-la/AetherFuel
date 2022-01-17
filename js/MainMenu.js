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

    this.isLevelOneSelected = false;
    this.isLevelTwoSelected = false;
    this.isLevelThreeSelected = false;

    this.draw = function()
    {
        clearScreen("black");

        this.levelOneColor = this.isLevelOneSelected ? "magenta" : "LightBlue";
        colorRect(this.levelOneX, this.levelOneY, this.levelButtonWidth, this.levelButtonHeight, this.levelOneColor);
        colorText("Level 1", 50, 215, "black", 50);

        this.levelTwoColor = this.isLevelTwoSelected ? "magenta" : "LightBlue";
        colorRect(this.levelTwoX, this.levelTwoY, this.levelButtonWidth, this.levelButtonHeight, this.levelTwoColor);
        colorText("Level 2", 315, 215, "black", 50);

        this.levelThreeColor = this.isLevelThreeSelected ? "magenta" : "LightBlue";
        colorRect(this.levelThreeX, this.levelThreeY, this.levelButtonWidth, this.levelButtonHeight, this.levelThreeColor);
        colorText("Level 3", 580, 215, "black", 50);
    }

    this.handleMousePosition = function()
    {
        if (!menuMode) return;

        if (mouseOnScreenX > this.levelOneX && mouseOnScreenX < this.levelOneX + this.levelButtonWidth &&
            mouseOnScreenY > this.levelOneY && mouseOnScreenY < this.levelOneY + this.levelButtonHeight)
        {
            this.isLevelOneSelected = true;
        }
        else if (this.isLevelOneSelected)
        {
            this.isLevelOneSelected = false;
        }

        if (mouseOnScreenX > this.levelTwoX && mouseOnScreenX < this.levelTwoX + this.levelButtonWidth &&
            mouseOnScreenY > this.levelTwoY && mouseOnScreenY < this.levelTwoY + this.levelButtonHeight)
        {
            this.isLevelTwoSelected = true;
        }
        else if (this.isLevelTwoSelected)
        {
            this.isLevelTwoSelected = false;
        }
        

        if (mouseOnScreenX > this.levelThreeX && mouseOnScreenX < this.levelThreeX + this.levelButtonWidth &&
            mouseOnScreenY > this.levelThreeY && mouseOnScreenY < this.levelThreeY + this.levelButtonHeight)
        {
            this.isLevelThreeSelected = true;
        }
        else if (this.isLevelThreeSelected)
        {
            this.isLevelThreeSelected = false;
        }
    }

    this.handleMouseClick = function()
    {
        if (this.isLevelOneSelected)
        {
            menuMode = false;
            this.isLevelOneSelected = false;
            loadLevel(0);
        }
        else if (this.isLevelTwoSelected)
        {
            menuMode = false;
            this.isLevelTwoSelected = false;
            loadLevel(1);
        }
        
        else if (this.isLevelThreeSelected)
        {
            menuMode = false;
            this.isLevelThreeSelected = false;
            loadLevel(2);
        }
    }
}

var mainMenu = new MainMenu();