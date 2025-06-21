# Code Structure & How the Core Components Work




![Diseño sin título (9)](https://github.com/user-attachments/assets/e704dd05-687d-4ab0-977b-f4541899f817)


> [!NOTE]
> This diagram is a visual support to help understand how the core components of the code communicate with each other.
> It shouldn't be taken as an exact reference to how the code is structured.

## Components Overview

This project has 4 core components: the code in `gui.js`, the pathfinding algorithm, the `grid` object and `algorithmTools` object. 
Together, they make the graphical user interface (GUI) work.

- `gui.js` acts as the central hub where everything is wired together. User inputs—such as mouse events, button clicks, and slider changes—are connected to the `grid` object, the `algorithmTools` object, and the pathfinding algorithm. 

- The `grid` object encapsulates everything related to the grid. It functions as a self-contained component of the GUI, with methods for:
  - Calculating square sizes and number of rows based on the current column count and canvas dimensions.
  - Detecting which square the user interacts with.
  - Coloring squares accordingly.
  - Managing and storing the state of each square—whether it’s empty, an obstacle, the start node, or the end node.
    
  And more.

- The `algorithmTools` object serves 2 purposes:
  
  1. It acts as a communication bridge between the GUI and the running algorithm. This includes passing control signals such as whether the algorithm can currently run and the speed control for visualization.
  
  2. It provides a toolkit to support algorithm development. Currently, this only includes a delay method used for animation pacing, but the plan is to expand it with utilities (like a method that returns neighboring nodes that aren’t obstacles), making algorithm creation simpler and more enjoyable.

- The pathfinding algorithm uses the information from `grid` to find a path from start node to end node, and it colors the grid squares to visualize the process. It controls its execution and speed of visualization by reading the control signals on `algorithmTools`.


## The `grid` Object
![Diseño sin título (5)](https://github.com/user-attachments/assets/590a8f57-12fa-4539-906e-758195114178)

> [!NOTE]
> The code for the `grid` object can be found in [grid.js](./scripts/grid.js).

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

Each square in the grid is identified by a single index ranging from 0 to N-1, where N is the total number of squares (`columns * rows`). Instead of being identified by a `[column][row]` pair, the 2D position is flattened into a single index, calculated as `index = row * columns + column`.

![Diseño sin título](https://github.com/user-attachments/assets/254562ff-edcf-4182-836c-d54248be6942)

Each square has 1 of 4 possible states, encoded as a 2-bit integer: 
- `0b00 = empty` (white)
- `0b01 = start node` (green)
- `0b10 = end node` (red)
- `0b11 = obstacle` (dark gray)

These states are stored in `grid.squaresStates`, in a `Uint8Array` where each byte packs four 2‑bit states. The 1st byte stores states from indices `0-3`, the 2nd byte stores states from indices `4-7`, and so on.

- The `grid.getSquareState(squareIndex)` method returns the 2-bit value for the state of the square at the given index.
- The `grid.setSquareState(squareIndex, newState)` method modifies `grid.squaresStates`, replacing the state of the square at the given index with the new state.

### The `grid.manageSquareState()` method

When users click and drag on the grid, the squares are re-drawn with new colors and their states are updated.






**Placement order** when clicking and dragging over empty squares (`0b00`):
1. If the start node hasn't been placed, the empty square becomes the start node (`0b01`).
2. If the start node has been placed, but not the end node, the empty square becomes the end node (`0b10`).
3. If start and end node have been placed, the empty square becomes an obstacle (`0b11`).

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

### The `grid.colorSquare()` method

This method takes a **square index** and a **color**, and redraws the square that corresponds to the given index, with the given color.

```js
grid.colorSquare = function(squareIndex, color) {
  this.ctx.fillStyle = color;
  const squarePositionX = squareIndex%(this.columns-2);
  const squarePositionY = Math.floor(squareIndex/(this.columns-2));

  this.ctx.clearRect(this.horizontalPadding+(squarePositionX*(this.squareSize+1))-1,this.verticalPadding+(squarePositionY*(this.squareSize+1))-1,this.squareSize+2,this.squareSize+2);

  this.ctx.fillRect(this.horizontalPadding+(squarePositionX*(this.squareSize+1)),this.verticalPadding+(squarePositionY*(this.squareSize+1)),this.squareSize,this.squareSize);
}

```

`squarePositionX` and `squarePositionY` are the column and row of the square. This information is used, along with the `horizontalPadding`, `verticalPadding` and `squareSize` measures taken by `grid.measureGrid()` at initialization, to know where in the canvas should the square be drawn.

**Note:** when squares are redrawn one on top of the previous one, they get a bit blurry at the edges. To avoid these blurry edges when redrawing, the previous square must be erased, and it is also necessary to erase the "border" of the square, which is the gap around it. That's why `this.ctx.clearRect()` is used, and why the area erased is bigger than the area of the redrawn square.

### The `grid.drawOnGrid()` method

This method uses `grid.manageSquareState()` and `grid.colorSquare()` for updating and drawing squares when the user clicks and drags on the grid. 

It follows this process:

1. Receives the event of the user clicking or dragging on the canvas.
2. Calculates over what square was the cursor when clicking or dragging.
3. With the index of that square, calls `grid.manageSquareState(squareIndex)` to update its state.
4. After, it calls `grid.colorSquare(squareIndex, this.colorToDraw)` to update the square color on the grid.


**How it avoids redrawing the same square multiple times in a short period of time:**

- `grid.previousSquareClicked` is used to track the index of the last square the user clicked or dragged over.
- `grid.lastDrawTime` is used to track **when** was the last square redrawn.

With the following condition, a square will be redrawn only if the square to redraw now is different from the square redrawn before, or if 600 ms have passed from the last time a square was redrawn:
```js
if (squareClicked !== this.previousSquareClicked || nowTime - this.lastDrawTime > 600)
```

**Only redraws when clicking and dragging inside the grid:**

Because the grid does not occupy the whole canvas, the `grid.drawOnGrid()` method might be called when the user clicks and drags over the canvas, but not over the grid.

The following conditional stops the `grid.drawOnGrid()` method when the cursor of the user is outside the grid when clicking or dragging.
```js
if ((squareClickedX < 0 || squareClickedY < 0) || (squareClickedX > this.columns-3 || squareClickedY > this.rows-1)) {return};
```

### The `grid.generateGrid()` method

```js
grid.generateGrid = function() {
  let color;
  this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  for (let row = 0; row < this.rows; row++) {
    for (let col = 0; col < this.columns-2; col++) {
      color = {0b00:"rgb(255 255 255)",0b01:"rgb(90 240 180)",0b10:"rgb(250 80 150)",0b11:"rgb(70 70 85)"}[this.getSquareState(row*(this.columns-2) + col)];
      this.colorSquare(row*(this.columns-2) + col, color);
    }
  }
}
```

The grid has **2 distinct representations**: 

- **Visual representation —** the grid that the user sees on the UI: squares drawn on the canvas with specific colors.
- **Data representation —** Internal information that defines the grid: number of columns and rows, square size, and the state of each square

The visual representation is generated from the data representation. In other words, the grid is drawn based on the current state of its data.

The `grid.generateGrid()` does this by looping through each square and:

- Retrieving its current state using `this.getSquareState()`.
- Mapping that to its corresponding color (`0b00`: white, `0b01`: green, `0b10`: red, `0b11`: dark gray).
- Drawing the square in position with `this.colorSquare()`.

If the grid is reset or resized, the square states are also reset to `0b00` (empty → white). This method simply renders the grid as defined by its current configuration.


## The `algorithmTools` Object

![Diseño sin título (6)](https://github.com/user-attachments/assets/b683b88b-8a01-4ad5-a4d9-c5f64025cbb3)

> [!NOTE]
> The code for the `algorithmTools` object can be found in [algorithmTools.js](./scripts/algorithmTools.js).

This object has 2 purposes:

- Serve as a **communication bridge** between `gui.js` and the pathfinding algorithm, enabling the control of its execution (run/stop and speed) with the GUI.
- Provide a **toolkit** of useful methods to make algorithm development more simple and enjoyable.

### Communication Between GUI and Algorithm

The GUI modifies 2 properties that the pathfinding algorithm reads:

- `algorithmTools.canRun` : A boolean. If `true`, the algorithm can run; if `false`, the algorithm must stop.
- `algorithmTools.speedControl` : Cycles through 3 values, allowing the algorithm to run at 3 different speeds.

### Toolkit

Currently, the only utility method is:

- `algorithmTools.delay()` : Delays execution for a given number of milliseconds. Useful for step-by-step visualization and can be combined with `algorithmTools.speedControl`.

However, here are some ideas for future additions:

- A method that returns all traversable neighboring nodes (i.e., not obstacles) for a given node index.
- Distance calculation methods (e.g., Manhattan, Euclidean, Octile, Chebyshev) to simplify heuristic implementations.



## The Pathfinding Algorithm

![Diseño sin título (10)](https://github.com/user-attachments/assets/56d136d5-c5d1-4aaf-a600-7ce7909d152e)

Every pathfinding algorithm has its own `.js` file inside the `pathfinding algorithms` folder. 

To connect an algorithm to the GUI:

- It must be wrapped in a function that can be called (e.g. `myAlgorithm()`).
- If it uses the `algorithmTools.delay()` method, the function needs to be marked as `async` for the delay to work.
- Its file needs to be imported in `gui.js`.
- The function has to be wired to the **Play** button so it can be run.

The algorithm can access every method and property it needs through the imported `grid` and `algorithmTools` objects.

### Visualization

Visualization is entirely handled by `grid.colorSquare()`. This method colors specific squares in the grid as the algorithm goes through the process of exploring nodes and finding a path. Visualization requires only one line of code, calling this method and passing the index of the node being explored and a chosen color.
 
### Execution Control

To allow the GUI to stop the algorithm cleanly (when pressing **Stop**, resizing or clearing the grid), the algorithm must regularly check:

```js
if (!algorithmTools.canRun) {return}
```

### Algorithms can be freely designed

They can follow any logic and use any heuristic. Any color can be chosen for visualization, and speed can be fully customized — you're not limited by the `algorithmTools.speedControl` values.

### Available Algorithms

- `demo.js` : A minimal example of a working algorithm using `grid` and `algorithmTools`.
- `aStar.js` : A functional A* algorithm. It implements a visual gradient effect using `grid.colorSquare()`.
- `myAlgorithm.js`: A blank template to help you create your own algorithm following the project conventions.

Currently, algorithm selection is manual — `gui.js` must be modified to switch algorithms. A selector feature in the GUI is planned for a future update.

## The Code in `gui.js`

![Diseño sin título (7)](https://github.com/user-attachments/assets/c9223ba3-369e-4eb4-ba43-2f72d37ebfde)

> [!NOTE]
> See the code in [gui.js](./scripts/gui.js).

This file handles user interaction and connects inputs to the app's functionality.

The pathfinding algorithms, `grid` and `algorithmTools` are imported into `gui.js`.

The grid is initialized and drawn onto the canvas with:

```js
grid.initialize(input.value, canvas)
```
Where `input.value` is the default number of columns selected with the slider, and `canvas` is the HTML `<canvas>` element.

### Event Listeners for Buttons and Slider

- **Clear Grid button:** Stops the algorithm and calls the `grid.clearGrid()` method.
- **Play/Stop button:** If the algorithm isn't running and the start and end nodes are placed, it runs the algorithm. If the algorithm is running, it stops the algorithm and calls the `grid.generateGrid()` method to reset the grid to its state before running the algorithm.
- **Speed button:** Cycles `algorithmTools.speedControl` through 3 different numeric values.
- **Grid Size Slider:** When interacting with the slider, stops the algorithm, updates the number of columns and calls `grid.resizeGrid()`, passing the new number of columns.


### Clicking and Dragging on canvas

Pointer events are used instead of mouse events so that this interaction works across many devices. However, for simplicity I'll still refer to the interaction as "clicking and dragging".

- `isMouseDown` is boolean used to track if the pointer is being pressed or not.

- **pointerdown:** when the pointer is pressed, `isMouseDown` is set to `true`. If the algorithm isn't running, `grid.drawOnGrid(e)` is called.
- **pointerup:** when the pointer stops being pressed, `isMouseDown` is set to `false`.
- **pointermove:** when the pointer is moving within the canvas, it checks if the pointer is also being pressed (not just moving), and if it is, it calls `grid.drawOnGrid(event)`. `requestAnimationFrame()` is used to throttle drawing updates and align them with the browser’s refresh rate for better performance. The `isDrawing` flag ensures only one drawing operation runs at a time, preventing overlapping calls.


Grid interaction only happens in the canvas, but the pointer might be released outside of it. To avoid bugs, `pointerdown` and `pointermove` are only listened on the canvas, while `pointerup` is listened in the entire window.

`event.preventDefault()` and `{ passive: false }` are used to prevent the default scroll behavior on touch devices when interacting with the grid. (This currently doesn’t work as intended. Along with some layout issues, it's something to fix to improve accessibility across devices)


## Final Notes

This documentation is intended to help understand how the project is structured and how the main components work together.

If you’re looking to create or test your own pathfinding algorithm and visualize it in this GUI, see the separate [VISUALIZE_YOUR_ALGORITHM.md](./VISUALIZE_YOUR_ALGORITHM.md) guide.

If you have ideas for improving the code or any other aspect of the project and want to contribute, check out [CONTRIBUTING.md](./CONTRIBUTING.md).

This is the first project I’ve published with the intention of being seen and used by others. I’m still learning about GitHub workflows and project maintenance. Any feedback, questions, suggestions, or help is welcome as I continue developing and improving the project.
