function drawBitmapCenteredWithRotation(bitmap, xPos, yPos, angle, width, height)
{
    canvasContext.save();
    canvasContext.translate(xPos, yPos);
    canvasContext.rotate(angle);
    canvasContext.drawImage(bitmap, -bitmap.width/2, -bitmap.height/2, width, height);
    canvasContext.restore();
}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor)
{
    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX, centerY, radius, fillColor)
{
    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 10, 0, Math.PI * 2, true);
    canvasContext.fill();
}

function colorText(showWords, textX, textY, fillColor, size=30)
{
    canvasContext.fillStyle = fillColor;
    canvasContext.font = size + "px Arial";
    canvasContext.fillText(showWords, textX, textY, 1000);
}

function lineBetweenTwoPoints(x1, y1, x2, y2, color)
{
    canvasContext.strokeStyle = color;
    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.stroke();
}

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