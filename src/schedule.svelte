<script>

</script>

<section class="background">
    <div class="main">
        <div class="left text base">
            <h2>Location:</h2>
            <p>72 Tyng Rd</p>
            <p>Tyngsboro, Massachusetts</p>
            <p>Look for the sign!</p>
        </div>
        <div class="image">
        <img src="images/logo.png" alt="Cool logo :)">
        </div>
        <div class="right text base">
            <h2>Date and Time:</h2>
            <p>Monday, April 25 2022</p>
            <p>3:00PM &mdash; 6:00PM</p>
        </div>
    </div>
    <div class="footer text base background">
        <p>Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts
        </p>
    </div>
</section>

<style>
    .main {
        display: flex;
        justify-content: space-evenly;
        margin-bottom: 12.92vw;
    }

    .text {
        font-size: 110%;
        font-family: 'Comfortaa', cursive;
        width: 20.83vw;
    }

    .left, .right {
        display: flex;
        flex-direction: column;
    }

    .left {
        align-items: start;
    }

    .right {
        align-items: end;
    }

    h2 {
        border-bottom: 2px solid;
        margin-bottom: 1.67vw;
        font-size: 2vw;
    }

    p {
        margin-top: 0.83vw;
        margin-bottom: 0.83vw;
        font-size: 1.5vw;
    }

    .image {
        width: 20.83vw;
        height: 23.33vw;
        background-color: white;
    }

    img {
        width: 19.17vw;
        height: 19.17vw;
        margin-top: 0.83vw;
        margin-left: 0.83vw;
        margin-right: 0.83vw;
        background-color: black;
    }

    .footer {
        height: 1.42vw;
        width: 85vw;
        border-top: 1px solid;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>