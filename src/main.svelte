<script>
    import Header from './header.svelte'
    import Homepage from './homepage.svelte'
    import Food from './food.svelte'
    import Drink from './drink.svelte'
    import Contact from './contact.svelte'
    import Schedule from './schedule.svelte'

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
</script>

<section>
    <div class="header">
    <Header on:pageChange={changePage}/>
    </div>
    <div class="content">
    <div id="home" class="active">
    <Homepage/>
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
    </div>
</section>

<style>
section {
    height: 100vh;
    width: 100vw;
    overflow-x: hidden;
    background-color: black;
}

.header {
    margin: 0px;
    padding: 0px;
    border: 0px;
    position: sticky;
    top: 0px;
    z-index: 100;
}

.active {
    display: block;
}

.inactive {
    display: none;
}
</style>
