<script>
    import Header from './header.svelte'
    import Homepage from './homepage.svelte'
</script>

<section>
    <div class="header">
    <Header/>
    </div>
    <div class="content">
    <Homepage/>
    </div>
</section>

<style>
section {
    height: 100vh;
    width: 100vw;
    overflow-x: hidden;
}

.header {
    margin: 0px;
    padding: 0px;
    border: 0px;
    position: sticky;
    top: 0px;
    z-index: 100;
}
</style>
