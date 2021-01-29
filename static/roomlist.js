document.addEventListener('DOMContentLoaded', () => {

    // Cannot submit empty value for input field
    console.log("hi");
    const request = new XMLHttpRequest();
    request.open('POST', '/chatrooms');
    request.onload = () => {
        var data = JSON.parse(request.responseText);
        var x;
        document.querySelector('ul').innerHTML="";
        for(x in data)
        {
            var l = document.createElement('li');
            l.innerHTML = `<a href="/chatroom/${parseInt(x)}">${data[x]}</a>`
            document.querySelector('ul').append(l);
            console.log(l);
        }
    };
    var p= new FormData();
    p.append("rooms","rooms");
    request.send(p);
    
    document.querySelector('button').disabled = true;
    document.querySelector('input').onkeyup = () => {
        if(document.querySelector('input').value.length>0)
        {
            document.querySelector('button').disabled = false;
        }
        else
        {
            document.querySelector('button').disabled = true;
        }
    }

    
    //reload when back/front are used in the browser
    /*if ((document.querySelector('#refresh').value) === "no")
    {
        document.querySelector('#refresh').value="yes";
    }
    else
    {
        document.querySelector('#refresh').value="no";
        window.location=window.location;
    }*/

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        
        document.querySelector('button').onclick  = () => {
                const roomname = document.querySelector('input').value;
                socket.emit('new room', {'roomname': roomname});
            };
        });

        var inputText = document.getElementById("input_field");
        inputText.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("b").click();
            }
        });

    socket.on('add room', data => {
        const li = document.createElement('li');
        var a=data["chatid"];
        li.innerHTML = `<a href="/chatroom/${parseInt(a)}">${data["roomname"]}</a>`;
        document.querySelector('ul').append(li);
        document.querySelector('input').value = "";
        document.querySelector('button').disabled = true;
    });  
    socket.on('already exists', data => {
        alert("That roomname already exists select another name")
    });
});


    
