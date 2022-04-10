<script>

</script>

<section class="background">
    <div class="main base">
        <div class="choc item">
            <div class="chocInfo info text">
                <h2>Hot Chocolate</h2>
                <p>Heated milk with chocolate powder.</p>
            </div>
            <img alt="Hot chocolate">
        </div>
        <div class="tea item">
            <div class="teaInfo info text">
                <h2>Hot Tea</h2>
                <p>Earl Gray, Black Irish Tea, Lavendar Tree</p>
            </div>
            <img alt="Hot tea">
        </div>
        <div class="warm item">
            <div class="warmInfo info text">
                <h2>Warm Coffee Milk</h2>
                <p>A warm take on RI's official beverage, and a favorite amongst New England residents
                </p>
            </div>
            <img alt="Warm coffee milk">
        </div>
        <div class="else item">
            <div class="elseInfo info text">
                <h2>Smth Else</h2>
                <p>Who knows</p>
            </div>
            <img alt="???">
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
        width: 980px;
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
        height: 149px;
    }

    .info {
        display: flex;
        flex-direction: column;
        width: 800px;
    }

    h2 {
        border-bottom: 2px solid;
        margin-right: auto;
    }

    img {
        height: 120px;
        width: 160px;
        border: 2px solid;
    }

    .footer {
        height: 17px;
        width: 85vw;
        border-top: 1px solid;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>