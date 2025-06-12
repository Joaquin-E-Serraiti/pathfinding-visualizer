import { algorithmTools } from "../algorithmTools.js";
import { grid } from "../grid.js";

export async function aStar() {

  if (!algorithmTools.canRun) {return}

  const start = grid.startIndex;
  const end = grid.endIndex;
  const columns = grid.columns-2;
  const rows = grid.rows

  const startingNode = {index:start, h:manhattanDistance(start,end,columns), h2:euclideanDistance(start,end,columns), g:0, parent:null};
  const exploredNodes = [];
  let nodesToExplore = [startingNode];

  let currentNode = nodesToExplore[0];
  let counter = 0;
  let newNode;

  while (currentNode.index !== end) {

    if (!algorithmTools.canRun) {return}
    if (nodesToExplore.length === 0) {return}

    counter++;

    const neighborNodesIndeces = [currentNode.index+1,currentNode.index-1,currentNode.index+columns,currentNode.index-columns];
    exploredNodes.push(nodesToExplore.shift());

    if (currentNode.index !== start && currentNode.index !== end) {
      grid.colorSquare(currentNode.index,`rgb(${220-((40/startingNode.h)*(currentNode.g/startingNode.h)+100)}, ${220-((60/startingNode.h)*currentNode.g+70)}, 235)`);
    }
    

    for (let neighborNodeIndex of neighborNodesIndeces) {
      
      if (neighborNodeIndex < 0 || neighborNodeIndex >= columns*rows || ((currentNode.index%columns !== neighborNodeIndex%columns)&&(Math.floor(currentNode.index/columns) !== Math.floor(neighborNodeIndex/columns)))) {continue}
      
      if (grid.getSquareState(neighborNodeIndex) === 0b11 || exploredNodes.find(n => n.index === neighborNodeIndex)) {continue}
      
      let existingNode = nodesToExplore.find(n => n.index === neighborNodeIndex)
      if (existingNode) {
        if (existingNode.g > currentNode.g+1) {
          existingNode.g = currentNode.g+1;
          existingNode.parent = currentNode;
          nodesToExplore = nodesToExplore.filter(n => n.index !== existingNode.index);
          insertNodeSortedByCost(existingNode,nodesToExplore);
        }
      } else {
        newNode = {index:neighborNodeIndex, h:manhattanDistance(neighborNodeIndex,end,columns),h2:euclideanDistance(neighborNodeIndex,end,columns),g:currentNode.g+1, parent:currentNode};

        insertNodeSortedByCost(newNode,nodesToExplore);

        if (neighborNodeIndex !== start && neighborNodeIndex !== end) {
          grid.colorSquare(neighborNodeIndex,`rgb(${225 - ((40/startingNode.h)*currentNode.h+55)}, ${225-((40/startingNode.h)*currentNode.g+43)}, 230)`);
        }
        
      }
    }

    currentNode = nodesToExplore[0];

    if (algorithmTools.speedControl === 4) {
      if (counter%2) {
        await algorithmTools.delay(0);
      }
    }
    else if (algorithmTools.speedControl === 2) {
      if (Math.floor((counter&8)/7) === 0) {
        await algorithmTools.delay(((22*(65/(columns+55)))*1.5)*((2-(algorithmTools.speedControl/2)))/1.5);
      }
    }
    else {
      await algorithmTools.delay(((22*(65/(columns+55)))*1.5)*((2-(algorithmTools.speedControl/2))/2));
    }
  }

  let path = traceParentsBack(currentNode);
  console.log(path)
  
  for (let nodeToColor of path) {
    if (!algorithmTools.canRun) {return}
    
    grid.colorSquare(nodeToColor.index,`rgb(${90+((180/path.length)*nodeToColor.g)}, ${250-((180/path.length)*nodeToColor.g)}, 160)`);

    await algorithmTools.delay(22*(65/(columns+55)));
  }
}

function manhattanDistance(currentNodeIndex, endNodeIndex, columns) {
  const currentNodeX = currentNodeIndex%columns;
  const currentNodeY = Math.floor(currentNodeIndex/columns);
  const endNodeX = endNodeIndex%columns;
  const endNodeY = Math.floor(endNodeIndex/columns);
  
  return Math.abs(endNodeX-currentNodeX)+Math.abs(endNodeY-currentNodeY)
}

function euclideanDistance(currentNodeIndex, endNodeIndex, columns) {
  const currentNodeX = currentNodeIndex%columns;
  const currentNodeY = Math.floor(currentNodeIndex/columns);
  const endNodeX = endNodeIndex%columns;
  const endNodeY = Math.floor(endNodeIndex/columns);

  return ((endNodeX-currentNodeX)**2 + (endNodeY-currentNodeY)**2)**(1/2)
}


function insertNodeSortedByCost(node, array) {
  const node_f_cost = node.g + node.h;
  let index = 0;

  for (; index < array.length; index++) {
    const arrayNode = array[index];
    const array_node_f_cost = arrayNode.g + arrayNode.h;
    
    if (node_f_cost < array_node_f_cost || (node_f_cost === array_node_f_cost && (node.h2 <= arrayNode.h2))){break}
  }
  if (index === array.length) {
  array.push(node);
  } else {
    array.splice(index, 0, node);
  }
}

function traceParentsBack(node) {
  let nodeParent = node.parent;
  let path = [];
  while (nodeParent) {
    path.push(nodeParent);
    nodeParent = nodeParent.parent
  }
  return path
}