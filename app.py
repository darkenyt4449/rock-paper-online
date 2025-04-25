from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room
import os
import random
import string

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store game data: room_code -> {'players': [], 'moves': {}}
games = {}

@app.route('/')
def index():
    return render_template('index.html')

def generate_room_code():
    """Generate a random 4-character uppercase room code."""
    return ''.join(random.choices(string.ascii_uppercase, k=4))

@socketio.on('create_room')
def handle_create():
    """Handle room creation."""
    room = generate_room_code()
    games[room] = {'players': [request.sid], 'moves': {}}
    join_room(room)
    emit('room_created', {'room': room})

@socketio.on('join_room')
def handle_join(data):
    """Handle joining a room."""
    room = data['room']
    if room in games and len(games[room]['players']) < 2:
        games[room]['players'].append(request.sid)
        join_room(room)
        emit('room_joined', {'room': room})
        socketio.emit('both_ready', room=room)  # Notify both players that the game can start
    else:
        emit('error', {'message': 'Room not found or full. Please try creating a new room.'})

@socketio.on('player_move')
def handle_player_move(data):
    """Handle player move."""
    room = data['room']
    move = data['move']
    sid = request.sid
    game = games[room]

    game['moves'][sid] = move
    if len(game['moves']) == 2:
        # Both players have made their move, calculate the result
        p1_sid, p2_sid = game['players']
        p1_move = game['moves'][p1_sid]
        p2_move = game['moves'][p2_sid]
        result = get_result(p1_move, p2_move)
        socketio.emit('game_result', {
            'p1': p1_move,
            'p2': p2_move,
            'result': result
        }, room=room)
        game['moves'] = {}  # Reset for next round

def get_result(p1, p2):
    """Determine the result of the game."""
    if p1 == p2:
        return "Draw!"
    elif (p1 == "rock" and p2 == "scissors") or \
         (p1 == "paper" and p2 == "rock") or \
         (p1 == "scissors" and p2 == "paper"):
        return "Player 1 Wins!"
    else:
        return "Player 2 Wins!"

@socketio.on('disconnect')
def handle_disconnect():
    """Handle player disconnection and clean up rooms."""
    for room, game in games.items():
        if request.sid in game['players']:
            game['players'].remove(request.sid)
            socketio.emit('player_disconnected', {'message': 'A player has disconnected.'}, room=room)
            if len(game['players']) == 0:
                del games[room]  # Clean up the room if no players are left
            break

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
