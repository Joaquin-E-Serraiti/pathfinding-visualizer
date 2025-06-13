import { grid } from "./grid.js";
import { algorithmTools } from "./algorithmTools.js";

// Get DOM elements
const canvas = document.getElementById("gridCanvas");
const interfaceDiv = document.getElementById("interfaceDiv");
const buttonsPanelDiv = document.getElementById("buttonsPanel");
const input = document.getElementById("gridSizeSlider");
const inputText = document.getElementById("inputText");
const playButton = document.getElementById("playButton");
let playImage = document.getElementById("playImage");

// Set canvas dimensions based on layout
canvas.height = interfaceDiv.clientHeight;
canvas.width = Math.ceil(interfaceDiv.clientWidth - buttonsPanelDiv.clientWidth);

input.style.width = canvas.width;
input.value = 31; // Set a default value
inputText.innerText = "Columns: "+(31-2);

// Get canvas 2D context and throw an error if not supported by browser
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas not supported");


grid.initialize(input.value, canvas);


// ============= BUTTONS AND SLIDER EVENTS =============

document.getElementById("clearButton").addEventListener("click",()=>{
  algorithmTools.canRun = false;
  grid.clearGrid();

  playImage.src = "assets/Play Image.png"

})


import { myAlgorithm } from "./pathfinding algorithms/myAlgorithm.js";
import { aStar } from "./pathfinding algorithms/aStar.js";
import { demo } from "./pathfinding algorithms/demo.js";

playButton.addEventListener("click", async ()=>{
  if (!algorithmTools.canRun) {
    playImage.src = "assets/Stop Image.png";
    algorithmTools.canRun = true;
  } else {
    playImage.src = "assets/Play Image.png";
    grid.generateGrid(); // Clear squares colored by the algorithm
    algorithmTools.canRun = false;
  }
  if (grid.startAndEndSet === 0b11) {aStar()}
})


let speed = 1;
document.getElementById("speedButton").addEventListener("click", async ()=>{
  speed = {1:2,2:4,4:1}[speed];
  document.getElementById("speedText").innerText = "X"+{1:"1",2:"2",4:"4"}[speed];
  algorithmTools.switchSpeedControl();
})


input.addEventListener("input", (event) => {

  algorithmTools.canRun = false;
  playImage.src = "assets/Play Image.png";
  let columns = event.target.value;
  inputText.innerText = "Columns: "+(columns-2);
  
  grid.resizeGrid(columns);
});



// ============= LOGIC FOR CLICKING AND DRAGGING TO DRAW ON CANVAS =============

let isMouseDown = false;
let isDrawing = false;

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  isMouseDown = true;
  if (!algorithmTools.canRun) {grid.drawOnGrid(e)}
}, { passive: false });
window.addEventListener("pointerup", (e) => {
  isMouseDown = false;
});

canvas.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (isMouseDown && !isDrawing && !algorithmTools.canRun) { 
    // Draw only if mouse button is pressed, the previous drawing is finished and the pathfinding algorithm isn't running
    isDrawing = true; // Prevents calling multiple requestAnimationFrame before the previous one finished.
    requestAnimationFrame(() => {
      grid.drawOnGrid(event);
      isDrawing = false;
    });
  }
}, { passive: false })
