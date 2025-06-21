import { algorithmTools } from "../algorithmTools.js";
import { grid } from "../grid.js";

export async function demo() {

  if (!algorithmTools.canRun) {return}

  const start = grid.startIndex;
  const end = grid.endIndex;
  const columns = grid.columns-2;
  const rows = grid.rows

  const exploredNodes = [];
  const nodesToExplore = [{index:start,parent:null}];

  let currentNode = nodesToExplore[0];

  while (currentNode.index !== end) {

    if (!algorithmTools.canRun) {return}
    if (nodesToExplore.length === 0) {return}

    const neighborNodesIndeces = [currentNode.index+1,currentNode.index-1,currentNode.index+columns,currentNode.index-columns];
    exploredNodes.push(nodesToExplore.shift()); // Remove currentNode from nodesToExplore and push it to exploredNodes
    if (currentNode.index !== start && currentNode.index !== end) {
      grid.colorSquare(currentNode.index, "rgb(73, 95, 216)");
    }

    for (let neighborNodeIndex of neighborNodesIndeces) {

      if (neighborNodeIndex < 0 || neighborNodeIndex >= columns*rows || ((currentNode.index%columns !== neighborNodeIndex%columns)&&(Math.floor(currentNode.index/columns) !== Math.floor(neighborNodeIndex/columns)))) {continue}

      if (grid.getSquareState(neighborNodeIndex) === 0b11 || exploredNodes.find(n => n.index === neighborNodeIndex)) {continue}

      let existingNode = nodesToExplore.find(n => n.index === neighborNodeIndex);
      if (existingNode) {
        existingNode.parent = currentNode;
      }
      else {
        nodesToExplore.push({index:neighborNodeIndex,parent:currentNode})
        if (neighborNodeIndex !== start && neighborNodeIndex !== end) {
          grid.colorSquare(neighborNodeIndex,"rgb(53, 56, 207)")
        }
      }
    }

    currentNode = nodesToExplore[0];
    
    await algorithmTools.delay(40-algorithmTools.speedControl*10)

  }
  
  currentNode = currentNode.parent;
  while (currentNode.parent !== null) {

    if (!algorithmTools.canRun) {return}

    grid.colorSquare(currentNode.index,"rgb(246, 235, 118)");
    currentNode = currentNode.parent;
    await algorithmTools.delay(40-algorithmTools.speedControl*10)
  }
}
