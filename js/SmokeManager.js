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