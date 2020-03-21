import React, { Component } from "react";
import { CompactPicker } from "react-color";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

const periodicity = 4;
const height = 8;
const width = 12;

const randomVector = () => {
    const x = (Math.random() < 0.5 ? -1 : 1) * Math.random();
    const y = (Math.random() < 0.5 ? -1 : 1) * Math.random();
    const length = Math.sqrt(x**2 + y**2);
    return {
        x: x/length,
        y: y/length
    }
}

const interpolate = (a, b, weight) => {
  const interpolatedValue = (1 - weight) * a + weight * b;
  const normalizedValue = 2 * ((interpolatedValue - -1) / (1 - -1)) - 1;
  return normalizedValue;
};

const dotGridGradient = ({
  gradientX,
  gradientY,
  pointX,
  pointY,
  gradientMap
}) => {
  const dx = pointX / periodicity - gradientX;
  const dy = pointY / periodicity - gradientY;
  const vector = gradientMap[gradientY][gradientX];
  const dotProduct = dx * vector.x + dy * vector.y;
  return dotProduct;
};

const perlin = ({ x, y, gradientMap }) => {
  // assume period 4 for now
  const gradientX0 = Math.floor(x / periodicity);
  const gradientX1 = gradientX0 + 1;
  const gradientY0 = Math.floor(y / periodicity);
  const gradientY1 = gradientY0 + 1;

  // interpolation weights
  const sx = x / periodicity - gradientX0;
  const sy = y / periodicity - gradientY0;
  const v1 = dotGridGradient({
    gradientX: gradientX0,
    gradientY: gradientY0,
    pointX: x,
    pointY: y,
    gradientMap
  });
  const v2 = dotGridGradient({
    gradientX: gradientX1,
    gradientY: gradientY0,
    pointX: x,
    pointY: y,
    gradientMap
  });
  const interpolatedX0 = interpolate(v1, v2, sx);

  const v3 = dotGridGradient({
    gradientX: gradientX0,
    gradientY: gradientY1,
    pointX: x,
    pointY: y,
    gradientMap
  });
  const v4 = dotGridGradient({
    gradientX: gradientX1,
    gradientY: gradientY1,
    pointX: x,
    pointY: y,
    gradientMap
  });
  const interpolatedX1 = interpolate(v3, v4, sx);

  return interpolate(interpolatedX0, interpolatedX1, sy);
};

const clampColor = c => {
  return Math.min(255, Math.max(0, c));
};

const RGBCell = ({
  state,
  row,
  col,
  key,
  baseColor,
  rRange,
  gRange,
  bRange
}) => {
  debugger;
  const r = clampColor(Math.floor(baseColor.r + state.r * rRange));
  const g = clampColor(Math.floor(baseColor.g + state.g * gRange));
  const b = clampColor(Math.floor(baseColor.b + state.b * bRange));
  return (
    <div
      key={key}
      row={row}
      col={col}
      style={{
        backgroundColor: `rgb(${r}, ${g}, ${b})`
      }}
      className={`cell`}
    ></div>
  );
};

const Cell = ({ state, row, col, key, baseColor, range }) => {
  const intensity = 255 - range * ((state + 1) / 2);
  return (
    <div
      key={key}
      row={row}
      col={col}
      style={{
        backgroundColor: `rgb(${intensity}, ${intensity}, ${intensity})`
      }}
      className={`cell`}
    ></div>
  );
};

const Grid = ({ cells, baseColor, rRange, gRange, bRange, range }) => {
  console.log(cells);
  return (
    <div className="grid">
      {cells.map((rowState, row) => {
        return (
          <div key={`row${row}`} className="row">
            {rowState.map((cell, col) => {
              if (typeof cell === "object") {
                return RGBCell({
                  state: cell,
                  key: `cell${row}${col}`,
                  row,
                  col,
                  baseColor,
                  rRange,
                  gRange,
                  bRange
                });
              } else {
                return Cell({
                  state: cell,
                  key: `cell${row}${col}`,
                  row,
                  col,
                  baseColor,
                  range
                });
              }
            })}
          </div>
        );
      })}
    </div>
  );
};

