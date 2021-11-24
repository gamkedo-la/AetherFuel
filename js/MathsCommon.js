function clipBetween(value, minValue, maxValue)
{
    return Math.min(maxValue, Math.max(minValue, value));
}

function lerp(from, to, amount) {
    return (1 - amount) * from + amount * to;
}

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
};

function radToDeg(rad) {
  return rad / (Math.PI / 180);
};

function distanceBetweenTwoPoints(p1, p2) {
    var x = p2.x - p1.x;
    var y = p2.y - p1.y;
    return Math.sqrt(x * x + y * y);
};

function angleBetweenTwoPoints(p1, p2) {
    return Math.atan2((p2.y-p1.y),(p2.x-p1.x));
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}