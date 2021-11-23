function drawBitmapCenteredWithRotation(bitmap, xPos, yPos, angle, width, height)
{
    canvasContext.save();
    canvasContext.translate(xPos, yPos);
    canvasContext.rotate(angle);
    canvasContext.drawImage(bitmap, -bitmap.width/2, -bitmap.height/2, width, height);
    canvasContext.restore();
}

//image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
function drawBitmapFromSpriteSheetCenteredWithRotation
    (bitmap, sheetIndex,
    indexWidth,indexHeight,
    destinationXPos, destinationYPos, 
    angle, width, height)
{
    canvasContext.save();
    canvasContext.translate(destinationXPos, destinationYPos);
    canvasContext.rotate(angle);
    canvasContext.drawImage(bitmap, sheetIndex * indexWidth,0, indexWidth,indexHeight,
         -width/2, -height/2, width,height);
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

function areaWithinPolygon(x1, y1, x2, y2, x3, y3, x4, y4, color)
{
    canvasContext.fillStyle = color;
    canvasContext.globalAlpha = 0.25;
    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.lineTo(x3, y3);
    canvasContext.lineTo(x4, y4);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.globalAlpha = 1.0;
}