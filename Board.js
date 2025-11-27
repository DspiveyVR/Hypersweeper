const sideLengthPx = 304;
const sideLengthBlocks = 16;
const blockSidePx = sideLengthPx / sideLengthBlocks;

const deepCopy = obj => JSON.parse(JSON.stringify(obj));

const findAdjacentBombs = (squares, x, y) => {
  let adjacentBombsCount = 0;
  for (let i = y - 1; i < y + 2; i++) {
    for (let j = x - 1; j < x + 2; j++) {
      if (squares[i] && squares[i][j]) {
        adjacentBombsCount =  squares[i][j].hasBomb ? adjacentBombsCount + 1 : adjacentBombsCount;
      }
    }
  }

  return adjacentBombsCount;
};

const getInitialSquares = () => {
  const getSquareRow = () => Array.from({ length: sideLengthBlocks }, () => 
  { return {hasBomb: Math.random() <= 0.20, isHidden: true, adjacentCount: 0}; });
  const initSquares = Array.from({length: sideLengthBlocks}, () => getSquareRow());
  initSquares.forEach((row, y) => 
    row.forEach((sq, x) => { sq.adjacentCount = findAdjacentBombs(initSquares, x, y)}));

  return initSquares;
};

const onHover = (e, canvas, highlighted) => {
  e.stopPropagation();
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  if (mouseX < 0 || mouseY < 0) {
      return;
  }
  const squareX = Math.floor(mouseX / blockSidePx);
  const squareY = Math.floor(mouseY / blockSidePx);

  highlighted.length = 0;
  highlighted.push(squareY, squareX);
};
    
const getIsAdjacent = (x, y, highlighted) => x >= (highlighted[1] - 1) && x <= (highlighted[1] + 1) &&
                                y >= (highlighted[0] - 1) && y <= (highlighted[0] + 1);

const draw = (ctx, squares, highlighted) => {
  ctx.lineWidth = 2;

  ctx.clearRect(0, 0, sideLengthPx, sideLengthPx);

  for (let y = 0; y < sideLengthBlocks; y++) {
    for (let x = 0; x < sideLengthBlocks; x++) {

      if (getIsAdjacent(x, y, highlighted)) {
        ctx.strokeStyle = '#7593ffff';
      } else {
        ctx.strokeStyle = '#6aff00ff';
      }

      if (squares[y][x].isHidden) {
        ctx.fillStyle = '#343434ff';
      } else {
        if (squares[y][x].hasBomb) {
          ctx.fillStyle = '#ff0000ff';
        } else {
          ctx.fillStyle = '#c5c5c5ff';
        }

      }
      ctx.fillRect(x * blockSidePx, y * blockSidePx, blockSidePx, blockSidePx);
      ctx.strokeRect(x * blockSidePx, y * blockSidePx, blockSidePx, blockSidePx);
      if (squares[y][x].adjacentCount > 0 && !squares[y][x].isHidden && !squares[y][x].hasBomb) {
        ctx.fillStyle = '#004cafff';
        ctx.fillText(squares[y][x].adjacentCount.toString(), x * blockSidePx, (y + 1) * blockSidePx);
      }
    }
  };

  window.requestAnimationFrame(() => draw(ctx, squares, highlighted))
};

// const getInitialSquares = () => {
//   return Array.from({length: BOARD_SIDE}, () => getPlane());
// };
const clearSquareWithAdjacent = (x, y, newSquares) => {
  newSquares[y][x].isHidden = false;

  if (newSquares[y][x].adjacentCount == 0) {
    for (let i = y - 1; i < y + 2; i++) {
      for (let j = x - 1; j < x + 2; j++) {
        if (newSquares[i] && newSquares[i][j] && !newSquares[i][j].visited) {
          newSquares[i][j].visited = true;
          if (newSquares[i][j].adjacentCount == 0) {
            clearSquareWithAdjacent(j, i, newSquares);
          } else {
            newSquares[i][j].isHidden = false;
          }
        }
      }
    }
  }
};

const handleSquareClick = (x, y, squares) => {
  const newSquares = deepCopy(squares).map(row => row.map(sq => { return { ...sq, visited: false }}));
  clearSquareWithAdjacent(x, y, newSquares);

  squares.length = 0;
  newSquares.forEach(sq => squares.push(sq));
};

const onClick = (e, canvas, squares) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('click');
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (mouseX < 0 || mouseY < 0) {
        return;
    }
    const squareX = Math.floor(mouseX / blockSidePx);
    const squareY = Math.floor(mouseY / blockSidePx);

    handleSquareClick(squareX, squareY, squares);
};

(() => {
  const squares = getInitialSquares();
  const canvas = document.getElementById('plane');
  const ctx = canvas.getContext('2d');
  ctx.font = '12pt serif'
  const highlighted = [];

  canvas.addEventListener('mousemove', e => onHover(e, canvas, highlighted));
  canvas.addEventListener('click', e => onClick(e, canvas, squares));

  window.requestAnimationFrame(() => draw(ctx, squares, highlighted));
})();
