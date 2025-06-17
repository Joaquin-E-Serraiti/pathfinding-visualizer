# Code Structure & How the Core Components Work

![Diseño sin título (3)](https://github.com/user-attachments/assets/b73031ff-74c4-474e-8121-7d5b84633679)



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

This method calculates important measures for the grid to be displayed on the canvas.

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

### The `grid.squaresStates` property

Each square in the grid is indentified by a single index ranging from 0 to N-1, where N is the total number of squares (`columns * rows`). Instead of being identified by a `[column][row]` pair, the 2D position is flattened into a single index, calculated as `index = row * columns + column`. This indexing simplifies storage and traversal by treating the grid as a continuous block of memory.

![Diseño sin título](https://github.com/user-attachments/assets/254562ff-edcf-4182-836c-d54248be6942)

If needed, you can reverse the calculation to get the column and row from a given index:

```js
row = Math.floor(index / columns)
column = index % columns
```

Each square has 1 of 4 possible states, encoded as a 2-bit integer: 
- `0b00 = empty` (white)
- `0b01 = start node` (green)
- `0b10 = end node` (red)
- `0b11 = obstacle` (dark gray)

These states are stored in `grid.squaresStates`, in a typed array with 8-bit integers as elements. Each 8-bit element contains the states of 4 consecutive squares. For example: the 1st byte stores states from indeces `0-3`, the 2nd byte stores states from indeces `4-7`, and so on.

- The `grid.getSquareState(squareIndex)` method returns the 2-bit value for the state of the square at the given index.
- The `grid.setSquareState(squareIndex, newState)` method modifies `grid.squaresStates`, replacing the state of the square at the given index with the new state.

### The `grid.manageSquareState()` method

When users click and drag on the grid, the squares are re-drawn with new colors and their states are updated.

(HERE GOES LONG IMAGE OF CURSOR IN GRID WITH COLORED SQUARES AT LEFT WITH ARROW)

**Placement order** when clicking and dragging over empty squares (state is `0b00`):
1. If the start node hasn't been placed, the empty square becomes the start node (state is `0b01`).
2. If the start node has been placed, but not the end node, the empty square becomes the end node (state is `0b10`).
3. If start and end node have been placed, the empty square becomes an obstacle (state is `0b11`).

The `grid.manageSquareState()` method takes a square index and updates its state and the color that's applied when being redrawn:
- If the square with the given index is empty (`0b00`), it updates its state following the **placement order**, and sets the appropriate color to be used during the redraw.
- If the square with the given index isn't empty, it updates its state to be empty, and updates the coloring so that the square is colored white. Essentially, it erases already drawn elements (start node, end node and obstacles).
- When placing the start or end nodes, it updates their position in the `grid.startIndex` and `grid.endIndex` properties. It also updates the `grid.startAndEndSet` property, that tells which one of the 2 nodes is placed and which one isn't.

**Note:** this method does not directly re-draw the squares with a new color. It sets the coloring for the next square that will be redrawn. The drawing is handled by the `grid.colorSquare()` method.

**Important properties used by this method:**

- `grid.startIndex` : index of the last square where the start node was placed.
- `grid.endIndex` : index of the last square where the end node was placed.
- `grid.startAndEndSet` : 2-bit integer that tells which one of the start and end nodes is placed and which one isn't. For example: `0b11` means both nodes are placed, and `0b01` means only the start node is placed. This value is reset to `0b00` when resizing or clearing the grid. The code in gui.js accesses this property to only let the pathfinding algorithm run if both nodes are placed.
- `grid.statesMap` : this map is used to update states and `grid.startAndEndSet`.
- `grid.colorToDraw` : here is stored the color that should be used for the next square to be redrawn.
- `grid.statesColorMap` : here `grid.startAndEndSet` possible values are mapped to the color a square should have when being re-drawn. Ensuring the coloring is aligned with the **placement order**.
