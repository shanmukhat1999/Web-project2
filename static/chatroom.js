document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
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
    if(!(localStorage.getItem("chatid")))
    {
        var k=document.querySelector('h2').innerHTML;
        if (!(typeof (k) === "number" ))
        {
            k=parseInt(k);
        }
        localStorage.setItem("chatid",k);
    }
    else
    {
        var k=document.querySelector('h2').innerHTML;
        if (!(typeof (k) === "number" ))
        {
            k=parseInt(k);
        }
        localStorage.setItem("chatid",k);
    }

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    
    
    document.querySelector('#leave').onclick = () => {
        localStorage.removeItem("chatid");
    }
    

    socket.on('connect', () => {

        document.querySelector('form').onsubmit =  () => {
                const message = document.querySelector('input').value;
                var ci=document.querySelector('h2').innerHTML;
                ci=parseInt(ci);
                var name=document.querySelector('input').dataset.val;
                socket.emit('new message', {'message': message,'chat_id':ci,'username':name});
                document.querySelector('input').value='';
                return false;
            };   
        });

    socket.on('add message', data => {
        var s=data["chatid"];
        s=parseInt(s);
        if(s == localStorage.getItem("chatid"))
        {
            const li = document.createElement('li');
            li.innerHTML = `${data["message"]}`;
            document.querySelector('ul').append(li);
        }
    });
    
    
});