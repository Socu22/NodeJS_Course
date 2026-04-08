<script>
    import {fridgeMessages} from '../../stores/fridgeStore.js' // imported 
    console.log(fridgeMessages); // gets the store 
    console.log($fridgeMessages); // gets the value 

    

</script>

<!-- Messages from the store just in value form -->
{#each $fridgeMessages as fridgeMessage}
    <p>{fridgeMessage.name || "Household"}: {fridgeMessage.message}</p>    
{/each}

<slot>
<!-- Children when making something inside the <Home> </ home> exept if it is a <Home/> -->

</slot>

<div id ="welcome-mat"> <p>You go away </p> </div>


<style>

#welcome-mat{
    font-weight: bold;
    color: aliceblue;
    background-color: brown;
    padding: 2em;
    margin: 0 20em 0 20em; 
    border-radius: 0 0 2em 2em;
}

</style>