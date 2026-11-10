
const express = require('express');
const cors = require('cors');
const { Chess } = require('chess.js');

const app = express();

app.use(cors());
app.use(express.json());

const games = {};

app.post('/api/chess/new', (req, res) => {
    const gameId = Date.now().toString();
    const chess = new Chess();

    games[gameId] = {
        chess: chess,
        history: []
    };

    res.status(201).json({
        gameId: gameId,
        fen: chess.fen()
    });
});

app.post('/api/chess/move', (req, res) => {
    const { gameId, from, to } = req.body;
    const game = games[gameId];

    if (!game) {
        return res.status(404).json({
            error: 'Game not found'
        });
    }

    try {
        const move = game.chess.move({
            from: from,
            to: to
        });

        if (!move) {
            return res.status(400).json({
                error: 'Invalid move'
            });
        }

        game.history.push(move.san);

        res.json({
            fen: game.chess.fen(),
            turn: game.chess.turn(),
            isCheck: game.chess.isCheck(),
            isGameOver: game.chess.isGameOver(),
            result: game.chess.isCheckmate()
                ? 'checkmate'
                : game.chess.isStalemate()
                ? 'stalemate'
                : game.chess.isDraw()
                ? 'draw'
                : null
        });
    } catch (error) {
        res.status(400).json({
            error: 'Invalid move'
        });
    }
});

app.get('/api/chess/state/:gameId', (req, res) => {
    const game = games[req.params.gameId];

    if (!game) {
        return res.status(404).json({
            error: 'Game not found'
        });
    }

    res.json({
        gameId: req.params.gameId,
        fen: game.chess.fen(),
        history: game.history,
        turn: game.chess.turn(),
        isCheck: game.chess.isCheck(),
        isGameOver: game.chess.isGameOver()
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Chess API запущен: http://localhost:${PORT}`);
});
