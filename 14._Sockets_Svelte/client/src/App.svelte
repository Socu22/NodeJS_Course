<script>
    import Colors from "./components/Colors/Colors.svelte";
    import Register from "./components/Register/Register.svelte";
    import { nickname } from "./stores/nicknameStore.js";

</script>



{#if !$nickname}
    <Register/>
{:else}
    <Colors/>

{/if}
