# Code Structure & How the Core Components Work

![Diagram](https://github.com/user-attachments/assets/dfa63aa7-c686-4aca-b595-4bfd1ae3e718)





> [!NOTE]
> This diagram is a visual support to help understand how the core components of the code communicate with each other.
> It shouldn't be taken as an exact reference to how the code is structured.

## Components Overview

This project has 3 core components: the code in `gui.js`, the `grid` object and `algorithmTools` object. 
Together, they connect the graphic user interface (GUI) with the pathfinding algorithm.

- `gui.js` acts as the central hub were everything is wired together. User inputs—such as mouse events, button clicks, and slider changes—are connected to the `grid` object, the `algorithmTools` object, and the pathfinding algorithm.

- The `grid` object encapsulates everything related to the grid. It functions as a self-contained component of the GUI, with methods for:
  - Calculating square sizes and number of rows based on the current column count and canvas dimensions.
  - Detecting which square the user interacts with.
  - Coloring squares accordingly.
  - Managing and storing the state of each square—whether it’s empty, an obstacle, the start node, or the end node.
  - And more.

- The `algorithmTools` object serves 2 purposes:
  
  **1.** It acts as a communication bridge between the GUI and the running algorithm. This includes passing control signals such as whether the algorithm can currently run and the speed control for visualization.
  
  **2.** It provides a toolkit to support algorithm development. Currently, this only includes a delay method used for animation pacing, but the plan is to expand it with utilities (like a method that returns neighboring nodes that aren’t obstacles), making algorithm creation simpler and more enjoyable.

Both `grid` and `algorithmTools` are imported into the pathfinding algorithm files, giving the algorithms direct access to the methods and data they need to function and control their own execution and visualization. Both objects are also imported into `gui.js`, where they are connected to the GUI inputs.


## The `grid` Object

### Grid Initialization with `grid.initialize()` method

```js
grid.initialize = function (columns, canvas) {
  this.columns = columns;
  this.canvas = canvas;
  this.ctx = this.canvas.getContext("2d");

  this.measureGrid()
  this.generateSquaresStates()
  this.generateGrid()
}
```

When running the project, at first the GUI displays an empty canvas—no grid is present.

The `grid.initialize()` method does 4 things:

1. It gathers the information needed for the grid to work: **number of columns** and **canvas element** (used for drawing and for getting the canvas size). These 2 are passed as arguments to the `grid.initialize()` method.
2. Based on the number of columns and canvas size, it uses the `grid.measureGrid()` method to calculate: the size each square should have, how many rows the grid should contain, and the padding needed to center the grid on the canvas. 
3. It stores the state of each square of the grid in the `grid.squaresStates` property using the `grid.generateSquaresStates()` method. Since the grid is just being created,  all squares start as “empty".
4. It draws the grid on the canvas with the `grid.generateGrid()` method, based on the measures taken with `grid.measureGrid()`.

### The `grid.measureGrid()` Method

```js
grid.measureGrid = function () {
  this.squareSize = Math.floor(((this.canvas.clientWidth-50) / this.columns) - ((this.columns/180)));
  this.rows = Math.round((this.canvas.clientHeight-60) / (this.squareSize + 1) - 1);
  if (!(this.rows%2)){this.rows++} // Ensure odd number of rows
  this.horizontalPadding = Math.round((this.canvas.clientWidth - ((this.squareSize+1) * (this.columns-2))) / 2); // Padding for centering the grid horizontally
  this.verticalPadding = Math.round(((this.canvas.clientHeight - ((this.squareSize+1) * (this.rows)))-1) / 2); // Padding for centering the grid vertically
}
```
The main formulas are these:

- Square size = `canvas width / columns`
- Rows = `canvas height / (square size + 1)`
- Horizontal padding = `(canvas width - ((square size + 1) * (columns - 2))) / 2`
- Vertical padding = `(canvas height - ((square size + 1) * rows)) / 2`

All other elements added to those formulas are just adjustments to make the grid look better. Also, the `1` in `(square size + 1)` represents the width of the space between each square.

Important notes about the measurements:

- **Avoiding blurry squares using `Math.floor()` and `Math.round()`:** `squareSize`, `horizontalPadding`, and `verticalPadding` must be integers. If not, squares are drawn in the canvas at fractional pixel positions, causing pixels to be "partially occupied". The browser then blends colors between adjacent pixels to approximate the shape, creating a blurry or anti-aliased effect (known as _sub-pixel rendering_). Using whole numbers ensures each square aligns cleanly with the canvas pixels, keeping the visuals sharp and clear.

- **Why use an odd number of rows and columns?:** This prepares the grid for a future maze-generation feature. The maze algorithm requires an odd-sized grid to generate clean, symmetrical paths—otherwise, it looks uneven at the edges. Though not currently needed, this constraint is in place for later use.

- **Why subtract 2 from the number of columns?:** In several parts of the code for this project, 2 is subtracted from the column count. This isn’t an intentional design choice—it’s a workaround that needs to be fixed. While I don't exactly remember why I did it, I believe it was because the square size ended up being too big in some cases due to not well adjusted grid measurements, which caused the squares to not fit correctly within the canvas width. To compensate, the number of columns is reduced by 2 in the `grid.generateGrid()` method, and this adjustment must be reflected in other parts of the code (In this case, when calculating the `horizontalPadding` for centering the grid).

