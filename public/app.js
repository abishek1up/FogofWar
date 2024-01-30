document.addEventListener('DOMContentLoaded', () => {
  const userGrid = document.querySelector('.grid-user')
  const computerGrid = document.querySelector('.grid-computer')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const destroyer = document.querySelector('.destroyer-container')
  const submarine = document.querySelector('.submarine-container')

  const setupButtons = document.getElementById('setup-buttons')
  const startButton = document.querySelector('#start')
  const endButton = document.querySelector('#endGame')
  const rotateButton = document.querySelector('#rotate')

  const turnDisplay = document.querySelector('#whose-go')
  const infoDisplay = document.querySelector('#info')

  const userSquares = []
  const computerSquares = []
  let isHorizontal = true
  let isGameOver = false
  let currentPlayer = 'user'
  const width = 10
  const range = 3

  let playerNum = 0
  let ready = false
  let enemyReady = false
  let allShipsPlaced = false
  let shotFired = -1

  //Ships
  const shipArray = [
    {
      name: 'destroyer',
      directions: [
        [0, 1],
        [0, width],
      ],
    },
    {
      name: 'submarine',
      directions: [
        [0, 1, 2],
        [0, width, width * 2],
      ],
    },
  ]

  createBoard(userGrid, userSquares)
  createBoard(computerGrid, computerSquares)

  rotateButton.addEventListener('click', rotate)
  endButton.addEventListener('click', quit)

  // Select Player Mode
  if (gameMode === 'singlePlayer') {
    startSinglePlayer()
  } else {
    startMultiPlayer()
  }

  // Single Player
  function startSinglePlayer() {
    generate(shipArray[0])
    generate(shipArray[1])

    startButton.addEventListener('click', () => {
      setupButtons.style.display = 'none'
      playGameSingle()
    })
  }

  //Create Board
  function createBoard(grid, squares) {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
    }
  }

  //Draw the computers ships in random locations for CPU
  function generate(ship) {
    let randomDirection = Math.floor(Math.random() * ship.directions.length)
    let current = ship.directions[randomDirection]
    if (randomDirection === 0) direction = 1
    if (randomDirection === 1) direction = width
    let randomStart = Math.abs(
      Math.floor(
        Math.random() * computerSquares.length -
          ship.directions[0].length * direction
      )
    )

    const isTaken = current.some((index) =>
      computerSquares[randomStart + index].classList.contains('taken')
    )
    const isAtRightEdge = current.some(
      (index) => (randomStart + index) % width === width - 1
    )
    const isAtLeftEdge = current.some(
      (index) => (randomStart + index) % width === 0
    )

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge)
      current.forEach((index) =>
        computerSquares[randomStart + index].classList.add('taken', ship.name)
      )
    else generate(ship)
  }

  //Rotate the ships
  function rotate() {
    if (isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      isHorizontal = false
      return
    }
    if (!isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      isHorizontal = true
      return
    }
  }

  //move around user ship
  ships.forEach((ship) => ship.addEventListener('dragstart', dragStart))
  userSquares.forEach((square) =>
    square.addEventListener('dragstart', dragStart)
  )
  userSquares.forEach((square) => square.addEventListener('dragover', dragOver))
  userSquares.forEach((square) =>
    square.addEventListener('dragenter', dragEnter)
  )
  userSquares.forEach((square) =>
    square.addEventListener('dragleave', dragLeave)
  )
  userSquares.forEach((square) => square.addEventListener('drop', dragDrop))
  userSquares.forEach((square) => square.addEventListener('dragend', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  ships.forEach((ship) =>
    ship.addEventListener('mousedown', (e) => {
      selectedShipNameWithIndex = e.target.id
    })
  )

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragLeave() {
    // console.log('drag leave')
  }

  var Matrix = function (rows, columns) {
    this.rows = rows
    this.columns = columns
    this.myarray = new Array(this.rows)
    for (var i = 0; i < this.columns; i += 1) {
      this.myarray[i] = new Array(this.rows)
    }

    for (var i = 0; i < width; i++) {
      var j = i * width
      for (var k = 0; k < width; k++) {
        if (j < (i + 1) * width) {
          this.myarray[i][k] = j
        }
        j++
      }
    }
    return this.myarray
  }

  function dragDrop() {
    let shipNameWithSizeId = draggedShip.lastChild.id
    let shipClass = shipNameWithSizeId.slice(0, -2)
    let shipTail = parseInt(shipNameWithSizeId.substr(-1))
    let shipLastId = shipTail + parseInt(this.dataset.id)

    var matrixArray = new Matrix(width, width)

    const notAllowedHorizontal = []
    for (var i = 0; i < range; i++) {
      for (var k = 0; k < width; k++) {
        notAllowedHorizontal.push(matrixArray[k][i])
      }
    }

    const notAllowedVertical = []
    for (var i = width - 1; i > width - range; i--) {
      for (var k = width - 1; k >= 0; k--) {
        notAllowedVertical.push(matrixArray[i][k])
      }
    }

    let newNotAllowedHorizontal = notAllowedHorizontal.splice(
      0,
      width * shipTail
    )
    let newNotAllowedVertical = notAllowedVertical.splice(0, width * shipTail)

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

    shipLastId = shipLastId - selectedShipIndex

    if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
      for (let i = 0; i < draggedShipLength; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === draggedShipLength - 1) directionClass = 'end'
        userSquares[
          parseInt(this.dataset.id) - selectedShipIndex + i
        ].classList.add('taken', 'horizontal', directionClass, shipClass)
      }
    } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
      for (let i = 0; i < draggedShipLength; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === draggedShipLength - 1) directionClass = 'end'
        userSquares[
          parseInt(this.dataset.id) - selectedShipIndex + width * i
        ].classList.add('taken', 'vertical', directionClass, shipClass)
      }
    } else return

    displayGrid.removeChild(draggedShip)
    if (!displayGrid.querySelector('.ship')) allShipsPlaced = true
  }

  function dragEnd() {
    // console.log('dragend')
  }

  // Game Logic for MultiPlayer
  function playGameMulti(socket) {
    setupButtons.style.display = 'none'
    if (isGameOver) return
    if (!ready) {
      socket.emit('player-ready')
      ready = true
      playerReady(playerNum)
    }

    if (enemyReady) {
      if (currentPlayer === 'user') {
        turnDisplay.innerHTML = 'Your Go'
      }
      if (currentPlayer === 'enemy') {
        turnDisplay.innerHTML = "Enemy's Go"
      }
    }
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready`).classList.toggle('active')
  }

  // Game Logic for Single Player
  function playGameSingle() {
    if (isGameOver) return
    if (currentPlayer === 'user') {
      turnDisplay.innerHTML = 'Your Go'
      computerSquares.forEach((square) =>
        square.addEventListener('click', function (e) {
          shotFired = square.dataset.id
          revealSquare(square.classList)
        })
      )
    }
    if (currentPlayer === 'enemy') {
      turnDisplay.innerHTML = 'Computers Go'
      setTimeout(enemyGo, 1000)
    }
  }

  let destroyerCount = 0
  let submarineCount = 0

  function revealSquare(classList) {
    const enemySquare = computerGrid.querySelector(
      `div[data-id='${shotFired}']`
    )
    const obj = Object.values(classList)
    if (
      !enemySquare.classList.contains('boom') &&
      currentPlayer === 'user' &&
      !isGameOver
    ) {
      if (obj.includes('destroyer')) destroyerCount++
      if (obj.includes('submarine')) submarineCount++
    }
    if (obj.includes('taken')) {
      enemySquare.classList.add('boom')
    } else {
      enemySquare.classList.add('miss')
    }
    checkForWins()
    currentPlayer = 'enemy'
    if (gameMode === 'singlePlayer') playGameSingle()
  }

  let cpuDestroyerCount = 0
  let cpuSubmarineCount = 0

  function enemyGo(square) {
    if (gameMode === 'singlePlayer')
      square = Math.floor(Math.random() * userSquares.length)
    if (
      userSquares[square].classList != undefined &&
      !userSquares[square].classList.contains('boom')
    ) {
      const hit = userSquares[square].classList.contains('taken')
      userSquares[square].classList.add(hit ? 'boom' : 'miss')
      if (userSquares[square].classList.contains('destroyer'))
        cpuDestroyerCount++
      if (userSquares[square].classList.contains('submarine'))
        cpuSubmarineCount++
      checkForWins()
    } else if (gameMode === 'singlePlayer') enemyGo()
    currentPlayer = 'user'
    turnDisplay.innerHTML = 'Your Go'
  }

  function checkForWins() {
    let enemy = 'computer'
    if (gameMode === 'multiPlayer') enemy = 'enemy'
    if (destroyerCount === 2) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s destroyer`
      destroyerCount = 10
    }
    if (submarineCount === 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s submarine`
      submarineCount = 10
    }

    if (cpuDestroyerCount === 2) {
      infoDisplay.innerHTML = `${enemy} sunk your destroyer`
      cpuDestroyerCount = 10
    }
    if (cpuSubmarineCount === 3) {
      infoDisplay.innerHTML = `${enemy} sunk your submarine`
      cpuSubmarineCount = 10
    }
    if (destroyerCount + submarineCount === 20) {
      infoDisplay.innerHTML = 'YOU WIN'
      gameOver()
    }
    if (cpuDestroyerCount === 10) {
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
      gameOver()
    }
  }

  function gameOver() {
    setupButtons.style.display = 'revert'
    isGameOver = true
    startButton.style.display = 'none'
    rotateButton.style.display = 'none'
    infoDisplay.innerHTML = 'YOU WIN'
  }

  function quit() {
    isGameOver = true
    window.location.href = 'http://localhost:3001/'
  }
})
