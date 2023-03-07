<template>
    <el-popover
        placement="top-start"
        trigger="hover">
        <div style="width: 200px;height: 200px;text-align: center;">
            <img :src="src" alt="" style="width: 200px;margin-top: 50%;transform: translateY(-50%);">
        </div>
        <img alt="" :src="src" slot="reference" :style="`height: ${height}px`">
    </el-popover>
</template>

<script>
export default {
    name: 'popover-img',
    props: ['src', 'height']
}
</script>

<style scoped>

</style>
