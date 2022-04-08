<script>

</script>

<section>
    <div class="main">
    <div class="left">
        <div class="about text">
            <h2>Introduction:</h2>
            <p>Welcome to Kat's Contemporary Cafe! A student-run pop-up shop dedicated to serving cozy food and warm drinks, perfect for rainy days, a stress-free work break, or even just chilling!</p>
        </div>
        <img class="image2" alt="cool food :)">
        <div class="help text">
            <h2>Help Our School:</h2>
            <p>This contemporary cafe is completely non-profit! Any and all proceeds will go back into helping IACS flourish! Funding field trips, helping fund next years senior projects, school building maintenance, and so much more! 
            </p>
        </div>
    </div>
    <div class="right">
        <img src="images/logo.png" class="image1" alt="cool logo :)">
        <div class="location text">
            <h2>Location:</h2>
            <p>72 Tyng Rd</p>
            <p>Tyngsboro, Massachusetts</p>
            <p>xxx-xxx-xxxx</p>
            <p>xxx-xxx@gmail.com</p>
            <p>Look for the sign!</p>
        </div>
        <img class="image3" alt="cool food :)">
    </div>
    <div class="righter">
        <img class="footsteps" alt="footsteps">
    </div>
    </div>
    <div class="footer text">
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
        width: 300px;
    }

    .left {
        align-items: start;
    }

    .right {
        align-items: end;
    }

    .text {
        height: 200px;
        width: 430px;
        color: white;
        margin-top: 30px;
        margin-bottom: 30px;
        font-family: 'Comfortaa', cursive;
        font-size: 110%;
    }

    h2 {
        border-bottom: 2px solid white;
        margin-top: 10px;
    }

    .left img, .right img {
        width: 200px;
        height: 200px;
        border: 2px solid white;
        border-radius: 5px;
        margin-top: 30px;
        margin-bottom: 30px;
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

    .righter, .footsteps {
        width: 200px;
        border: 1px solid white;
    }

    .footer {
        height: 17px;
        width: 85vw;
        border-top: 1px solid white;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>
