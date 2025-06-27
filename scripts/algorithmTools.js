export const algorithmTools = {}

algorithmTools.speedControl = 1;
algorithmTools.canRun = false;

algorithmTools.delay = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

