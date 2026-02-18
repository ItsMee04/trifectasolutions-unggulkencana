<template>
    <div class="main-wrapper">

        <Header />

        <Sidebar />

        <div class="page-wrapper cardhead">
            <RouterView />
        </div>

    </div>
</template>
<script setup>
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
</script>
