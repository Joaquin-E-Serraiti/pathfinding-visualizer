export const grid = {}

grid.initialize = function (columns, canvas) {
  this.columns = columns;
  this.canvas = canvas;
  this.ctx = this.canvas.getContext("2d");

  this.measureGrid()
  this.generateSquaresStates()
  this.generateGrid()
}

grid.measureGrid = function () {
  this.squareSize = Math.floor(((this.canvas.clientWidth-50) / this.columns) - ((this.columns/180)));
  this.rows = Math.round((this.canvas.clientHeight-60) / (this.squareSize + 1) - 1);
  if (!(this.rows%2)){this.rows++}
  this.horizontalPadding = Math.round((this.canvas.clientWidth - ((this.squareSize+1) * (this.columns-2))) / 2);
  this.verticalPadding = Math.round(((this.canvas.clientHeight - ((this.squareSize+1) * (this.rows)))-1) / 2);
}

grid.resizeGrid = function(newColumns) {
  this.columns = newColumns;
  this.measureGrid();
  this.generateSquaresStates();
  this.generateGrid()
}

grid.clearGrid = function() {
  this.generateSquaresStates();
  this.generateGrid()
}


grid.generateSquaresStates = function() {
  this.startAndEndSet = 0b00;
  this.squaresStates = new Uint8Array(Math.ceil((this.columns*this.rows)/4));
}


grid.getSquareState = function(squareIndex) {
  const arrayIndex = Math.floor(squareIndex/4);
  const stateQuad = this.squaresStates[arrayIndex];
  const squareState = (stateQuad & (0b11 << (2*(squareIndex%4)))) >> (2*(squareIndex%4));
  return squareState
}


grid.setSquareState = function(squareIndex, newState) {
  const arrayIndex = Math.floor(squareIndex/4);
  const stateQuad = this.squaresStates[arrayIndex];
  const newStateQuad = (stateQuad & ~(0b11 << (2*(squareIndex%4)))) | newState << (2*(squareIndex%4))
  this.squaresStates[arrayIndex] = newStateQuad;
}


grid.colorToDraw = "white";
grid.statesColorMap = {0b00:"rgb(90 240 180)",0b01:"rgb(250 80 150)",0b10:"rgb(90 240 180)",0b11:"rgb(70 70 85)"};
grid.startIndex = undefined;
grid.endIndex = undefined;
grid.startAndEndSet = 0b00;
grid.statesMap = {0b00:0b01,0b01:0b10,0b10:0b01,0b11:0b11};

grid.manageSquareState = function(squareIndex) {

  const squareState = this.getSquareState(squareIndex);
  let newState = 0b00;

  if (squareState === 0b00) {
    if (this.startAndEndSet === 0b00 || this.startAndEndSet === 0b10) {
      this.startIndex = squareIndex;
    }
    if (this.startAndEndSet === 0b01) {
      this.endIndex = squareIndex;
    }
    newState = this.statesMap[this.startAndEndSet];
    this.colorToDraw = this.statesColorMap[this.startAndEndSet];
    this.startAndEndSet |= this.statesMap[this.startAndEndSet];
  } else {
    if (squareState !== 0b11){
      this.startAndEndSet &= this.statesMap[squareState];
    }
    this.colorToDraw = "white";
  }

  this.setSquareState(squareIndex,newState)
}



grid.colorSquare = function(squareIndex, color) {
  this.ctx.fillStyle = color;
  const squarePositionX = squareIndex%(this.columns-2);
  const squarePositionY = Math.floor(squareIndex/(this.columns-2));

  this.ctx.clearRect(this.horizontalPadding+(squarePositionX*(this.squareSize+1))-1,this.verticalPadding+(squarePositionY*(this.squareSize+1))-1,this.squareSize+2,this.squareSize+2);

  this.ctx.fillRect(this.horizontalPadding+(squarePositionX*(this.squareSize+1)),this.verticalPadding+(squarePositionY*(this.squareSize+1)),this.squareSize,this.squareSize);
}

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


grid.previousSquareClicked = null;
grid.lastDrawTime = 0;

grid.drawOnGrid = function(event) {

  const nowTime = Date.now();
  const canvasCoordinates = this.canvas.getBoundingClientRect();
  const x = event.clientX - canvasCoordinates.left;
  const y = event.clientY - canvasCoordinates.top;
  const squareClickedX = Math.floor((x - this.horizontalPadding) / (this.squareSize+1));
  const squareClickedY = Math.floor((y - this.verticalPadding) / (this.squareSize+1));;
  const squareClicked = squareClickedX + (squareClickedY*(this.columns-2));

  if (squareClicked !== this.previousSquareClicked || nowTime - this.lastDrawTime > 600) {
    
    if ((squareClickedX < 0 || squareClickedY < 0) || (squareClickedX > this.columns-3 || squareClickedY > this.rows-1)) {return};

    this.manageSquareState(squareClicked);
    this.colorSquare(squareClicked, this.colorToDraw);

    this.previousSquareClicked = squareClicked;
    this.lastDrawTime = nowTime;
  }
}

