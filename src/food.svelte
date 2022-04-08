<script>

</script>

<section>
    <div class="main">
        <div class="cuban item">
            <div class="cubanInfo info text">
                <h2>Cuban Sandwich . . . $5</h2>
                <p>Ham, provolone cheese, pickles, mayonnaise, and mustard between buttered and pressed sweet hawaiian bread
                </p>
            </div>
            <img alt="Cuban sandwich">
        </div>
        <div class="hamfig item">
            <div class="hamfigInfo info text">
                <h2>Ham & Fig Sandwich . . . $5</h2>
                <p>Ham, provolone cheese, and fig jam between buttered and pressed sweet hawaiian bread
                </p>
            </div>
            <img alt="Ham and fig sandwich">
        </div>
        <div class="grilled item">
            <div class="grilledInfo info text">
                <h2>Grilled Cheese Sandwich . . . $5</h2>
                <p>Provolone cheese between buttered and pressed sliced white bread
                </p>
            </div>
            <img alt="Grilled cheese">
        </div>
        <div class="soup item">
            <div class="soupInfo info text">
                <h2>Tomato Soup . . . $5</h2>
                <p>Creamy tomato soup topped with a pinch of basil
                </p>
            </div>
            <img alt="Tomato soup">
        </div>
    </div>
    <div class="footer text">
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
        color: white;
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
        border-bottom: 2px solid white;
        margin-right: auto;
    }

    img {
        height: 120px;
        width: 160px;
        border: 2px solid white;
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