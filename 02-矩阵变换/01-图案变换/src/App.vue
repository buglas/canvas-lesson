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
		<div class="nac-tit">测试</div>
		<router-link to="/">HelloWorld</router-link>
		<router-link to="/MatrixOfCanvas">MatrixOfCanvas</router-link>
		<router-link to="/Camera">Camera</router-link>
		<router-link to="/Img">Img</router-link>
		<router-link to="/Group">Group</router-link>
		<router-link to="/Scene">Scene</router-link>
		<router-link to="/OrbitControler">OrbitControler</router-link>
		<router-link to="/ImgControler">ImgControler</router-link>
	</nav>
</template>

<style scoped>
nav {
	width: 200px;
	padding: 15px;
	border-left: 1px solid #ddd;
}
.nav-tit {
	font-weight: bold;
	margin-bottom: 15px;
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
