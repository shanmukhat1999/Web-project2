import os

from flask import Flask, render_template, session, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit
from flask_session import Session
from datetime import datetime

app = Flask(__name__)
# configuring session to use filesystem


app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# configuring socketio
app.config["SECRET_KEY"] = 'thisisasecret'
socketio = SocketIO(app)

rooms = [] 
users = []  
messages = dict()


@app.route("/")
def index():
    if "username" in session and "chatid" in session:
        i=session["chatid"]
        i=int(i)
        return redirect(url_for('chatroom',chatid=i))
    elif "username" in session:    
        return redirect(url_for('roomlist'))
    return render_template("index.html")


@app.route("/logout")
def logout():
    try:
        k=session.pop("username")
    except KeyError:
        return render_template("error.html",message="you are not logged in yet")
    if "chatid" in session:
        session.pop("chatid")    
    users.remove(k)
    return redirect(url_for('index'))

@app.route("/roomlist",methods=["GET","POST"])
def roomlist():
    if request.method == "POST":
        username=request.form.get("username")
        if username in users:
            return render_template("error.html",message="username already exists")
        if "username" in session:
            users.remove(session["username"])
            session.pop("username")
        if "chatid" in session:
            session.pop("chatid")    
        users.append(username)
        session["username"]=username
            
    if request.method == "GET":
        if "username" not in session:
            return render_template("error.html",message="you have to log in first")
        if "chatid" in session:
            session.pop("chatid")       
    return render_template("roomlist.html",rooms=rooms)      

@app.route("/chatroom/<int:chatid>",methods=["GET"])
def chatroom(chatid):
    if request.method == "GET":
        if "username" not in session:
            return render_template("error.html",message="you have to log in first")
        if chatid > len(rooms):
            return render_template("error.html",message="this room doesnot exist")    
        roomname=rooms[chatid-1]
        session["chatid"]=str(chatid)
    return render_template("chatroom.html",roomname=roomname,messages=messages[chatid],chatid=session["chatid"],username=session["username"])     
        
@app.route("/chatrooms",methods=["POST"])
def chatrooms():
    if "username" not in session:
        return render_template("error.html",message="you have to log in first")
    if "chatid" in session:    
        session.pop("chatid") 
    d={}
    print("sent")
    for i in range(0,len(rooms)):
        d[i+1] = rooms[i]
    return jsonify(d)   

@app.route("/roomid",methods=["POST"])
def roomid():
    if "username" not in session:
        return render_template("error.html",message="you have to log in first")
    d={}
    print("sent")
    room_id = request.form.get("room_id")
    room_id=int(room_id)
    session["chatid"]=str(room_id)
    d["msgs"] = messages[room_id]
    return jsonify(d)    

@socketio.on('new room')
def new_room(data):
    global rooms
    roomname=data["roomname"]
    if roomname in rooms:
        emit('already exists',{"r":"r"},broadcast=False)
    else:
        rooms.append(roomname)
        i=len(rooms)-1
        messages[i+1]=[]
        emit('add room',{"chatid":len(rooms),"roomname":roomname},broadcast=True)

@socketio.on('new message')
def new_message(data):
    message=data["message"]
    i=data["chat_id"]
    i=int(i)
    username=data["username"]
    now = datetime.now()
    dt_string = now.strftime("%d/%m/%Y %H:%M:%S")	
    k="<"+dt_string+" >\t\t\t\t"+username+" : "+message
    messages[i].append(k)    
    emit('add message',{"message":k,"chatid":i},broadcast=True)     

 

if __name__ == "__main__":
    app.run(debug=True)       
