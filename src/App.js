import React, { useState, useCallback, useRef } from "react";
import produce from "immer";
import Imageupload from "./Imageupload";
import html2canvas from "html2canvas";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { BrowserRouter as Router, Switch, Route } from "react-router-dom";


const numRows = 28;
const numCols = 63;

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

const generateRandomGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
      Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
    );
  }
  return rows;
}

const randomStart = () => {
  let x = Math.floor(Math.random()*numRows);
  let y = Math.floor(Math.random()*numCols);
  return [x, y];
}

const getScreenshot = () => {
  html2canvas(document.querySelector("#grid")).then(canvas => {
    document.getElementsByTagName("button")[4].style.backgroundColor = "fff5ee";
    canvas.style.width = "512px"; // 1600/3 = 533.3, 700/3 = 233.3
    canvas.style.height = "224px"; // (16:7) * 32 = (512:224)
    canvas.style.margin = "3px";
    document.getElementById("flexbox-container").appendChild(canvas);
  });
}

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  const [running, setRunning] = useState(false);
  const [redEating, setEatting] = useState(false);
  // const [redStart, setRedStart] = useState([0,0]);
  const runningRef = useRef(running);
  runningRef.current = running;
  const eatingRef = useRef(redEating);
  eatingRef.current = redEating;
  const runningButton = React.createRef();
  
  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    
    setGrid(g => {
      return produce(g, gridCopy => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                neighbors += g[newI][newK];
              }
            });
            // if (gridCopy[i][k] === 2) continue;
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }

        let countMove = 0;
        let paleRedDot = randomStart();
        if (eatingRef.current) {
          let x = paleRedDot[0];
          let y = paleRedDot[1];
          directions.forEach(([dx, dy]) => {
            x += dx;
            y += dy;
            // console.log(x, y, gridCopy[x][y]); //Cannot read property '12' of undefined
            try {
              while (x >= 0 && x < numCols && y >= 0 && y < numRows && g[x][y] !== 1) {
                gridCopy[x][y] = 2;
                paleRedDot = [x, y];
                x += dx;
                y += dy;
              }
            } catch (err) {
              console.error(err);
            } finally {
              console.log(countMove++, paleRedDot);
            }
          })
        }
      })
    });

    setTimeout(runSimulation, 100);
  }, []);

  return (
    <>
      <button
        ref={runningButton}
        style={{ fontSize: "20px" }}
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          } else if (running) {
            runningRef.current = false;
            getScreenshot();
          }
        }}
      >
        {running ? "stop" : "start"}
      </button>
      <button
        style={{ fontSize: "20px" }}
        onClick={() => {
          setGrid(generateRandomGrid());
        }}
      >
        random
      </button>
      <button
        style={{ fontSize: "20px" }}
        onClick={() => {
          setGrid(generateEmptyGrid());
        }}
      >
        clear
      </button>
      <button variant="outline-danger"
        style={{ fontSize: "20px" }}
        onClick={() => {
          // setGrid({...grid, grid[0][0] = 2});
          setEatting(true);
          eatingRef.current = true;
        }}
      >
        {redEating ? "eatting" : "eat"}
      </button>
      <button
        style={{ fontSize: "20px" }}
        onClick={() => {
          getScreenshot();
        }}
      >
        screenshot
      </button> {" "}
      <button
        style={{ fontSize: "20px" }}
        onClick={() => {
          setGrid(generateEmptyGrid());
          setGrid(generateRandomGrid());
          runningButton.current.click(); // runSimulation();
          for (let i = 0; i < 5; i++) {
            setTimeout(function () {
              getScreenshot();
            }, i * 2500);
          }
        }}
      >
        Click me!📷📸📷
      </button>
      <div id="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 20px)`
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? (grid[i][k] >= 2 ? "red":"black") : undefined,
                border: "solid 1px black"
              }}
            ></div> //{`${i*numCols+k}`}
          ))
        )}
      </div>
      {/* <Router>
        <Switch>
          <Route exact path="/" children={<Node />} />
          <Route path="/todo/:id" children={<Node />} />
        </Switch>
      </Router> */}
      <Imageupload style={{ maxWidth: "500px", margin: "20px auto" }}
                    withPreview={true}/>
      <div id="capture" style={{ padding: 10, background: "black" }}>
        <h4 style={{ textAlign: "center", color: "white" }}>Screenshots</h4>
        <div id="flexbox-container" style={{ display: "flex", flexWrap: "wrap" }}>

        </div>
      </div>
    </>
  );
};

export default App;