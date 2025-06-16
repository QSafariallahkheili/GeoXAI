export function hexToRgb(hex, result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)) {
    return result ? result.map(i => parseInt(i, 16)).slice(1) : null
    //returns [23, 14, 45] -> reformat if needed
  }