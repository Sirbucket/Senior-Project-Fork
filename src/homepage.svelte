<script>
    export let sideColor
</script>

<section class="background">
    <div class="main">
    <div class="left base">
        <div class="about text">
            <h2>Introduction:</h2>
            <p>Welcome to Kat's Contemporary Cafe! A student-run pop-up shop dedicated to serving cozy food and warm drinks, perfect for rainy days, a stress-free work break, or even just chilling!</p>
        </div>
        <div class="image accent">
        <img src="images/iacs1.jpg" alt="cool food :)">
        </div>
        <div class="help text">
            <h2>Help Our School:</h2>
            <p>This contemporary cafe is completely non-profit! Any and all proceeds will go back into helping IACS flourish! Funding field trips, helping fund next years senior projects, school building maintenance, and so much more! 
            </p>
        </div>
    </div>
    <div class="right base">
        <div class="image accent">
        <img src="images/logo.png" alt="cool logo :)">
        </div>
        <div class="location text">
            <h2>Location:</h2>
            <p>72 Tyng Rd</p>
            <p>Tyngsboro, Massachusetts</p>
            <p>xxx-xxx-xxxx</p>
            <p>xxx-xxx@gmail.com</p>
            <p>Look for the sign!</p>
        </div>
        <div class="image accent">
        <img src="images/iacs2.jpg" alt="cool food :)">
        </div>
    </div>
    <div class="righter">
        {#if (sideColor == 'Cozy')}
        <img src='images/catgirlCozy.png' class='catgirl' alt='catgirl'>
        {:else if (sideColor == 'Cool')}
        <img src='images/catgirlCool.png' class='catgirl' alt='catgirl'>
        {:else if (sideColor == 'Carefree')}
        <img src='images/catgirlCarefree.png' class='catgirl' alt='catgirl'>
        {:else}
        <img src='images/catgirlClassy.png' class='catgirl' alt='catgirl'>
        {/if}
    </div>
    </div>
    <div class="footer text base background">
        <p>Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts
        </p>
    </div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        width: 100vw;
        position: relative;
    }

    .main {
        display: flex;
        justify-content: space-evenly;
        width: 100vw;
        margin: 0px;
        padding: 0px;
        border: 0px;
    }

    .left, .right {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        width: 25vw;
    }

    .left {
        align-items: start;
    }

    .right {
        align-items: end;
    }

    .text {
        height: 16.66vw;
        width: 35.83vw;
        margin-top: 2.5vw;
        margin-bottom: 2.5vw;
        font-family: 'Comfortaa', cursive;
        font-size: 110%;
    }

    h2 {
        border-bottom: 0.16px solid;
        margin-top: 0.83vw;
        font-size: 2vw;
    }

    p {
        font-size: 1.5vw;
    }

    .left img, .right img {
        width: 15vw;
        height: 15vw;
        background-color: black;
        margin-top: 0.83vw;
        margin-left: 0.83vw;
        margin-right: 0.83vw;
    }

    .image {
        height: 19.16vw;
        width: 16.66vw;
        padding: 0px;
        margin-top: 2.5vw;
        margin-bottom: 2.5vw;
    }

    .about{
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .location {
        display: flex;
        flex-direction: column;
        align-items: end;
    }

    .location p {
        margin: 0px;
        width: auto;
        text-align: right;
    }

    .help {
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .righter, .catgirl {
        width: 20vw;
    }

    .catgirl {
        position: fixed;
        bottom: 55px;
        z-index: 101;
        pointer-events: none;
    }

    @media screen and (max-width: 600px) {
        .main {
            justify-content: space-around;
        }
        
        h2 {
            font-size: 3vw;
        }

        p {
            font-size: 2.3vw;
        }

        .text {
            height: 33.32vw;
            width: 39.83vw;
            margin-top: 5vw;
            margin-bottom: 5vw;
        }

        .right {
            text-align: right;
        }

        .left img, .right img {
            width: 22.5vw;
            height: 22.5vw;
            margin-top: 1.245vw;
            margin-left: 1.245vw;
            margin-right: 1.245vw;
        }

        .image {
            height: 28.74vw;
            width: 24.99vw;
            margin-top: 3.75vw;
            margin-bottom: 3.75vw;
        }

        .righter, .catgirl {
            width: 0px;
            display: none;
        }
    }

    .footer {
        height: 17px;
        width: 85vw;
        border-top: 0.08vw solid;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>
