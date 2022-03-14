<script>
    import Colors from './colors.svelte'
    import Dropdown from './dropdown.svelte'
</script>

<html lang=en>
    <main>
        <Dropdown/>
        <div class="text">
          <h1>Chancellor's Counselling Cafe</h1>
          <h3>"Come on in! Take a chance." - Katherine Stout</h3>
        </div>
        <Colors/>
    </main>
</html>

<style>
    main {
        display: flex;
        justify-content: space-between;
        align-items: start;
    }
    .text {
        align-self: center;
    }
    h1 {
        border-bottom: 2px solid black;
    }
</style>
