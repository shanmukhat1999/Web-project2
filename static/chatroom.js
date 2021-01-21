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

    //Refreshing when pressed back/front buttons
    if(!!window.performance && window.performance.navigation.type == 2)
    {
    window.location.reload(true);
    } 
    // saving the chatid in localstorage to the room number
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
    //connect to web socket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    
    // when leaving the room remove this chatid from local storage
    document.querySelector('#leave').onclick = () => {
        localStorage.removeItem("chatid");
    }
    
    socket.on('connect', () => {

        //when new message is entered
        document.querySelector('button').onclick =  () => {
            const message = document.querySelector('input').value;
            var ci=document.querySelector('h2').innerHTML;
            ci=parseInt(ci);
            var name=document.querySelector('input').dataset.val;
            socket.emit('new message', {'message': message,'chat_id':ci,'username':name});
        };   
    });

    var inputText = document.getElementById("input_field");
    inputText.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("b").click();
        }
    });

    //when server emits the add message    
    socket.on('add message', data => {
        var s=data["chatid"];
        s=parseInt(s);
        document.querySelector('input').value = "";
        if(s == localStorage.getItem("chatid"))
        {
            const li = document.createElement('li');
            li.innerHTML = `${data["message"]}`;
            document.querySelector('ul').append(li);
        }
    });
    
    
});
