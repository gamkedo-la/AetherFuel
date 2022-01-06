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

function randomFloatFromInterval(min, max) {
  return Math.random() * (max - min) + min;
}

function computeDotProd(p1, p2) {
  return p1.x * p2.x + p1.y * p2.y;
}

function projectPointToSegment(p, s1, s2)
{
  var segmentLength = distanceBetweenTwoPoints(s1, s2);

  var segment = {
    "x": (s2.x - s1.x) / segmentLength,
    "y": (s2.y - s1.y) / segmentLength
  };

  var s1ToPoint = {
    "x": (p.x - s1.x),
    "y": (p.y - s1.y)
  };

  var dotProd = computeDotProd(segment, s1ToPoint);
  
  var proj = {
    "x": s1.x + dotProd * segment.x,
    "y": s1.y + dotProd * segment.y,
  };

  return proj;
}

function distanceBetweenPointAndSegment(p, s1, s2)
{
  proj = projectPointToSegment(p, s1, s2);

  return distanceBetweenTwoPoints(p, proj);
}
