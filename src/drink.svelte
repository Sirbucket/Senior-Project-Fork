<script>

</script>

<section class="background">
    <div class="main base">
        <div class="choc item">
            <div class="chocInfo info text">
                <h2>Hot Chocolate. . . $3</h2>
                <p>Heated milk with chocolate powder.</p>
            </div>
            <div class="img accent">
                <img src="images/choc.jpg" alt="Hot chocolate" class="chocImg">
            </div>
        </div>
        <div class="tea item">
            <div class="teaInfo info text">
                <h2>Hot Tea. . . $3</h2>
                <p>Earl Gray, Black Irish Tea, Lavender Tea</p>
            </div>
            <div class="img accent">
                <img src="images/tea.jpg" alt="Hot tea" class="teaImg">
            </div>
        </div>
        <div class="warm item">
            <div class="warmInfo info text">
                <h2>Warm Coffee Milk. . . $3</h2>
                <p>A warm take on RI's official beverage, and a favorite amongst New England residents
                </p>
            </div>
            <div class="img accent">
                <img src="images/coffee.jpg" alt="Warm coffee milk" class="warmImg">
            </div>
        </div>
    </div>
    <div class="footer text base background">
        <p>Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts
        </p>
    </div>
</section>

<style>
    .main {
        margin: auto;
        width: 81.67vw;
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .text {
        font-size: 110%;
        font-family: 'Comfortaa', cursive;
    }

    .item {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        width: 81.67vw;
    }

    .info {
        display: flex;
        flex-direction: column;
        width: 65%;
        margin-right: auto;
    }

    h2 {
        border-bottom: 2px solid;
        margin-right: auto;
        font-size: max(2vw, 12px);
    }

    p {
        font-size: max(1.5vw, 9px);
    }

    .img {
        height: max(10vw, 60px);
        width: max(13.33vw, 80px);
    }

    .img img {
        width: max(12.5vw, 75px);
        height: max(7.67vw, 46.02px);
        margin-top: max(0.42vw, 2.5px);
        margin-left: max(0.42vw, 2.5px);
        margin-right: max(0.42vw, 2.5px);
    }

    @media screen and (max-width: 600px) {
        .item .info {
            width: 55%;
        }
        h2 {
            font-size: max(2vw, 15px);
        }
        p {
            font-size: max(1.5vw, 12px);
        }
        .img {
            height: max(10vw, 70px);
            width: max(13.33vw, 90px);
        }
        .img img {
            width: max(12.5vw, 85px);
            height: max(7.67vw, 56px);
            margin-top: max(0.42vw, 2.5px);
            margin-left: max(0.42vw, 2.5px);
            margin-right: max(0.42vw, 2.5px);
        }
    }

    .footer {
        height: 5.4vh;
        width: 85vw;
        border-top: 0.08vw solid;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 0px;
        text-align: center;
    }
    .footer p {
        margin-top: 1.35vh;
        margin-bottom: 1.35vh;
    }
</style>