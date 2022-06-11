const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const {
  puzzlesAndSolutions,
  invalidPuzzles,
} = require('../controllers/puzzle-strings');

let solver = new Solver();

suite('UnitTests', () => {

  test('Logic handles a valid puzzle string of 81 characters', (done) => {
    const puzzleString = puzzlesAndSolutions[0][0];
    const result = solver.validate(puzzleString);
    assert.deepEqual(result, { valid: true });

    done();
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', (done) => {
    const puzzleString = invalidPuzzles.invalidCharacters;
    const result = solver.validate(puzzleString);
    assert.deepEqual(result, { error: 'Invalid characters in puzzle' });

    done();
  });

  test('Logic handles a puzzle string that is not 81 characters in length', (done) => {
    const puzzleString = invalidPuzzles.invalidLength;
    const result = solver.validate(puzzleString);
    assert.deepEqual(result, { error: 'Expected puzzle to be 81 characters long' });

    done();
  });

  test('Logic handles a valid row placement', (done) => {
    const puzzleString = puzzlesAndSolutions[0][0];
    const row = 'E';
    const col = '4';
    const value = '9';
    const result = solver.checkRowPlacement(puzzleString, row, col, value);
    assert.isTrue(result);

    done();
  });

  test('Logic handles an invalid row placement', (done) => {
    const puzzleString = puzzlesAndSolutions[0][0];
    const row = 'E';
    const col = '4';
    const value = '8';
    const result = solver.checkRowPlacement(puzzleString, row, col, value);
    assert.isFalse(result);

    done();
  });

  test('Logic handles a valid column placement', (done) => {
    const puzzleString = puzzlesAndSolutions[0][0];
    const row = 'E';
    const col = '4';
    const value = '9';
    const result = solver.checkColPlacement(puzzleString, row, col, value);
    assert.isTrue(result);

    done();
  });

  test('Logic handles an invalid column placement', (done) => {
    const puzzleString = puzzlesAndSolutions[0][0];
    const row = 'F';
    const col = '1';
    const value = '4';
    const result = solver.checkColPlacement(puzzleString, row, col, value);
    assert.isFalse(result);

    done();
  });

  test('Logic handles a valid region (3x3 grid) placement', (done) => {
    const puzzleString = puzzlesAndSolutions[0][0];
    const row = 'F';
    const col = '1';
    const value = '1';
    const result = solver.checkRegionPlacement(puzzleString, row, col, value);
    assert.isTrue(result);

    done();
  });

  test('Logic handles an invalid region (3x3 grid) placement', (done) => {
    const puzzleString = puzzlesAndSolutions[0][0];
    const row = 'F';
    const col = '1';
    const value = '9';
    const result = solver.checkRegionPlacement(puzzleString, row, col, value);
    assert.isFalse(result);

    done();
  });

  test('Valid puzzle strings pass the solver', (done) => {
    puzzlesAndSolutions.forEach((puzzle, index) => {
      const result = solver.solve(puzzle[1]);
      assert.equal(result, puzzle[1], `puzzle #${index + 1} failed`);
    });

    done();
  });

  test('Invalid puzzle strings fail the solver', (done) => {
    const invalidCharactersResult = solver.solve(invalidPuzzles.invalidCharacters);
    const invalidLengthResult = solver.solve(invalidPuzzles.invalidLength);
    assert.deepEqual(invalidCharactersResult, {
      error: 'Invalid characters in puzzle',
    });
    assert.deepEqual(invalidLengthResult, {
      error: 'Expected puzzle to be 81 characters long',
    });

    done();
  });

  test('Solver returns the expected solution for an incomplete puzzle', (done) => {
    puzzlesAndSolutions.forEach((puzzle, index) => {
      const result = solver.solve(puzzle[0]);
      assert.equal(result, puzzle[1], `puzzle #${index + 1} failed`);
    });

    done();
  });
});
