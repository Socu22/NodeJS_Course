<script>
    import {BASE_URL} from "../../stores/generalStore.js"
    import {nickname} from "../../stores/nicknameStore.js"
    console.log($BASE_URL);
    
    let nicknameInput = $state(""); 
    async function submitNickname(){
        const response = await fetch($BASE_URL+"/nicknames", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({nickname: nicknameInput})

        })
        const result = await response.json();
        console.log(result);
        nickname.set(result.data)
        
    }
</script>


<input bind:value={nicknameInput} placeholder="Nickname...">
<button onclick={submitNickname}>Submit</button>