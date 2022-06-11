/**
 *  ||==================================||
 *  || A1 A2 A3 || A4 A5 A6 || A7 A8 A9 ||
 *  || B1 B2 B3 || B4 B5 B6 || B7 B8 B9 ||
 *  || C1 C2 C3 || C4 C5 C6 || C7 C8 C9 ||
 *  ||==================================||
 *  || D1 D2 D3 || D4 D5 D6 || D7 D8 D9 ||
 *  || E1 E2 E3 || E4 D5 E6 || E7 E8 E9 ||
 *  || F1 F2 F3 || F4 F5 F6 || F7 F8 F9 ||
 *  ||==================================||
 *  || G1 G2 G3 || G4 G5 G6 || G7 G8 G9 ||
 *  || H1 H2 H3 || H4 H5 H6 || H7 H8 H9 ||
 *  || I1 I2 I3 || I4 I5 I6 || I7 I8 I9 ||
 *  ||==================================||
 */
const ILLEGAL_CHAR_REGEX = new RegExp('[^1-9.]', 'gi');
const COORDINATE_REGEX = new RegExp('^[A-I][1-9]$');
const VALUE_REGEX = new RegExp('^[1-9]$');
const EMPTY_REGEX = new RegExp('^.*\\..*$');
const errors = {
  PUZZLE_FIELD_MISSING: 'Required field missing',
  REQUIRED_FIELDS_MISSING: 'Required field(s) missing',
  INVALID_PUZZLE_CHARACTERS: 'Invalid characters in puzzle',
  INVALID_PUZZLE_LENGTH: 'Expected puzzle to be 81 characters long',
  CANNOT_BE_SOLVED: 'Puzzle cannot be solved',
  INVALID_COORDINATE: 'Invalid coordinate',
  INVALID_VALUE: 'Invalid value',
};

class SudokuSolver {

  checkPlacementService(puzzleString, coordinate, value) {
    if (!puzzleString || !coordinate || !value) {

      return {
        error: errors.REQUIRED_FIELDS_MISSING,
      };
    }

    if (puzzleString.length !== 81) {

      return {
        error: errors.INVALID_PUZZLE_LENGTH,
      };
    }

    if (ILLEGAL_CHAR_REGEX.test(puzzleString)) {

      return {
        error: errors.INVALID_PUZZLE_CHARACTERS,
      }
    }

    if (!COORDINATE_REGEX.test(coordinate)) {

      return {
        error: errors.INVALID_COORDINATE,
      };
    }

    if (!VALUE_REGEX.test(value)) {

      return {
        error: errors.INVALID_VALUE,
      };
    }

    // Inputs should be valid at this point
    const row = coordinate.charAt(0);
    const col = coordinate.charAt(1);
    const conflicts = [];

    const isRowValid = this.checkRowPlacement(puzzleString, row, col, value);
    const isColValid = this.checkColPlacement(puzzleString, row, col, value);
    const isRegionValid = this.checkRegionPlacement(puzzleString, row, col, value);

    if (!isRowValid) {
      conflicts.push('row');
    }
    if (!isColValid) {
      conflicts.push('column');
    }
    if (!isRegionValid) {
      conflicts.push('region');
    }

    if (conflicts.length) {

      return {
        valid: false,
        conflicts,
      };
    }

    return {
      valid: true,
    };
  }

  solve(puzzleString) {
    if (!puzzleString) {

      return {
        error: errors.PUZZLE_FIELD_MISSING,
      };
    }

    const validationResult = this.validate(puzzleString);
    if (validationResult.error) {

      return validationResult;
    }

    const solvedRegex = new RegExp('^[1-9]{81}$');
    if (solvedRegex.test(puzzleString)) {

      return puzzleString;
    }

    let puzzleArray = puzzleString.split('');
    for (let cellIndex = 0; cellIndex < puzzleArray.length; cellIndex += 1) {
      if (puzzleArray[cellIndex] === '.') {
        const rowIndex = Math.floor(cellIndex / 9);
        const colIndex = cellIndex % 9;
        const rowPoint = this.convertRowIndexToCoordinate(rowIndex);
        const colPoint = this.convertColumnIndexToCoordinate(colIndex);

        const validValues = [];
        for (let value = 1; value <= 9; value += 1) {
          if (
            this.checkRowPlacement(puzzleString, rowPoint, colPoint, `${value}`) &&
            this.checkColPlacement(puzzleString, rowPoint, colPoint, `${value}`) &&
            this.checkRegionPlacement(puzzleString, rowPoint, colPoint, `${value}`)
          ) {
            validValues.push(`${value}`);
          }
        }

        if (validValues.length === 1) {
          puzzleArray[cellIndex] = validValues[0];
        }
      }
    }


    const updatedPuzzleString = puzzleArray.join('');

    if (puzzleString === updatedPuzzleString) {

      return {
        error: errors.CANNOT_BE_SOLVED,
      };
    }

    return this.solve(updatedPuzzleString);
  }

