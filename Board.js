const sideLengthPx = window.innerWidth * 0.12;
const sideLengthBlocks = 8;
const blockSidePx = sideLengthPx / sideLengthBlocks;
const boardDimensions = 4;

const deepCopy = obj => JSON.parse(JSON.stringify(obj));

const findAdjacentBombs = (squares, coords) => {
  let adjacentBombs = 0;
  for (let w = coords[3] - 1; w < coords[3] + 2; w++) {
    for (let z = coords[2] - 1; z < coords[2] + 2; z++) {
      for (let y = coords[1] - 1; y < coords[1] + 2; y++) {
        for (let x = coords[0] - 1; x < coords[0] + 2; x++) {
          try {
            adjacentBombs = squares[w][z][y][x].hasBomb ? adjacentBombs + 1 : adjacentBombs;
          } catch (error) { error;}
        }
      }
    }
  }
  return adjacentBombs;
};

const getPlane = () => {
  const getSquareRow = () => Array.from({ length: sideLengthBlocks }, () => 
  { return {hasBomb: Math.random() <= 0.02, isHidden: true, adjacentCount: 0}; });
  const initSquares = Array.from({length: sideLengthBlocks}, () => getSquareRow());
  initSquares.forEach((row, y) => 
    row.forEach((sq, x) => { sq.adjacentCount = findAdjacentBombs(initSquares, x, y)}));

  return initSquares;
};

const constructSquareArray = dimensions => {
  // const numPlanes = BOARD_SIDE ** (dimensions - 2);
  return dimensions !== 2 
    ? Array.from({length: boardDimensions}, () => constructSquareArray(dimensions - 1))
    : getPlane();
};

const getInitialSquares = dimensions => { 
  const squares = constructSquareArray(dimensions);

  squares.forEach((planeRow, i) => 
    planeRow.forEach((plane, j) => 
      plane.forEach((row, k) =>
        row.forEach((sq, l) => 
        { sq.adjacentCount = findAdjacentBombs(squares, [l, k, j, i])}))));

  return squares;
}


const onHover = (e, canvas, highlighted, z, w) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  if (mouseX < 0 || mouseY < 0) {
      return;
  }
  const squareX = Math.floor(mouseX / blockSidePx);
  const squareY = Math.floor(mouseY / blockSidePx);

  highlighted.x = squareX;
  highlighted.y = squareY;
  highlighted.z = z;
  highlighted.w = w;
};
    
const getIsAdjacent = (x, y, z, w, highlighted) => 
  x >= (highlighted.x - 1) && x <= (highlighted.x + 1) &&
  y >= (highlighted.y - 1) && y <= (highlighted.y + 1) &&
  z >= (highlighted.z - 1) && z <= (highlighted.z + 1) &&
  w >= (highlighted.w - 1) && w <= (highlighted.w + 1);

const draw = (ctx, squares, highlighted, z, w) => {
  ctx.lineWidth = 2;

  ctx.clearRect(0, 0, sideLengthPx, sideLengthPx);

  for (let y = 0; y < sideLengthBlocks; y++) {
    for (let x = 0; x < sideLengthBlocks; x++) {
      const currentSquare = squares[w][z][y][x];

      if (getIsAdjacent(x, y, z, w, highlighted)) {
        ctx.strokeStyle = '#7593ffff';
      } else {
        ctx.strokeStyle = '#6aff00ff';
      }

      if (currentSquare.isHidden) {
        ctx.fillStyle = '#343434ff';
      } else {
        if (currentSquare.hasBomb) {
          ctx.fillStyle = '#ff0000ff';
        } else {
          ctx.fillStyle = '#c5c5c5ff';
        }

      }
      ctx.fillRect(x * blockSidePx, y * blockSidePx, blockSidePx, blockSidePx);
      ctx.strokeRect(x * blockSidePx, y * blockSidePx, blockSidePx, blockSidePx);
      if (currentSquare.adjacentCount > 0 && !currentSquare.isHidden && !currentSquare.hasBomb) {
        ctx.fillStyle = '#004cafff';
        ctx.fillText(currentSquare.adjacentCount.toString(), x * blockSidePx + 2, (y + 1) * blockSidePx - 2);
      }
    }
  };

  // window.requestAnimationFrame(() => draw(ctx, squares, highlighted))
};

