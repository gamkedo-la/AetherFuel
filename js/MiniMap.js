function MiniMap()
{
    this.width = 10;
    this.height = 10;
    this.percentage = 0.2;

    this.margin_x = 10;
    this.margin_y = 10;

    this.x = 0;
    this.y = 0;

    this.setSizes = function()
    {
        this.width = this.percentage * canvas.width;
        this.height = this.percentage * canvas.height;

        this.x = canvas.width - this.width - this.margin_x;
        this.y = canvas.height - this.height - this.margin_y;
    }

    this.draw = function()
    {
        canvasContext.globalAlpha = 0.5;
        colorRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8, "black");
        colorRect(this.x, this.y, this.width, this.height, "green");
        canvasContext.globalAlpha = 1.0;
    }
}