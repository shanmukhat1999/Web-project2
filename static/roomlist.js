document.addEventListener('DOMContentLoaded', () => {

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

        
        document.querySelector('form').onsubmit = () => {
                const roomname = document.querySelector('input').value;
                socket.emit('new room', {'roomname': roomname});
            };
        });

    socket.on('add room', data => {
        const li = document.createElement('li');
        var a=data["chatid"];
        li.innerHTML = `<a href="/chatroom/${a}">${data["roomname"]}</a>`;
        document.querySelector('ul').append(li);
    });    
});


    
