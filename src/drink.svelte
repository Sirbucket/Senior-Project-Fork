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
        align-items: center;
        height: 12.42vw;
    }

    .info {
        display: flex;
        flex-direction: column;
        width: 66.67vw;
    }

    h2 {
        border-bottom: 2px solid;
        margin-right: auto;
        font-size: 2vw;
    }

    p {
        font-size: 1.5vw;
    }

    .img {
        height: 10vw;
        width: 13.33vw;
    }

    .img img {
        width: 12.5vw;
        height: 7.67vw;
        margin-top: 0.42vw;
        margin-left: 0.42vw;
        margin-right: 0.42vw;
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