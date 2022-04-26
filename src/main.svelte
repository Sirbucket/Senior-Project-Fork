<script>
    import Header from './header.svelte'
    import Homepage from './homepage.svelte'
    import Food from './food.svelte'
    import Drink from './drink.svelte'
    import Contact from './contact.svelte'
    import Schedule from './schedule.svelte'
    import Stickers from './stickers.svelte'

    function changePage(event) {
        let old = document.querySelector('.active')
        let newId = event.detail.newPage
        let newPage = document.getElementById(newId)
        if (newPage.classList.contains('inactive')) {
            old.classList.remove('active')
            old.classList.add('inactive')
            newPage.classList.remove('inactive')
            newPage.classList.add('active')
        }
    }

    $: iconColors = color
    let color = 'Classy'
    let base

    function changeColor(event) {
        let newStyle = event.detail.newStyle
        let old = base.classList[0]
        if (old != newStyle) {
            color = newStyle
        }
    }
</script>

<section bind:this={base} class={color}>
    <div class="header">
    <Header on:pageChange={changePage} on:changeColor={changeColor} {iconColors}/>
    </div>
    <div class="content">
    <div id="home" class="active">
    <Homepage sideColor={color}/>
    </div>
    <div id="food" class="inactive">
    <Food/>
    </div>
    <div id="drink" class="inactive">
    <Drink/>
    </div>
    <div id="contact" class="inactive">
    <Contact/>
    </div>
    <div id="schedule" class="inactive">
    <Schedule/>
    </div>
    <div id="stickers" class="inactive">
    <Stickers/>
    </div>
    </div>
</section>

<style>
section {
    height: 100vh;
    width: 100vw;
    overflow-x: hidden;
}

.header {
    margin: 0px;
    padding: 0px;
    border: 0px;
    position: sticky;
    top: 0px;
    z-index: 100;
    height: 18.33vw;
}

.active {
    display: block;
}

.inactive {
    display: none;
}
</style>
