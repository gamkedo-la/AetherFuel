function clipBetween(value, minValue, maxValue)
{
    return Math.min(maxValue, Math.max(minValue, value));
}

function lerp(from, to, amount) {
    return (1 - amount) * from + amount * to;
}
