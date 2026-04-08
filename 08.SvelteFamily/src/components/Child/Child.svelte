<script>

    let {name, isGay, familysheep, onShowLove,onTakeCookie, drinkPantry=$bindable()} = $props();  // bindable is only a thing in svelte for now 

     import { fridgeMessages } from "../../stores/fridgeStore.js";

    let fridgeMessageInput = $state("");

    function handleSubmitFridgeMessage() {
        const fridgeMessageToCreate = {
            name,
            message: fridgeMessageInput
        };
        // does the same both the use of push then set. & the use of .update then .push then return value 
        //1        
        // $fridgeMessages.push(fridgeMessageToCreate);
        // fridgeMessages.set($fridgeMessages);

        fridgeMessages.update((fridgeMessageStoreValue) => {
            fridgeMessageStoreValue.push(fridgeMessageToCreate);
            return fridgeMessageStoreValue; // the update expects this value
        });

        fridgeMessageInput = "";
    }

</script>

<div class={familysheep|| "not-sheep"}
    class:is-gay={isGay}
    class:is-straight={!isGay}

>  <!-- dynamic styling class value --> <!-- puts classname on the right styling for the gays -->
    <h3>I am just a child, named {name}</h3>
</div>


<button onclick={()=> onShowLove(name)}> ShowLove❤️ </button> <!-- if not in arrow function the there will be a warning instead when spamming, the arrow function fixes that, but the preference is to set a function reference here instead if the button only needs the function and no input  -->
<button onclick={onTakeCookie}> TakeCookie🍪 </button>
<button onclick={()=> drinkPantry.pop()}>drinkChampagne🥂 </button>
<input bind:value={fridgeMessageInput} placeholder="Type your fridge message...">
<button onclick={handleSubmitFridgeMessage}>Write the fridge message</button>


<style>
    div{
        background-color: white;
    }
    .isxxxxxxxxx-gay{
        color: linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 50%, rgba(237, 221, 83, 1) 100%);
    }
   
    .blacksheep{
        border: 2em solid rgb(173, 27, 51);
    }
     .greysheep{
        border: 2em solid rgb(27, 173, 63);
    }
    .not-sheep{
            border: 2em solid blue;

    }
</style>