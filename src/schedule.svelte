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
        margin-bottom: min(12vw, 125px);
    }

    .text {
        font-size: 110%;
        font-family: 'Comfortaa', cursive;
        width: max(20.83vw, 208.3px);
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
        border-bottom: 0.17vw solid;
        margin-bottom: max(1.67vw, 16.7px);
        font-size: max(2vw, 20px);
    }

    .main p {
        margin-top: max(0.83vw, 8.3px);
        margin-bottom: max(0.83vw, 8.3px);
        font-size: max(1.5vw, 15px);
    }

    .image {
        width: max(20.83vw, 208.3px);
        height: max(23.33vw, 233.33px);
        background-color: white;
    }

    img {
        width: max(19.17vw, 191.7px);
        height: max(19.17vw, 191.7px);
        margin-top: max(0.83vw, 8.3px);
        margin-left: max(0.83vw, 8.3px);
        margin-right: max(0.83vw, 8.3px);
        background-color: black;
    }

    @media screen and (max-width: 700px) {
        .image {
            display: none;
        }
    }

    @media screen and (max-width: 475px) {
        .main {
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
        }

        .left, .right {
            align-items: center;
        }

        .left {
            margin-bottom: 75px;
        }
    }

    .footer {
        height: 1.42vw;
        width: 85vw;
        border-top: 0.08vw solid;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
        font-size: max(1.5vw, 12px);
    }
</style>