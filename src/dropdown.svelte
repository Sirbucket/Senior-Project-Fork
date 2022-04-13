<script>
    import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

    function navChange(event) {
        let x = event.target.closest('.dropdown')
        x.classList.toggle('change')
        x.closest('section').classList.toggle('opened')
    }

    function menuOpen(event) {
        let x = event.target.closest('.menu')
        x.classList.toggle('closed')
        x.classList.toggle('visible')
    }

    function pageChange(event) {
        let x = event.target.closest('div').classList[0]
        dispatch ('pageChange', {
            newPage: x
        })
    }

    export let iconColors
    $: srcHome = 'images/homeIcon' + iconColors +'.png'
    $: srcMenu = 'images/menuIcon' + iconColors + '.png'
    $: srcFood = 'images/foodIcon' + iconColors + '.png'
    $: srcDrink = 'images/drinkIcon' + iconColors + '.png'
    $: srcCont = 'images/contactIcon' + iconColors + '.png'
    $: srcSched = 'images/scheduleIcon' + iconColors + '.png'
    $: console.log(iconColors)
</script>

<section id="test">
  <div id="dropdown" class="dropdown" on:click={navChange}>
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
  </div>
  <div class="stuff accent text">
    <div class="home hidden" on:click={pageChange}>
        <p>Home</p>
        <img src={srcHome} alt="Home">
    </div>
    <div id="navMenu" class="menu hidden closed">
        <p on:click={menuOpen}>Menu</p>
        <img src={srcMenu} on:click={menuOpen} alt="Menu">
        <div id="navFood" class="food" on:click={pageChange}>
            <p>Food</p>
            <img src={srcFood} alt="Food">
        </div>
        <div id="navDrink" class="drink" on:click={pageChange}>
            <p>Drinks</p>
            <img src={srcDrink} alt="Drink">
        </div>
    </div>
    <div class="contact hidden" on:click={pageChange}>
        <p>Contact<br>Us</p>
        <img src={srcCont} alt="Contact">
    </div>
    <div class="schedule hidden" on:click={pageChange}>
        <p>Schedule</p>
        <img src={srcSched} alt="Schedule">
    </div>
  </div>
  <section class="ignore visible opened change">
      <div class="bar1 bar2 bar3 stuff"></div>
  </section>
</section>

<style>
section {
    display: flex;
    flex-direction: column;
    align-items: start;
}

.text {
    font-family: 'Comfortaa', cursive;
}

section.opened {
    height: 90vh;
}

.hidden {
    overflow: hidden;
    cursor: pointer;
    margin-top: max(0.83vw, 7.1px);
    margin-bottom: max(0.83vw, 7.1px);
    width: 6.67vw;
    height: 3.08vw;
    font-size: 1.3vw;
    text-align: center;
}

.hidden p {
    transition: .5s;
}

.hidden p:hover {
    transform: scale(1.1, 1.1)
}

.hidden img {
    display: none;
}

.stuff {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 0px;
    height: 0px;
    width: max(6.67vw, 35px);
    transition: height 1s;
    overflow: hidden;
    border-bottom-right-radius: max(0.83vw, 7.1px);
}

.stuff .hidden {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.stuff .menu {
    justify-content: start;
}

.home {
    margin-top: max(5.25vw, 44.63px);
    margin-bottom: max(1.25vw, 10.63px);
}

.menu {
    height: max(5.67vw, 48.2px);
    transition: height .5s;
    border: 0px;
    width: max(6.25vw, 53.125px);
    margin-top: max(1.25vw, 10.63px);
    margin-bottom: max(1.25vw, 10.63px);
}

.contact {
    margin-top: max(1.25vw, 10.63px);
    margin-bottom: max(1.25vw, 10.63px);
}

.schedule {
    margin-top: max(1.25vw, 10.63px);
    margin-bottom: max(1.25vw, 10.63px);
}

.closed {
    height: max(1.67vw, 14.2px);
    text-align: center;
}

.opened .stuff {
    display: block;
    overflow: hidden;
    height: max(24.7vw, 210px);
}

p {
    padding: 0px;
    margin: 0px;
}

.menu p {
    width: max(6.25vw, 53.125px);
    text-align: center;
    padding: 0px;
}

.food, .drink {
    margin-top: max(0.33vw, 2.8px);
    margin-bottom: max(0.33vw, 2.8px);
    margin-right: auto;
    margin-left: auto;
    height: max(1.5vw, 12.75px);
    width: max(7.5vw, 63.75px);
    display: flex;
    font-size: max(1.1vw, 11.56px);
}

.dropdown {
  height: max(2.5vw, 18.25px);
  width: max(2.5vw, 18.25px);
  padding: 0px;
  border: 0px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-left: max(2.08vw,8.125px);
  margin-top: max(2.08vw, 9.125px);
  z-index: 100;
}

.bar1, .bar2, .bar3 {
  width: max(2.5vw, 18.25px);
  height: max(0.42vw, 3.5px);
  transition: all 0.7s;
  border-radius: max(0.17vw, 1.5px);
}

/* Rotate first bar */
.change .bar1 {
  transform: rotate(-45deg) translate(min(-0.5vw, -3px), max(0.5vw, 4.25px));
}

/* Fade out the second bar */
.change .bar2 {
  opacity: 0;
}

/* Rotate last bar */
.change .bar3 {
  transform: rotate(45deg) translate(min(-0.5vw, -3px), min(-0.5vw, -4.25px));
}

@media screen and (max-width: 675px) {
  .home, .contact, .schedule {
    width: 23px;
    height: 23px;
    margin-right: auto;
    margin-left: auto;
  }
  .menu {
      height: 56px;
      width: 23px;
      margin-right: auto;
      margin-left: auto;
  }
  .food, .drink {
      height: 15px;
      width: 15px;
      margin-right: auto;
      margin-left: auto;
  }
  .closed {
      height: 23px;
  }
  .home p, .contact p, .schedule p, .menu p {
    display: none;
  }
  .home img, .contact img, .schedule img, .menu img {
    display: block;
    height: 20px;
    width: 20px;
    transition: .7s;
    margin-left: auto;
    margin-right: auto;
  }
  .home img:hover, .contact img:hover, .schedule img:hover, .menu img:hover {
      transform: scale(1.1, 1.1)
  }
  .food img, .drink img {
      height: 15px;
      width: 15px;
  }
}

.ignore {
    position: absolute;
    display: none;
    pointer-events: none;
}
</style>
