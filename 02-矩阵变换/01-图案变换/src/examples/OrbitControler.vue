<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { OrbitControler } from '../lmm/controler/OrbitControler'
import { Scene } from '../lmm/core/Scene'
import { Vector2 } from '../lmm/math/Vector2'
import { Img } from '../lmm/objects/Img'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 场景 */
const scene = new Scene()

/* 相机轨道控制器 */
const orbitControler = new OrbitControler(scene.camera)

/* 图案 */
const image = new Image()
image.src =
	'https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/1.png'
const pattern = new Img({ image })
scene.add(pattern)

/* 测试 */
function test(canvas: HTMLCanvasElement) {
	const imgSize = new Vector2(image.width, image.height).multiplyScalar(0.6)
	pattern.setOption({
		/* 模型矩阵 */
		rotate: 0.4,
		position: new Vector2(0, -50),
		scale: new Vector2(0.5),

		/* Img属性 */
		size: imgSize.clone(),
		offset: imgSize.clone().multiplyScalar(-0.5),
	})

	/* 按需渲染 */
	orbitControler.addEventListener('change', () => {
		scene.render()
	})

	/* 滑动滚轮缩放 */
	canvas.addEventListener('wheel', ({ deltaY }) => {
		orbitControler.doScale(deltaY)
	})

	/* 按住滚轮平移 */
	canvas.addEventListener('pointerdown', (event: PointerEvent) => {
		if (event.button == 1) {
			orbitControler.pointerdown(event.clientX, event.clientY)
		}
	})
	canvas.addEventListener('pointermove', (event: PointerEvent) => {
		orbitControler.pointermove(event.clientX, event.clientY)
	})
	window.addEventListener('pointerup', (event: PointerEvent) => {
		if (event.button == 1) {
			orbitControler.pointerup()
		}
	})

	/* 渲染 */
	scene.render()
}

onMounted(() => {
	const canvas = canvasRef.value
	if (canvas) {
		scene.setOption({ canvas })
		image.onload = function () {
			test(canvas)
		}
	}
})
</script>

<template>
	<canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped></style>
