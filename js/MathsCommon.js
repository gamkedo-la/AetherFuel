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

function distance(p1, p2) {
    var x = p2.x - p1.x;
    var y = p2.y - p1.y;
    return Math.sqrt(x * x + y * y);
};

function angle(p1, p2) {
    return Math.atan((p2.x-p1.x)/(p2.y-p1.y));
}