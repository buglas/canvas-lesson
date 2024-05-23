<script setup lang="ts">
import { onMounted, ref } from 'vue'
const contRef = ref<HTMLDivElement>()
const size = ref<{
	width: number | undefined
	height: number | undefined
}>({
	width: 0,
	height: 0,
})
onMounted(() => {
	const cont = contRef.value
	size.value.width = cont?.clientWidth
	size.value.height = cont?.clientHeight
})
</script>

<template>
	<!-- 路由出口 -->
	<div id="cont" ref="contRef">
		<router-view :size="size"></router-view>
	</div>
	<!-- 导航 -->
	<nav>
		<router-link to="/">绘图测试</router-link>
		<router-link to="/NStar">多角星</router-link>
		<router-link to="/CollisionRebound">圆形与多边形碰撞反弹</router-link>
		<router-link to="/BulletScreenTest">弹幕</router-link>
		<router-link to="/BoundingBox">包围盒</router-link>
		<router-link to="/BVH01">BVH 的显示</router-link>
		<router-link to="/BVH02">BVH 碰撞测试</router-link>
	</nav>
</template>

<style scoped>
nav {
	width: 200px;
	padding: 15px;
	border-left: 1px solid #ddd;
	overflow-y: scroll;
}
.nav-tit {
	font-weight: bold;
	margin: 28px 0 15px 0;
}
.nav-tit:nth-child(1) {
	margin-top: 0;
}
nav a {
	display: block;
	margin-bottom: 10px;
}
#cont {
	flex: 1;
}
.router-link-active {
	color: #00acec;
}
</style>
