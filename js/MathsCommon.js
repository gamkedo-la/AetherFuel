function clipBetween(value, minValue, maxValue)
{
    return Math.min(maxValue, Math.max(minValue, value));
}