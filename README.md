# Pathfinding Visualizer

![Screenshot of GUI](https://github.com/user-attachments/assets/223fc123-13d4-469a-86dd-8ca482cd99c2)


**Pathfinding Visualizer** is a user-friendly GUI to visualize and test pathfinding algorithms. It includes built-in tools that let programmers easily integrate their own custom algorithms with minimal setup—no need to build a visualization system from scratch—just focus on writing your algorithm, and everything else is handled.

The GUI supports adjustable grid size, drawing of start/end points and obstacles, and speed control for algorithm visualization.

This project is desgined for experimentation and algorithm development.


## 1. Quick Start

To install and run the GUI locally, see INSTALL_AND_RUN.md.

## 2. Algorithm Integration

Learn how to create and visualize your pathfinding algorithm in the GUI: VISUALIZE_YOUR_ALGORITHM.md.

## 3. Features & GUI Usage

### Interactive Grid

**Click and drag to draw the start and end nodes, as well as obstacles**. Obstacles appear in dark gray :black_large_square:, the start node is green :green_square:, and the end node is red :red_square:. To draw obstacles, the end node has to be placed; to draw the end node, the start node has to be placed.

To erase, click and drag over any existing element. To reposition the start or end node, erase it first, then draw again—the placement order will be respected.

**Note:** The algorithm won’t run unless both the start and end nodes are placed.

### Grid Size Slider

**Move the slider to select the number of columns in the grid**, with the number of rows automatically calculated to maintain the grid’s aspect ratio. The slider ranges from 17 to 119 and only allows odd numbers, ensuring both columns and rows are always odd. By default, the grid starts with 29 columns.

### Clear grid button

Clears the grid by erasing all drawn elements.

### Play/Stop button

**Press the play button (▶️) to run the pathfinding algorithm in the grid**. Once pressed, it turns into a stop button (⏹️). **Pressing stop halts the algorithm and resets the grid to its pre-run state**, removing explored nodes and the path found.

**Notes:**

- Changing the grid size or pressing the clear grid button will also stop the algorithm.

- If the start and end nodes are not placed, the algorithm won’t run even if the play button is pressed.

### Speed Control button

Controls the speed of the visualization when running the algorithm. It toggles between three speeds, from slower to faster, each time you press it.

## 4. Internal Structure

The internal structure and logic of the code for this project explained: CODEBASE.md.

## 5. Contributing

If you are interested on contributing to this project, see how you can do it here: CONTRIBUTING.md.
