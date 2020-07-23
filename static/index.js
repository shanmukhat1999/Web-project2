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
})