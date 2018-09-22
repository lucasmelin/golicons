// umd module:
// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.golicons = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function timeNowSeconds() {
    return performance.now() / 1000;
  }

  class GOL {
    constructor(el) {
      this._el = el;
      this._state = beacon(); 
      this._newState = beacon(); 
      this._tickDelayMs = 500;
      this._cells = [];

      this._numRows = this._state.length;
      this._numCols = this._state[0].length;

      const dim = el.getBoundingClientRect();
      const cellWidth = dim.width / this._numCols;
      const cellHeight = dim.height / this._numRows;

      console.log(dim);

      const svg = document.createElementNS(SVG_NS, 'svg');
      el.appendChild(svg);
      
      for (let i = 0; i < this._state.length; i++) {
        const row = document.createElementNS(SVG_NS, 'g');
        this._cells[i] = [];
        row.classList.add('goli-row');
        row.setAttribute('transform', 'translate(0, ' + i*cellHeight + ')');
        svg.appendChild(row);
        for (let j = 0; j < this._state[0].length; j++) {
          const cell = document.createElementNS(SVG_NS, 'rect');
          cell.setAttribute('width', cellWidth);
          cell.setAttribute('height', cellHeight);
          cell.setAttribute('x', j*cellWidth);
          row.appendChild(cell);
          this._cells[i][j] = cell;
        }
      }

      this.render();
    }
    
    start() {
      //for (let i = 0; i < 3; i++) {
      //  this.tick();
      //}
      setInterval(() => {
        //this.printState();
        const startTime = timeNowSeconds();
        this.tick();
        const endTickTime = timeNowSeconds();
        //console.log(`Tick time: ${endTickTime - startTime}`);
        this.render();
        //console.log(`Render time: ${timeNowSeconds() - endTickTime}`);
      }, this._tickDelayMs);
    }

    printState() {
      for (let i = 0; i < this._state.length; i++) {
        const row = this._state[i];
        console.log(JSON.stringify(row), i);
      }
      console.log();
    }

    tick() {
      copyState(this._state, this._newState);

      for (let i = 0; i < this._state.length; i++) {
        for (let j = 0; j < this._state[0].length; j++) {
          const neighbors = this.neighbors(i, j);
          //this.printState();
          //console.log(`Neighbors for (${i}, ${j})`);
          //console.log(neighbors);

          let aliveCount = 0;

          // TODO: this can be generated on the fly in neighbors
          for (const neighbor of neighbors) {
            if (neighbor === 1) {
              aliveCount++;
            }
          }

          const currentState = this._state[i][j];
          //console.log("currentState: " + currentState);
          let newState = currentState;
          if (currentState === 1) {
            if (aliveCount < 2) {
              // underpopulation
              newState = 0;
            }
            else if (aliveCount > 3) {
              // overpopulation
              newState = 0;
            }
            else {
              // stays alive
              newState = 1;
            }
          }
          else {
            if (aliveCount === 3) {
              // reproduction
              newState = 1;
            }
          }

          //console.log("Setting to: " + newState);
          this._newState[i][j] = newState;
        }
      }

      copyState(this._newState, this._state);
    }

    neighbors(i, j) {
      // TODO: get rid of this allocation
      const n = [];
      n.push(this.topLeft(i, j));
      n.push(this.top(i, j));
      n.push(this.topRight(i, j));
      n.push(this.left(i, j));
      n.push(this.right(i, j));
      n.push(this.bottomLeft(i, j));
      n.push(this.bottom(i, j));
      n.push(this.bottomRight(i, j));
      return n;
    }

    wrapTop(i) {
      if (i === 0) {
        return this._state.length - 1;
      }
      return i - 1;
    }

    wrapLeft(j) {
      if (j === 0) {
        return this._state[0].length - 1;
      }
      return j - 1;
    }

    wrapRight(j) {
      if (j === this._state[0].length - 1) {
        return 0;
      }
      return j + 1;
    }

    wrapBottom(i) {
      if (i === this._state.length - 1) {
        return 0;
      }
      return i + 1;
    }

    topLeft(i, j) {
      return this._state[this.wrapTop(i)][this.wrapLeft(j)];
    }

    top(i, j) {
      return this._state[this.wrapTop(i)][j];
    }

    topRight(i, j) {
      return this._state[this.wrapTop(i)][this.wrapRight(j)];
    }

    left(i, j) {
      return this._state[i][this.wrapLeft(j)];
    }

    right(i, j) {
      return this._state[i][this.wrapRight(j)];
    }

    bottomLeft(i, j) {
      return this._state[this.wrapBottom(i)][this.wrapLeft(j)];
    }

    bottom(i, j) {
      return this._state[this.wrapBottom(i)][j];
    }

    bottomRight(i, j) {
      return this._state[this.wrapBottom(i)][this.wrapRight(j)];
    }

    render() {
      for (let i = 0; i < this._numRows; i++) {
        for (let j = 0; j < this._numCols; j++) {
          const state = this._state[i][j];

          if (state === 1) {
            this._cells[i][j].classList.remove('goli-dead');
            this._cells[i][j].classList.add('goli-alive');
          }
          else {
            this._cells[i][j].classList.remove('goli-alive');
            this._cells[i][j].classList.add('goli-dead');
          }
        }
      }
    }
  }

  function blinker() {
    return [
      [ 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0 ],
      [ 0, 0, 0, 0, 0 ],
    ];
  }

  function beacon() {
    return [
      [ 0, 0, 0, 0, 0, 0 ],
      [ 0, 1, 1, 0, 0, 0 ],
      [ 0, 1, 1, 0, 0, 0 ],
      [ 0, 0, 0, 1, 1, 0 ],
      [ 0, 0, 0, 1, 1, 0 ],
      [ 0, 0, 0, 0, 0, 0 ],
    ];
  }
  
  function copyState(a, b) {
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[0].length; j++) {
        b[i][j] = a[i][j];
      }
    }
  }

  function activate({ domId, domClass }) {
    if (domId) {
      const el = document.getElementById(domId);
      console.log(el);
      const gol = new GOL(el);
      gol.start();
      return gol;
    }
    else if (domClass) {
      throw "domClass not implemented yet";
    }
  }

  return {
    activate,
  };
}));