const drawAllLoop = (squares, highlighted, canvases) => {
  canvases.forEach((canvasRow, w) => {
    canvasRow.forEach((canvas, z) => {
      draw(canvas.ctx, squares, highlighted, z, w);
    });
  });

  window.requestAnimationFrame(() => drawAllLoop(squares, highlighted, canvases));
};

// const getInitialSquares = () => {
//   return Array.from({length: BOARD_SIDE}, () => getPlane());
// };
const clearSquareWithAdjacent = (x, y, z, w, newSquares) => {
  newSquares[w][z][y][x].isHidden = false;

  if (newSquares[w][z][y][x].adjacentCount == 0) {

    for (let i = w - 1; i < w + 2; i++) {
      for (let j = z - 1; j < z + 2; j++) {
        for (let k = y - 1; k < y + 2; k++) {
          for (let l = x - 1; l < x + 2; l++) {
            if (newSquares[i] && newSquares[i][j] && newSquares[i][j][k] && newSquares[i][j][k][l] && !newSquares[i][j][k][l].visited) {
              newSquares[i][j][k][l].visited = true;
              if (newSquares[i][j][k][l].adjacentCount == 0) {
                clearSquareWithAdjacent(l, k, j, i, newSquares);
              } else {
                newSquares[i][j][k][l].isHidden = false;
              }
            }
          }
        }
      }
    }
  }
};

const handleSquareClick = (x, y, z, w, squares) => {
  const newSquares = deepCopy(squares).map(planeRow => planeRow.map(plane => plane.map(row => row.map(sq => { return { ...sq, visited: false }}))));
  clearSquareWithAdjacent(x, y, z, w, newSquares);

  squares.length = 0;
  newSquares.forEach(sq => squares.push(sq));
};

const onClick = (e, canvas, squares, z, w) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (mouseX < 0 || mouseY < 0) {
        return;
    }
    const squareX = Math.floor(mouseX / blockSidePx);
    const squareY = Math.floor(mouseY / blockSidePx);

    handleSquareClick(squareX, squareY, z, w, squares);
};

const buildHtml = (squares, highlighted) => {
  const boardDiv = document.createElement('div');
  boardDiv.id = 'board';
  const canvases = [];

  squares.forEach((planeRow, w) => {
    const canvasRow = [];
    const planeRowDiv = document.createElement('div');
    planeRowDiv.id = `planeRow ${w}`;
    planeRowDiv.className = 'planeRow';

    planeRow.forEach((_, z) => {
      const canvas = document.createElement('canvas');
      canvas.addEventListener('mousemove', e => onHover(e, canvas, highlighted, z, w));
      canvas.addEventListener('click', e => onClick(e, canvas, squares, z, w));
      canvas.setAttribute('width', sideLengthPx);
      canvas.setAttribute('height', sideLengthPx);
      canvas.id = `plane ${z}, ${w}`;
      const ctx = canvas.getContext('2d');
      ctx.font = `${window.innerWidth * 0.008}px serif`

      planeRowDiv.appendChild(canvas);
      canvasRow.push({canvas, ctx})
    });

    boardDiv.appendChild(planeRowDiv);
    canvases.push(canvasRow);
  });

  return {canvases, boardDiv};
};

(() => {
  const squares = getInitialSquares(boardDimensions);
  const highlighted = {};
  const { canvases, boardDiv } = buildHtml(squares, highlighted);
  document.body.appendChild(boardDiv);

  const cursor = document.getElementById('cursor');
  cursor.style.width = window.innerWidth * 0.01 + 'px';
  cursor.style.height = window.innerWidth * 0.01 + 'px';
  document.addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });

  drawAllLoop(squares, highlighted, canvases);
})();
