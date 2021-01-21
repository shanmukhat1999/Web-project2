document.addEventListener('DOMContentLoaded', () => {

    // Cannot submit empty value for input field
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
    if ((document.querySelector('#refresh').value) === "no")
    {
        document.querySelector('#refresh').value="yes";
    }
    else
    {
        document.querySelector('#refresh').value="no";
        window.location=window.location;
    }

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
});


    
