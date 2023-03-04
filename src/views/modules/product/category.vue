<template>
    <div>111</div>
</template>

<script>
import {mapActions} from 'vuex'

export default {
    name: 'Category',
    methods: {
        ...mapActions("category", ["getCategory"])
    },
    mounted () {
        this.getCategory();
    }
}
</script>

<style scoped>

</style>
