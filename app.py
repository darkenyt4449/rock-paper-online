from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

players = {}
moves = {}
replay_votes = set()

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    if len(players) >= 2:
        emit('room-full')
        return

    player_num = 1 if 1 not in players else 2
    players[player_num] = request.sid
    emit('player-number', player_num)

@socketio.on('disconnect')
def handle_disconnect():
    for player, sid in list(players.items()):
        if sid == request.sid:
            del players[player]
            moves.clear()
            replay_votes.clear()
            socketio.emit('waiting')

@socketio.on('player-move')
def handle_move(data):
    moves[data['player']] = data['move']
    
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

@socketio.on('replay-request')
def handle_replay():
    for player, sid in players.items():
        if sid == request.sid:
            replay_votes.add(player)

    if len(replay_votes) == 2:
        replay_votes.clear()
        socketio.emit('replay-start')
    else:
        emit('waiting-replay')

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
