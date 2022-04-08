<script>
    import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

    import Colors from './colors.svelte'
    import Dropdown from './dropdown.svelte'

    function pageChange(event) {
        let newPage = event.detail.newPage
        dispatch ('pageChange', {
            newPage: newPage
        })
    }
</script>

<main>
    <Dropdown on:pageChange={pageChange}/>
    <div class="text">
        <h1>Kat's Contemporary Cafe</h1>
    </div>
    <div class="underline"></div>
    <Colors/>
</main>

<style>
    main {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: start;
        height: 220px;
        position: sticky;
        top: 0px;
        background-color: black;
    }
    .text {
        align-self: center;
        margin-top: 20px;
    }
    h1 {
        font-size: 1000%;
        font-family: 'Miss Fajardose', cursive;
        color: white;
        background-color: black;
    }
    .underline {
        position: absolute;
        bottom: 48px;
        left: 100px;
        height: 2px;
        width: 980px;
        background-color: white;
        z-index: 1000;
        border-radius: 4px;
    }
</style>
