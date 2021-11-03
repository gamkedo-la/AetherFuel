function BathosSystem(numRows, numCols)
{
    // Call it in main.js to define the number of rows and columns
    Level.call(this, numRows, numCols);

    // Paste here the exports you get from the editor
    this.track = [];
    
    this.getPlayerStart();
}
BathosSystem.prototype = Object.create(Level.prototype);
BathosSystem.prototype.constructor = BathosSystem;