from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

players = {}
moves = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    if len(players) >= 2:
        emit('room-full')
        return

    # Assign player number
    player_num = 1 if 1 not in players else 2
    players[player_num] = request.sid
    emit('player-number', player_num)

    # Notify the new player if they are Player 1 or Player 2
    if player_num == 1:
        emit('game-message', 'You are Player 1. Waiting for Player 2 to join...')
    else:
        emit('game-message', 'You are Player 2. Waiting for Player 1 to make a move...')

@socketio.on('disconnect')
def handle_disconnect():
    # Remove player from the dictionary on disconnect
    for player, sid in list(players.items()):
        if sid == request.sid:
            del players[player]
            break

    moves.clear()

    # Notify all players that someone has left
    socketio.emit('game-message', 'A player has disconnected. Waiting for a new player...')

@socketio.on('player-move')
def handle_move(data):
    moves[data['player']] = data['move']

    # Once both players have made their moves, calculate the result
    if len(moves) == 2:
        p1 = moves[1]
        p2 = moves[2]
        result = get_result(p1, p2)
        socketio.emit('game-result', {
            'move1': p1,
            'move2': p2,
            'result': result
        })
        moves.clear()

def get_result(p1, p2):
    if p1 == p2:
        return 'Draw!'
    elif (p1 == 'rock' and p2 == 'scissors') or \
         (p1 == 'paper' and p2 == 'rock') or \
         (p1 == 'scissors' and p2 == 'paper'):
        return 'Player 1 Wins!'
    else:
        return 'Player 2 Wins!'

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
