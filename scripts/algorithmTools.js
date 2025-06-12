export const algorithmTools = {}

algorithmTools.speedControl = 1;
algorithmTools.canRun = false;

algorithmTools.delay = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

algorithmTools.switchSpeedControl = function() {
  this.speedControl = {1:2,2:4,4:1}[this.speedControl];
}

