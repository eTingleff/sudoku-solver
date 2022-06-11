const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

const {
  puzzlesAndSolutions,
  invalidPuzzles,
} = require('../controllers/puzzle-strings');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  suite('POST request to /api/solve', () => {
    const endpoint = '/api/solve';

    test('Solve a puzzle with valid puzzle string', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          puzzle: puzzlesAndSolutions[0][0],
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { puzzle: puzzlesAndSolutions[0][1] });

          done();
        });
    });

    test('Solve a puzzle with missing puzzle string', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({})
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Required field missing' });

          done();
        });
    });

    test('Solve a puzzle with invalid characters', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({ puzzle: invalidPuzzles.invalidCharacters })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });

          done();
        });
    });

    test('Solve a puzzle with incorrect length', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({ puzzle: invalidPuzzles.invalidLength })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });

          done();
        });
    });

    test('Solve a puzzle that cannot be solved', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({ puzzle: invalidPuzzles.cannotBeSolved })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });

          done();
        });
    });

  });

  suite('POST request to /api/check', () => {
    const endpoint = '/api/check';

    test('Check a puzzle placement with all fields', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'A2',
          puzzle: puzzlesAndSolutions[0][0],
          value: '3',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { valid: true });

          done();
        });
    });

    test('Check a puzzle placement with single placement conflict', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'A2',
          puzzle: puzzlesAndSolutions[0][0],
          value: '4',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            valid: false,
            conflicts: ['row'],
          });

          done();
        });
    });

    test('Check a puzzle placement with multiple placement conflicts', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'A2',
          puzzle: puzzlesAndSolutions[0][0],
          value: '5',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            valid: false,
            conflicts: [
              'row',
              'region',
            ],
          });

          done();
        });
    });

    test('Check a puzzle placement with all placement conflicts', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'A2',
          puzzle: puzzlesAndSolutions[0][0],
          value: '2',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            valid: false,
            conflicts: [
              'row',
              'column',
              'region',
            ],
          });

          done();
        });
    });

    test('Check a puzzle placement with missing required fields', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'B6',
          puzzle: puzzlesAndSolutions[0][0],
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Required field(s) missing' });

          done();
        });
    });

    test('Check a puzzle placement with invalid characters', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'A2',
          puzzle: invalidPuzzles.invalidCharacters,
          value: '5',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });

          done();
        });
    });

    test('Check a puzzle placement with incorrect length', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'A2',
          puzzle: invalidPuzzles.invalidLength,
          value: '5',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: 'Expected puzzle to be 81 characters long',
          });

          done();
        });
    });

    test('Check a puzzle placement with invalid placement coordinate', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'Z6',
          puzzle: puzzlesAndSolutions[0][0],
          value: '5',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Invalid coordinate' });

          done();
        });
    });

    test('Check a puzzle placement with invalid placement value', (done) => {
      chai.request(server)
        .post(endpoint)
        .send({
          coordinate: 'A2',
          puzzle: puzzlesAndSolutions[0][0],
          value: 'J',
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'Invalid value' });

          done();
        });
    });

  });

});

