'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {

  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const {
        puzzle,
        coordinate,
        value,
      } = req.body;
      const response = solver.checkPlacementService(puzzle, coordinate, value);

      return res.json(response);
    });

  app.route('/api/solve')
    .post((req, res) => {
      const result = solver.solve(req.body.puzzle);
      if (result.error) {

        return res.json(result);
      }

      return res.json({ solution: result });
    });
};
