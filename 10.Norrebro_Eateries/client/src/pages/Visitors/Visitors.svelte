<script>
    import { onMount } from "svelte";
    import { fetchGet, fetchPost } from "../../util/fetchUtil.js";

    let visitorsCount;

    onMount(async () => {
        const result = await fetchGet('/api/visitors');
        visitorsCount = result.data;
    });

    async function visitRestaurant() {
        const result = await fetchPost('/api/visitors');
        visitorsCount = result.data;
    }

</script>

<h1>Visitors</h1>

<h3>{visitorsCount}</h3>

<button onclick={visitRestaurant}>Visit</button>
