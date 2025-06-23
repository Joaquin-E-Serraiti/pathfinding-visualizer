# How to visualize your algorithm in this GUI

Once you have navigated to `Scripts/pathfinding algorithms/` and opened `myAlgorithm.js`, you will see:
- The `grid` and `algorithmTools` objects are imported into the file.
- There is a `myAlgorithm` function where you can write the code for your algorithm.

This documentation will explain everything you need to know when creating an algorithm or integrating one to be visualized in this GUI.

## Square Indexing

Each square in the grid is identified by a single index ranging from 0 to N-1, where N is the total number of squares (columns * rows). Instead of being identified by a [column][row] pair, the 2D position is flattened into a single index, calculated as index = row * columns + column.

![Square Indexing](./images/Indexing.jpg)


## Squares States

Each square has 1 of 4 possible states, encoded as a 2-bit integer: 
- `0b00` = empty (white)
- `0b01` = start node (green)
- `0b10` = end node (red)
- `0b11` = obstacle (dark gray)

## Methods and Properties

The algorithm is connected to the GUI through the methods and properties of the `grid` and `algorithmTools` objects.

### `grid`

- `grid.getSquareState(index)` : returns the state of the square with the given index.
- `grid.colorSquare(index, color)` : paints the square identified by the given index, with the given color.
- `grid.startIndex` : index of the start node.
- `grid.endIndex` : index of the end node.
- `grid.rows` : number of rows in the current grid.
- `grid.columns` : number of columns in the current grid + 2. To get the actual column count, you need to subtract 2 from this value. This is an issue intended to be fixed in the future.

### `algorithmTools`

- `algorithmTools.delay(milliseconds)` : stops the algorithm for a given amount of milliseconds. Needed for setting speed of visualization.
- `algorithmTools.speedControl` : It cycles through 3 numeric values: 1, 2 and 4. If not used, speed of visualization can't be modified through the GUI when running the algorithm.
- `algorithmTools.canRun` : boolean. If true, the algorithm can run. If false, the algorithm should stop.


## `demo.js` Algorithm

Inside the `pathfinding algorithms` folder you will also see the [demo.js](./scripts/pathfinding%20algorithms/demo.js) file. It contains a simple example of an algorithm built using the methods and properties provided. It is a Breadth-First Search (BFS) pathfinding algorithm:

![Screenshot: BFS pathfinding in action](./images/Demo%20pathfinding%20algorithm%20screenshot.png)




The code for this algorithm can be used as a guide at the moment of writing your own algorithm.

## Important: Check for the `algorithmTools.canRun` Property

`algorithmTools.canRun` is set to `false` when the **Stop** button is pressed, or when the grid is resized or cleared. To ensure the algorithm execution can be controlled properly through the GUI, this line of code is required:

```js
 if (!algorithmTools.canRun) {return}
```

This makes the algorithm function stop when `algorithmTools.canRun` is `false`. It should be the first line of code in the function and also the first line of code inside important loops, for example: in the main "while" loop of the `demo.js` algorithm.



## Usage Examples

Here are some useful or interesting ideas for using the provided methods and properties.

### How to color squares

- Simple option:
```js
grid.colorSquare(currentNodeIndex,"rgb(100,100,200)");
```

- Another option:
```js
grid.colorSquare(currentNodeIndex,`rgb(100,100,${variable})`);
```
Here, the color depends on the value of `variable`. This approach can be used to create gradients and other cool visual effects.

### How to control visualization speed

- Simple option:
```js
await algorithmTools.delay(50);
```
This line of code can be used to stop the algorithm 50 milliseconds for each explored node. The speed of visualization will remain constant. It can't be controlled through the GUI.

- 2nd option:
```js
await algorithmTools.delay(50 - algorithmTools.speedControl*10);
```
With this code, speed of visualization can be controlled through the GUI. When `algorithmTools.speedControl` equals 1, this code will stop the algorithm for 40 milliseconds. When it equals 2, the code will stop the algorithm for 30 milliseconds. When it equals 4, the code will stop the algorithm for only 10 milliseconds. The speed of visualization increases.

- 3rd option:
  
Count the explored nodes, and make it so that the algorithm is only stopped after a certain amount of nodes has been explored: 
```js
if (exploredNodesCount%5 === 4) {await algorithmTools.delay(50)}
```
This will stop the algorithm every 5 nodes explored.

### How to differentiate obstacles from explorable nodes (empty squares)

This one is pretty straightforward:
```js
if (grid.getSquareState(nodeIndex) === 0b11) {continue}
```
This line of code is used inside a loop. If the node to be explored has a state of `0b11`, it is an obstacle, and the loop avoids exploring it.


## Helper functions

As long as your algorithm is defined in a callable function (e.g., `myAlgorithm()`), you can define additional functions outside of it:

```js
import { algorithmTools } from "../algorithmTools.js";
import { grid } from "../grid.js";

export async function myAlgorithm() {

  helperFunction()

  // Rest of the algorithm

}

function helperFunction() {
  // You can declare and define a function outside myAlgorithm
}
```
For example, you can have a function to calculate distances, like manhattan, euclidean, octile, etc.

## Adding multiple pathfinding algorithms

- Each pathfinding algorithm should have its own file inside the `pathfinding algorithms` folder.
- `grid` and `algorithmTools` must be imported into each file.
- The algorithm should be defined in an exported, `async` function.
- To visualize an algorithm in the GUI, import its function into `gui.js` and call it when the **Play** button is pressed (line 53 of `gui.js`):
```js
if (grid.startAndEndSet === 0b11) {myAlgorithm()}
```

In summary, each algorithm file should follow the structure of `myAlgorithm.js`:

```js
import { algorithmTools } from "../algorithmTools.js";
import { grid } from "../grid.js";

export async function myAlgorithm() {

  // Write your algorithm here!

}
```

## After Writing Your Algorithm

Once you have finished building your algorithm with the provided methods and properties, go to line 53 of the gui.js file and change:
```js
if (grid.startAndEndSet === 0b11) {aStar()}
```
to
```js
if (grid.startAndEndSet === 0b11) {myAlgorithm()}
```
That's all, well done! Now you can open the GUI and visualize your algorithm!
