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

    export let iconColors
    $: iconColors
</script>

<main class="background">
    <Dropdown on:pageChange={pageChange} {iconColors}/>
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
        margin: auto;
        overflow-x: visible;
    }
    .box {
        border-bottom: 0.2vw solid;
        height: 12.3vw;
        width: 82vw;
        position: relative;
    }

    @media screen and (max-width: 400px) {
        h1 {
            font-size: 11vw;
        }
        .box {
            height: 10vw;
            width: 80vw;
        }
    }
</style>
