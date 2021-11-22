class PuffOfSmoke
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
        this.alpha = 1;
        
        this.maxSize = 5;
        this.size = 3;
    }

    update()
    {
        this.size += 0.5;
        this.alpha -= 0.05;
    }

    draw()
    {
        if (this.size < this.maxSize)
        {
            if (this.alpha < 0.05)
            {
                return;
            }
            canvasContext.globalAlpha = this.alpha;
            colorCircle(this.x, this.y, this.size, "gray");
            canvasContext.globalAlpha = 1;
        }
    }
}

function SmokeManager()
{
    let arrayOfSmokePuffs = [];

    this.createAPuffOfSmoke = function()
    {
        let puffOfSmoke = new PuffOfSmoke(player.x, player.y);
        arrayOfSmokePuffs.push(puffOfSmoke);
    }

    this.createPuffsOfSmokeOverTime = function()
    {
        setTimeout(function() 
            { 
                smokeManager.createAPuffOfSmoke(); 
                smokeManager.createPuffsOfSmokeOverTime();
            }, 50);
    }

    this.updatePuffsOfSmoke = function()
    {
        for (let i = 0; i < arrayOfSmokePuffs.length; i++)
        {
            arrayOfSmokePuffs[i].update();
        }

        this.garbageCollectPuffsOfSmoke();
    }

    this.drawPuffsOfSmoke = function()
    {
        for (let i = 0; i < arrayOfSmokePuffs.length; i++)
        {
            arrayOfSmokePuffs[i].draw();
        }
    }

    this.garbageCollectPuffsOfSmoke = function()
    {
        for (let i = 0; i < arrayOfSmokePuffs.length; i++)
        {
            if (arrayOfSmokePuffs[i].alpha < 0.05)
            {
                arrayOfSmokePuffs.splice(i,1);
            }
        }
    }
}