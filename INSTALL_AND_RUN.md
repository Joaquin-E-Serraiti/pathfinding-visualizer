# How to Install & Run the Project

## 1. Clone the Repository
Go to the repository on GitHub, click the green `<> Code` button, and select **Download ZIP** from the dropdown menu.

## 2. Open with a Local Server
Because the project uses JavaScript modules, it must be run through a local server. Here are two simple options:

### Option A: Using VS Code + Live Server

- Open the project folder in VS Code.

- Install the Live Server extension (if you haven’t already).

- Right-click `index.html` and select **Open with Live Server**.


### Option B: Using Python (no setup needed)

If you have Python installed, you can run a local server using the terminal.

**1st Step - Open a terminal:**

> [!TIP]
> **Use your code editor’s terminal**. If you're using a code editor like VS Code, you can open a terminal inside it: 
> Go to Terminal → New Terminal in the top menu. It will open at the bottom, already set to your project’s folder.
> This is convenient if you plan to edit the code while running the server.

Using your system terminal:

- **On Windows**:
  
  Click the Windows icon (bottom-left corner of the screen), or click the search bar next to it. Type **Command Prompt** or **cmd**. Click the Command Prompt app to open it.

- **On macOS**:
  
  Use Spotlight (Cmd + Space), type Terminal, and press Enter.

- **On Linux**:
  
  Use your system’s terminal app.



**2nd Step - Navigate to the project folder**:

Use the cd command, replacing the path below with your folder’s actual location:

```bash
cd path/to/your/project-folder
```

**3rd Step - Run the server**:

```bash
py -m http.server
```

This command starts a server on port 8000.

**4th Step - Open your browser and go to**:

```
http://localhost:8000
```

> [!IMPORTANT]
> **Keep the terminal open**. Once the server is running, do not close the terminal.
> The server will stop if the terminal is closed or interrupted. You can minimize it, but it must stay open in the background while you use the project in your browser.


## That's all!

The GUI will load in your browser. Good job on installing and running this project. Now you can:

- Set grid size, start/end points, and obstacles.

- Click the **Play Button** to run and visualize an algorithm!


## Want to Add Your Own Algorithm?

You can integrate and visualize your own pathfinding algorithm in the GUI with minimal setup:

- Navigate to `Scripts/pathfinding algorithms/`.
- Open `myAlgorithm.js` — a template is already set up for you.
- Write your algorithm following the instructions provided in [VISUALIZE_YOUR_ALGORITHM.md](./VISUALIZE_YOUR_ALGORITHM.md).
- When finished, go to line 53 of the `gui.js` file and change:

```js
if (grid.startAndEndSet === 0b11) {aStar()}
```

to

```js
if (grid.startAndEndSet === 0b11) {myAlgorithm()}
```
