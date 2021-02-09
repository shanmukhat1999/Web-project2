import os

from flask import Flask, render_template, session, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit
from flask_session import Session
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from dotenv import load_dotenv
load_dotenv()


ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
# configuring session to use filesystem


app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# configuring socketio
app.config["SECRET_KEY"] = 'thisisasecret'
socketio = SocketIO(app)

if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

engine= create_engine(os.getenv("DATABASE_URL"))
db =scoped_session(sessionmaker(bind=engine))

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
    db.execute("DELETE FROM users where username = :username",{"username":k})
    db.commit()
    return redirect(url_for('index'))

@app.route("/roomlist",methods=["GET","POST"])
def roomlist():
    if request.method == "POST":
        username=request.form.get("username")
        u = db.execute("select * from users where username=:username",{"username":username}).fetchall()
        if len(u)>0:
            return render_template("error.html",message="username already exists")
        if "username" in session:
            db.execute("DELETE FROM users where username = :username",{"username":username})
            db.commit()
            session.pop("username")
        if "chatid" in session:
            session.pop("chatid")    
        db.execute("INSERT INTO users (username) values(:username)",{"username":username})
        db.commit()
        session["username"]=username
            
    if request.method == "GET":
        if "username" not in session:
            return render_template("error.html",message="you have to log in first")
        if "chatid" in session:
            session.pop("chatid")   
    r=db.execute("select * from rooms").fetchall()
    d = dict()
    for i in r:
        d[int(i.id)] = i.roomname
        print(i.roomname)
    return render_template("roomlist.html",rooms=d.items())      

@app.route("/chatroom/<int:chatid>",methods=["GET"])
def chatroom(chatid):
    if request.method == "GET":
        if "username" not in session:
            return render_template("error.html",message="you have to log in first")
        roomname=db.execute("select roomname from rooms where id=:id",{"id":chatid}).fetchone()
        if roomname is None:
            return render_template("error.html",message="this room doesnot exist") 
        session["chatid"]=str(chatid)
        messages = db.execute("select msg from msgs where id=:chatid",{"chatid":chatid}).fetchall()
        x = []
        for i in messages:
            x.append(i[0])
    return render_template("chatroom.html",roomname=roomname[0],messages=x,chatid=session["chatid"],username=session["username"])     
        
@app.route("/chatrooms",methods=["POST"])
def chatrooms():
    if "username" not in session:
        return jsonify({"error":"error"})
    if "chatid" in session:    
        session.pop("chatid")    
    d={}
    print("sent")
    r = db.execute("select * from rooms").fetchall()
    for i in r:
        d[int(i.id)] = i.roomname
    return jsonify(d)   

@app.route("/roomid",methods=["POST"])
def roomid():
    if "username" not in session:
        return jsonify({"error":"error"})
    d={}
    print("sent")
    room_id = request.form.get("room_id")
    room_id=int(room_id)
    session["chatid"]=str(room_id)
    x = []
    m = db.execute("select msg from msgs where id=:room_id",{"room_id":room_id}).fetchall()
    for i in m:
        x.append(i[0])
    d["msgs"] = x
    return jsonify(d)    

@socketio.on('new room')
def new_room(data):
    roomname=data["roomname"]
    r = db.execute("select * from rooms where roomname=:roomname",{"roomname":roomname}).fetchall()
    if len(r)>0:
        emit('already exists',{},broadcast=False)
    else:    
        db.execute("insert into rooms(roomname) values(:roomname)",{"roomname":roomname})
        db.commit()
        i = db.execute("select id from rooms where roomname=:roomname",{"roomname":roomname}).fetchone()
        emit('add room',{"chatid":int(i[0]),"roomname":roomname},broadcast=True)

@socketio.on('new message')
def new_message(data):
    message=data["message"]
    i=data["chat_id"]
    i=int(i)
    username=data["username"]
    u = db.execute("select * from users where username=:username",{"username":username}).fetchall()
    if len(u) == 0:
        emit('This username doesnot exist',{},broadcast=False)
    else:    
        x = db.execute("select * from rooms where id=:i",{"i":i}).fetchall()
        if len(x) == 0:
            emit('This room doesnot exist',{},broadcast=False)    
        else:    
            now = datetime.now()
            dt_string = now.strftime("%d/%m/%Y %H:%M:%S")	
            k="<"+dt_string+" >----    "+username+" : "+message    
            db.execute("insert into msgs(id,msg) values(:i,:k)",{"i":i,"k":k})
            db.commit()
            emit('add message',{"message":k,"chatid":i},broadcast=True)     

 

if __name__ == "__main__":
    context = ('local.crt', 'local.key')#certificate and key files
    app.run(debug=True, ssl_context=context)       
