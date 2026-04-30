<script>
    import {onMount} from 'svelte'
    
    import {BASE_URL} from '../../stores/generalStore.js'

    import {colorsList} from '../../stores/colorsListStore.js'

    import io from 'socket.io-client';
    import { nickname } from '../../stores/nicknameStore';

    let socket; 

    let colorInput = "#0000ff" 
    onMount(() => { // if more components use the sotre
        socket= io($BASE_URL, {withCredentials: true}); 
        socket.on("server-sends-color",(data) => {
            //todo: don't do dom manipluation do it the svelte way lookup teacher coder 
            document.body.style.backgroundColor= data.data
            //console.log(data.data);

            
            
        } )
    });
    function submitColor(){
        socket.emit("client-sends-color",{data: colorInput})
    }
</script>


<input type="color" bind:value={colorInput}>
<button onclick={submitColor}> submit</button>

