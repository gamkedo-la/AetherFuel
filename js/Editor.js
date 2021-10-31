var editorMode = false;
var editorPaintType = 0;


function Editor()
{
    this.x = 0;
    this.y = 0;
    this.ang = 0;

    this.speed = 20.0;

    this.isMovingUp = false;
    this.isMovingLeft = false;
    this.isMovingDown = false;
    this.isMovingRight = false;

    this.initialize = function()
    {
        this.x = 0;
        this.y = canvas.height;
    }

    this.move = function()
    {
        if(this.isMovingUp)
        {
            this.y -= this.speed;
        }

        if(this.isMovingLeft)
        {
            this.x -= this.speed;
        }

        if(this.isMovingDown)
        {
            this.y += this.speed;
        }

        if(this.isMovingRight)
        {
            this.x += this.speed;
        }
    }

    this.click = function()
    {
        if (!editorMode){ return; }

        trackGrid[mouseIdx] = editorPaintType;
    }

    this.draw = function()
    {
        if (!editorMode){ return; }

        this.displayEditorLabel();

        var useImg = trackPix[editorPaintType];

        colorRect(mouseX - useImg.width / 2 - 2,
                  mouseY - useImg.height / 2 - 2,
                  useImg.width + 4,
                  useImg.height + 4,
                  "black")
                
        canvasContext.drawImage(useImg,
                                mouseX - useImg.width / 2,
                                mouseY - useImg.height / 2);
    }
    
    this.displayEditorLabel = function() 
    {
        canvasContext.globalAlpha = 0.75;
        colorRect(0, 0, 125, 40, "red");
        canvasContext.globalAlpha = 1.0;
        colorText("EDITOR", 5, 30, "black");
    }

    this.setKey = function(keyCode)
    {
        if (!editorMode)
        {
            if (keyCode == KEY_TAB)
            {
                editorMode = true;
            }
            return;
        }

        switch(keyCode)
        {
            case KEY_NUM_ROW_1:
                editorPaintType = TRACK_ROAD;
                break;
            
            case KEY_NUM_ROW_2:
                editorPaintType = TRACK_WALL;
                break;

            case KEY_NUM_ROW_3:
                editorPaintType = TRACK_GOAL;
                break;

            case KEY_E:
                var trackGridExport = trackGrid.slice();
                trackGridExport[playerStart] = TRACK_START;
                console.log(trackGridExport);
                break;

            case KEY_TAB:
                editorMode = false;
                break;

            case KEY_W:
                this.isMovingUp = true;
                break;
        
            case KEY_A:
                this.isMovingLeft = true;
                break;
    
            case KEY_S:
                this.isMovingDown = true;
                break;

            case KEY_D:
                this.isMovingRight = true;
                break;
                                                    
            default:
                break;
        }
    }

    this.releaseKey = function(keyCode)
    {
        switch(keyCode)
        {
            case KEY_W:
                this.isMovingUp = false;
                break;
        
            case KEY_A:
                this.isMovingLeft = false;
                break;
    
            case KEY_S:
                this.isMovingDown = false;
                break;

            case KEY_D:
                this.isMovingRight = false;
                break;
                                                    
            default:
                break;
        }
    }
}