<script>
    import Colors from './colors.svelte'
    import Dropdown from './dropdown.svelte'
</script>

<main>
    <Dropdown/>
    <div class="text">
        <h1>Chancellor's Counselling Cafe</h1>
        <h3>"Come on in! Take a chance." - Katherine Stout</h3>
    </div>
    <Colors/>
</main>

<style>
    main {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: start;
        background-color: red;
        height: 175px;
    }
    .text {
        align-self: center;
    }
    h1 {
        border-bottom: 2px solid black;
        font-size: 200%;
    }
</style>