export default class Perlin extends Component {
  constructor() {
    super();
    this.state = {
      cells: new Array(height).fill(0).map(row => {
        return new Array(width).fill(0);
      }),
      gradientMapOne: Array.from({ length: height / periodicity + 1 }, () => {
        return Array.from({ length: width / periodicity + 1 }, () => {
          return randomVector();
        });
      }),
      gradientMapTwo: Array.from({ length: height / periodicity + 1 }, () => {
        return Array.from({ length: width / periodicity + 1 }, () => {
          return randomVector();
        });
      }),
      gradientMapThree: Array.from({ length: height / periodicity + 1 }, () => {
        return Array.from({ length: width / periodicity + 1 }, () => {
          return randomVector();
        });
      }),
      baseColor: { r: 255, g: 255, b: 255 },
      rRange: 255,
      gRange: 255,
      bRange: 255
    };
  }

  handleColorChange(color) {
    this.setState({ baseColor: color.rgb });
  }

  sliderChange(component, v) {
    if (component === "r") {
      this.setState({ rRange: v });
    } else if (component === "g") {
      this.setState({ gRange: v });
    } else if (component === "b") {
      this.setState({ bRange: v });
    }
  }

  regenerateGradientMap() {
    this.setState({
      gradientMapOne: Array.from({ length: height / periodicity + 1 }, () => {
        return Array.from({ length: width / periodicity + 1 }, () => {
          return randomVector();
        });
      }),
      gradientMapTwo: Array.from({ length: height / periodicity + 1 }, () => {
        return Array.from({ length: width / periodicity + 1 }, () => {
          return randomVector();
        });
      }),
      gradientMapThree: Array.from({ length: height / periodicity + 1 }, () => {
        return Array.from({ length: width / periodicity + 1 }, () => {
          return randomVector();
        });
      })
    });
  }

  render() {
    const noiseMap1 = this.state.cells.map((row, y) => {
      return row.map((cell, x) => {
        return perlin({
          x,
          y,
          gradientMap: this.state.gradientMapOne
        });
      });
    });
    const noiseMap2 = this.state.cells.map((row, y) => {
      return row.map((cell, x) => {
        return perlin({
          x,
          y,
          gradientMap: this.state.gradientMapTwo
        });
      });
    });
    const noiseMap3 = this.state.cells.map((row, y) => {
      return row.map((cell, x) => {
        return perlin({
          x,
          y,
          gradientMap: this.state.gradientMapThree
        });
      });
    });
    const combinedNoiseMap = this.state.cells.map((row, y) => {
      return row.map((cell, x) => {
        return {
          r: perlin({
            x,
            y,
            gradientMap: this.state.gradientMapOne
          }),
          g: perlin({
            x,
            y,
            gradientMap: this.state.gradientMapTwo
          }),
          b: perlin({
            x,
            y,
            gradientMap: this.state.gradientMapThree
          })
        };
      });
    });
    return (
      <div className="perlin-parent">
        <div className="perlin-container">
          <div className="grid-container">
            {Grid({
              cells: noiseMap1,
              baseColor: this.state.baseColor,
              range: this.state.rRange
            })}
            red influence
            <Slider
              min={0}
              max={255}
              defaultValue={this.state.rRange}
              onAfterChange={this.sliderChange.bind(this, "r")}
            />
          </div>
          <div className="grid-container">
            {Grid({
              cells: noiseMap2,
              baseColor: this.state.baseColor,
              range: this.state.gRange
            })}
            green influence
            <Slider
              min={0}
              max={255}
              defaultValue={this.state.gRange}
              onAfterChange={this.sliderChange.bind(this, "g")}
            />
          </div>
          <div className="grid-container">
            {Grid({
              cells: noiseMap3,
              baseColor: this.state.baseColor,
              range: this.state.bRange
            })}
            blue influence
            <Slider
              min={0}
              max={255}
              defaultValue={this.state.bRange}
              onAfterChange={this.sliderChange.bind(this, "b")}
            />
          </div>
        </div>
        ...
        <div className="perlin-container">
          {Grid({
            cells: combinedNoiseMap,
            baseColor: this.state.baseColor,
            rRange: this.state.rRange,
            bRange: this.state.bRange,
            gRange: this.state.gRange
          })}
          <CompactPicker
            color={this.state.baseColor}
            onChangeComplete={this.handleColorChange.bind(this)}
          />
        </div>
        <div className="perlin-container">
          <button
            className="regen"
            onClick={this.regenerateGradientMap.bind(this)}
          >
            Regenerate Gradient Maps
          </button>
        </div>
      </div>
    );
  }
}