  validate(puzzleString) {
    if (ILLEGAL_CHAR_REGEX.test(puzzleString)) {

      return {
        error: errors.INVALID_PUZZLE_CHARACTERS,
      };
    }

    if (puzzleString.length !== 81) {

      return {
        error: errors.INVALID_PUZZLE_LENGTH,
      };
    }

    let index = 0;
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const puzzleArray = puzzleString.split('');
        const value = puzzleArray[index];
        if (value !== '.') {
          const rowPoint = this.convertRowIndexToCoordinate(row);
          const colPoint = this.convertColumnIndexToCoordinate(col);
          const rowIsValid = this.checkRowPlacement(puzzleString, rowPoint, colPoint, value);
          const colIsValid = this.checkColPlacement(puzzleString, rowPoint, colPoint, value);
          const regionIsValid = this.checkRegionPlacement(puzzleString, rowPoint, colPoint, value);

          if (!rowIsValid || !colIsValid || !regionIsValid) {

            return {
              error: errors.CANNOT_BE_SOLVED,
            };
          }
        }
        index += 1;
      }
    }

    return { valid: true };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    let rowCells = this.getRowCellsOfCoord(puzzleString, row);
    const colIndex = this.convertColumnCoordinateToIndex(column);
    rowCells.splice(colIndex, 1);
    if (rowCells.includes(value)) {

      return false;
    }

    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    let colCells = this.getColumnCellsOfCoord(puzzleString, column);
    const rowIndex = this.convertRowCoordinateToIndex(row);
    colCells.splice(rowIndex, 1);
    if (colCells.includes(value)) {

      return false;
    }

    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    let regionCells = this.getRegionCellsOfCoord(puzzleString, row, column);
    let rowIndex = this.convertRowCoordinateToIndex(row);
    let colIndex = this.convertColumnCoordinateToIndex(column);

    if (rowIndex > 2) {
      rowIndex = rowIndex < 6
        ? rowIndex - 3
        : rowIndex - 6;
    }

    if (colIndex > 2) {
      colIndex = colIndex < 6
        ? colIndex - 3
        : colIndex - 6;
    }

    const regionCellIndex = (rowIndex * 3) + colIndex;
    regionCells.splice(regionCellIndex, 1);
    if (regionCells.includes(value)) {

      return false;
    }

    return true;
  }

  getRowCellsOfCoord(puzzleString, rowPoint) {
    const index = this.convertRowCoordinateToIndex(rowPoint);
    const startIndex = index * 9;
    const puzzleArray = puzzleString.split('');

    return puzzleArray.slice(startIndex, startIndex + 9);
  }

  getColumnCellsOfCoord(puzzleString, colPoint) {
    const startIndex = this.convertColumnCoordinateToIndex(colPoint);
    let columnCells = [];
    const puzzleArray = puzzleString.split('');
    for (let idx = startIndex; idx < 81; idx += 9) {
      columnCells.push(puzzleArray[idx]);
    }

    return columnCells;
  }

  getRegionCellsOfCoord(puzzleString, row, col) {
    let minRowIndex;
    let minColIndex;
    let regionCells = [];
    const puzzleArray = puzzleString.split('');

    if (/^[A-C]$/.test(row)) {
      minRowIndex = 0;
    } else if (/^[D-F]$/.test(row)) {
      minRowIndex = 3;
    } else if (/^[G-I]$/.test(row)) {
      minRowIndex = 6;
    }

    if (/^[1-3]$/.test(col)) {
      minColIndex = 0;
    } else if (/^[4-6]$/.test(col)) {
      minColIndex = 3;
    } else if (/^[7-9]$/.test(col)) {
      minColIndex = 6;
    }

    for (let r = minRowIndex; r < minRowIndex + 3; r += 1) {
      for (let c = minColIndex; c < minColIndex + 3; c += 1) {
        const idx = (r * 9) + c;
        regionCells.push(puzzleArray[idx]);
      }
    }

    return regionCells;
  }

  convertRowIndexToCoordinate(index) {

    return String.fromCharCode(index + 65);
  }

  convertColumnIndexToCoordinate(index) {

    return `${index + 1}`;
  }

  convertRowCoordinateToIndex(coord) {

    return coord.charCodeAt(0) - 65;
  }

  convertColumnCoordinateToIndex(coord) {

    return parseInt(coord, 10) - 1;
  }
}

module.exports = SudokuSolver;

