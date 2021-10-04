document.addEventListener("DOMContentLoaded", () => {
  const MINEFIELD = document.querySelector(".minefield")
  const NUMBER_OF_BOMBS = 100
  let counter
  let tiles = []
  let time
  const HEIGHT = 26
  const WIDTH = 26
  let remaining = NUMBER_OF_BOMBS
  let played = false
  let interval
  let highScore = localStorage.getItem("minesweeper-high-score")
  const HIGHSCORE = document.querySelector(".high-score")

  function prepareBombImage(){
    let bombImageTag = document.createElement("img")
    bombImageTag.setAttribute("src", "bomb.png")
    bombImageTag.setAttribute("alt", "bomb")
    return bombImageTag
  }

  function setUpMinefield(){
    for (let i = 0; i < HEIGHT * WIDTH; i++) {
      let tile = document.createElement("div")
      tile.classList.add("tile", "unrevealed")
      tile.setAttribute("id", i)
      tile.style.animationDelay = (i * 4) + "ms"
      MINEFIELD.appendChild(tile)
      tiles[i] = tile
    }


    const mineCounter = document.createElement("div")
    mineCounter.classList.add("bomb-counter", "counter")
    mineCounter.innerText = NUMBER_OF_BOMBS
    mineCounter.style.animationDelay = (HEIGHT * WIDTH * 4 + 300) + "ms"
    counter = mineCounter
    MINEFIELD.appendChild(mineCounter)

    const timeCounter = document.createElement("div")
    timeCounter.classList.add("time-counter", "counter")
    timeCounter.innerText = 0
    timeCounter.style.animationDelay = (HEIGHT * WIDTH * 4 + 300) + "ms"
    time = timeCounter
    MINEFIELD.appendChild(timeCounter)

    interval = setInterval(() => {
      if (played){
        current = parseInt(time.innerText)
        time.innerText = current + 1
      }
    }, 1000)


    const newGameButton = document.createElement("button")
    newGameButton.innerText = "New game"
    newGameButton.classList.add("new-game-button")
    newGameButton.addEventListener("click", startGame)
    newGameButton.style.animationDelay = (HEIGHT * WIDTH * 4 + 300) + "ms"
    MINEFIELD.appendChild(newGameButton)

    if(highScore){
      HIGHSCORE.innerText = "Your high score: " + highScore + " s"
    }
  }

  function placeBombs(){
    const shuffled = shuffleArray(tiles)
    let selected = shuffled.slice(0, NUMBER_OF_BOMBS)
    selected.forEach((item) => {
      item.classList.add("bomb")
      item.appendChild(prepareBombImage()).style.display = "none"
    })
  }
  
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

  function placeNumbers(){
    tiles.forEach((item) => {
      if (!item.classList.contains("bomb")){
        const id = parseInt(item.getAttribute("id"))
        let numberOfAdjacentBombs = 0
        const adjacent = getAdjacent(id)
        numberOfAdjacentBombs = checkTilesForBombs(selectAdjacent(id, adjacent))
        //innertext je number
        if (numberOfAdjacentBombs !== 0){
          item.innerText = numberOfAdjacentBombs
        }
      }
    });
  }

  function getAdjacent(id){
    return [document.getElementById(id - HEIGHT - 1),
    document.getElementById(id - HEIGHT),
    document.getElementById(id - HEIGHT + 1),
    document.getElementById(id - 1),
    document.getElementById(id + 1),
    document.getElementById(id + HEIGHT - 1),
    document.getElementById(id + HEIGHT),
    document.getElementById(id + HEIGHT + 1)]
  }

  function checkTilesForBombs(tiles){
    let numberOfBombs = 0
    tiles.forEach((item) => {
      if (item.classList.contains("bomb")){
        numberOfBombs++
      }
    });
    return numberOfBombs
  }

  function tileClickingLogic(){
    tiles.forEach((item) => {
      item.addEventListener("click", (e) =>{
        played = true
        const clickedTile = e.target

        //revealing by clicking
        if (clickedTile.classList.contains("unrevealed") && (!clickedTile.classList.contains("flag"))){
          clickedTile.classList.remove("unrevealed")
          clickedTile.classList.add("revealed")
          if (clickedTile.innerText === "" && !clickedTile.classList.contains("bomb")){
            revealAdjacent(clickedTile)
          }
        }

        //Revealing others, when correctly flaging tiles
        if (clickedTile.classList.contains("revealed")){
          const id = parseInt(clickedTile.getAttribute("id"))
          const adjacent = getAdjacent(id)
          const realAdjacent = selectAdjacent(id, adjacent)
          let flagged = 0
          realAdjacent.forEach((item) => {
            if(item.classList.contains("flag")){
              flagged++
            }
          })
          if (parseInt(clickedTile.innerText) === flagged){
            revealAdjacent(clickedTile)
          }
        }

        checkForWinOrLoss()
      })

      //flaging by right click
      item.addEventListener("contextmenu", (e) =>{
        e.preventDefault()
        const clickedTile = e.target
        if (clickedTile.classList.contains("unrevealed")){
          if (clickedTile.classList.contains("flag")){
            clickedTile.classList.remove("flag")
            remaining++
          } else{
            clickedTile.classList.add("flag")
            remaining--
          }
        }
        if (clickedTile.classList.contains("revealed")){
          const id = parseInt(clickedTile.getAttribute("id"))
          const adjacent = getAdjacent(id)
          const realAdjacent = selectAdjacent(id, adjacent)
          let unrevealedAdjacent = 0

          realAdjacent.forEach((item) => {
            if (item.classList.contains("unrevealed")){
              unrevealedAdjacent++
            }
          });

          if(unrevealedAdjacent === parseInt(clickedTile.innerText)){
            realAdjacent.forEach((item) => {
              if (!item.classList.contains("flag") && (item.classList.contains("unrevealed"))){
                remaining--
                item.classList.add("flag")
              }
            });

          }

        }
        counter.innerText = remaining
        return false
      }, false)
    })
  }

  function checkForWinOrLoss(){
    let revealedTiles = 0
    let revealedBomb = false
    tiles.forEach((item) => {
      if (item.classList.contains("revealed")){
        revealedTiles++
        if (item.classList.contains("bomb") || item.classList.contains("flag")){
          revealedBomb = true
        }
      }
    })
    if(revealedBomb){
      setTimeout(() => {alert("You Lose!")}, 10)
      played = false
      clearInterval(interval)
      revealAll()
    }else if (revealedTiles >= (HEIGHT * WIDTH - NUMBER_OF_BOMBS)){
      let winMessage = "You Win in " + time.innerText + " Seconds!"
      if (!((highScore) && (parseInt(time.innerText) > parseInt(highScore)))){
        setNewHighScore()
        winMessage = winMessage.concat(" That's a new high score!")
      }
      setTimeout(() => {alert(winMessage)}, 10)
      played = false
      clearInterval(interval)
      revealAll()
    }
  }

  function setNewHighScore(){
    localStorage.setItem("minesweeper-high-score", time.innerText)
    highScore = localStorage.getItem("minesweeper-high-score")
    HIGHSCORE.innerText = "Your high score: " + highScore + " s"
  }

  function revealAll(){
    tiles.forEach((item) => {
      if (item.classList.contains("bomb")){
        item.childNodes[0].removeAttribute("style")
        item.classList.remove("unrevealed")
        item.classList.add("revealed")
        item.classList.remove("flag")
      }

      item.classList.add("disabled")
    })
  }

  function revealAdjacent(tile){
    const id = parseInt(tile.getAttribute("id"))
    const adjacent = getAdjacent(id)
    const realAdjacent = selectAdjacent(id, adjacent)

    realAdjacent.forEach((item) => {
      if (item.classList.contains("unrevealed") && !item.classList.contains("bomb")){
        item.classList.remove("unrevealed")
        item.classList.add("revealed")
        if (item.innerText === ""){
          revealAdjacent(item)
        }
      }
    })

  }

  function selectAdjacent(id, adjacent){
    if (id === 0){
      // 5, 7, 8
      return [adjacent[4], adjacent[6], adjacent[7]]
    } if (id === (WIDTH - 1)){
      //4, 6, 7
      return [adjacent[3], adjacent[5], adjacent[6]]
    } if (id === ((HEIGHT-1)*WIDTH)){
      //2, 3, 5
      return [adjacent[1], adjacent[2], adjacent[4]]
    } if (id === (HEIGHT*WIDTH - 1)){
      //1, 2, 4
      return [adjacent[0], adjacent[1], adjacent[3]]
    } if (id < WIDTH){
      //4, 5, 6, 7, 8
      return [adjacent[3], adjacent[4], adjacent[5], adjacent[6], adjacent[7]]
    } if ((id % WIDTH) === 0){
      //2, 3, 5, 7, 8
      return [adjacent[1], adjacent[2], adjacent[4], adjacent[6], adjacent[7]]
    } if (id > ((HEIGHT-1)*WIDTH)){
      //1, 2, 3, 4, 5
      return [adjacent[0], adjacent[1], adjacent[2], adjacent[3], adjacent[4]]
    } if ((id % WIDTH) === (WIDTH-1)){
      //1, 2, 4, 6, 7
      return [adjacent[0], adjacent[1], adjacent[3], adjacent[5], adjacent[6]]
    }
      //1, 2, 3, 4, 5, 6, 7, 8
      return adjacent
  }
  

  function startGame(){
    while (MINEFIELD.firstChild) {
      MINEFIELD.removeChild(MINEFIELD.firstChild);
    }
    played = false
    remaining = NUMBER_OF_BOMBS
    tiles = []
    clearInterval(interval)
    setUpMinefield()
    placeBombs()
    placeNumbers()

    tileClickingLogic()
  }

  startGame()
})
