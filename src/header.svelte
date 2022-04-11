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

    function changeStyle(event) {
        let newStyle = event.detail.newStyle
        dispatch ('changeColor', {
            newStyle
        })
    }
</script>

<main class="background">
    <Dropdown on:pageChange={pageChange}/>
    <div class="box text base">
        <h1>Kat's Contemporary Cafe</h1>
    </div>
    <Colors on:styleChange={changeStyle}/>
</main>

<style>
    main {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: start;
        height: 16.66vw;
        position: sticky;
        top: 0px;
        padding-bottom: 0.83vw;
    }
    .text {
        margin-top: 1.66vw;
    }
    h1 {
        font-size: 13vw;
        font-family: 'Miss Fajardose', cursive;
        margin: 0px;
    }
    .box {
        border-bottom: 2px solid;
        height: 12.3vw;
        position: relative;
    }
</style>
