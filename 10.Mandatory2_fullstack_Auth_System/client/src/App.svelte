<script>
  import {Router,Link, Route} from 'svelte-routing'
    import AuthCard from './components/AuthCard.svelte';



</script>

<Router>
  <nav>

    <Link to='/'>Login</Link>
   


  </nav>
  <div>
    <Route path='/'><AuthCard/></Route>
  </div>
</Router>
