<script>
    import Home from "./components/Home/Home.svelte";
    import Parent from "./components/Parent/Parent.svelte";
    const parents = ["Brian","Julie"]
    const children = [{
      name: "Jens",
      familysheep: "greysheep"
    },
    {
      name: "Bob",
      familysheep: "blacksheep"
    },
    {
      name: "Anne",
      isGay: true
    }
    ]
</script>

<!-- if you give a key then you will recive a true back like below with only writing children  -->
<Home>
 <!--   <h1>Home is the place i am at!!</h1>
  <h2>who else is there ?</h2>-->
 
  <Parent name={parents[0]} children={children}/>
  <Parent name={parents[1]} children={children}/>

</Home>