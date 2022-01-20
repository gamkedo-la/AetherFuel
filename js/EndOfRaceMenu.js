function EndRaceMenu()
{
    this.isActive = false;

    this.replayButtonX = 250
    this.replayButtonY = 300

    this.replayButtonWidth = 300
    this.replayButtonHeight = 100

    this.menuButtonX = 250
    this.menuButtonY = 450

    this.menuButtonWidth = 300
    this.menuButtonHeight = 100

    this.isMouseOnReplayButton = false;
    this.isMouseOnMenuButton = false;

    this.draw = function()
    {
        if (!this.isActive) return;
        clearScreen("black");

        var playerPositionText = playerPositionInRace + "th";
        if (playerPositionInRace == 1) playerPositionText = playerPositionInRace + "st";
        else if (playerPositionInRace == 2) playerPositionText = playerPositionInRace + "nd";
        else if (playerPositionInRace == 3) playerPositionText = playerPositionInRace + "rd";

        colorText("you were " + playerPositionText, 110, 200, "red", 50);

        var replayButtonColor = this.isMouseOnReplayButton ? "magenta" : "LightBlue";
        colorRect(this.replayButtonX, this.replayButtonY, this.replayButtonWidth, this.replayButtonHeight, replayButtonColor);
        colorText("replay", 320, this.replayButtonY + 65, "black", 40);

        var menuButtonColor = this.isMouseOnMenuButton ? "magenta" : "LightBlue";
        colorRect(this.menuButtonX, this.menuButtonY, this.menuButtonWidth, this.menuButtonHeight, menuButtonColor);
        colorText("menu", 330, this.menuButtonY + 65, "black", 40);
    }

    this.setActive = function(value)
    {
        this.isActive = value;
    }

    this.handleMousePosition = function()
    {
        if (!this.isActive) return;

        if (mouseOnScreenX > this.replayButtonX && mouseOnScreenX < this.replayButtonX + this.replayButtonWidth &&
            mouseOnScreenY > this.replayButtonY && mouseOnScreenY < this.replayButtonY + this.replayButtonHeight)
        {
            this.isMouseOnReplayButton = true;
        }
        else if (this.isMouseOnReplayButton)
        {
            this.isMouseOnReplayButton = false;
        }

        if (mouseOnScreenX > this.menuButtonX && mouseOnScreenX < this.menuButtonX + this.menuButtonWidth &&
            mouseOnScreenY > this.menuButtonY && mouseOnScreenY < this.menuButtonY + this.menuButtonHeight)
        {
            this.isMouseOnMenuButton = true;
        }
        else if (this.isMouseOnMenuButton)
        {
            this.isMouseOnMenuButton = false;
        }
    }

    this.handleMouseClick = function()
    {
        if(!this.isActive) return;

        if (this.isMouseOnMenuButton)
        {
            mainMenu.load();
        }
        else if (this.isMouseOnReplayButton)
        {
            this.setActive(false);
            loadLevel(currentLevelIdx);
        }
    }

}

var endRaceMenu = new EndRaceMenu();