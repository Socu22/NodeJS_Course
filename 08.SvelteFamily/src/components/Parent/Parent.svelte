<script>
    import Child from "../Child/Child.svelte";

    let {name, children} = $props(); // is things from other props componetns 

    import { fridgeMessages } from "../../stores/fridgeStore.js"; // fridgestore which uses StoreFredigemessages to use .set .update ..subscribe

    function handleShowLove(name){
        console.log(`show love ${name}`);
        
    }
    let cookieJar =$state(['🍪','🍪','🍪','🍪','🍪','🍪','🍪']); // we use runes for when you change the number or delete cookies at some html it wont know that it changed. Changing its value will not corectly trigger updates,  $state fixes that
    // props and state has to used together 

    function handleTakeCookie(){ // what there is in component names hanndlesXXXXXXXX 
        cookieJar.pop();
    }

    let drinkPantry = $state(['🥂','🥂','🥂','🥂','🥂'])
</script>

<h3> I am Parent, my name is {name}.</h3>

<button onclick={fridgeMessages.wipe}>Wipe Fridge</button> <!-- a selfmade property which wipes the fridgemessages made in fridgeStore.js. -->

{#each drinkPantry as drink }
    <p>{drink}</p>
{/each}

{#each cookieJar as cookie }
    <p>{cookie}</p>
{/each}

{#each children as child ( child.name)} <!-- if there is a problem with a id when deleting an element it is good to name an id, or soemthing else which is unique for the child in this case -->
    <Child {...child} onShowLove ={handleShowLove} onTakeCookie ={handleTakeCookie} drinkPantry= {drinkPantry}/> <!-- Spread operator for scaleability  -->
{/each}