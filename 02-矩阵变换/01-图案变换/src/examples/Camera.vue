<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Camera } from '../lmm/core/Camera'

defineProps({
	size: {
		type: Object,
		default: {
			width: 0,
			height: 0,
		},
	},
})

const canvasRef = ref<HTMLCanvasElement>()

/* 相机 */
const camera = new Camera(-200, -200, 0.5)

/* 矩阵测试 */
function matrixTest(ctx: CanvasRenderingContext2D) {
	ctx.save()
	camera.transformInvert(ctx)
	ctx.fillRect(0, 0, 200, 100)
	ctx.restore()
}

onMounted(() => {
	const canvas = canvasRef.value
	const ctx = canvas?.getContext('2d')
	ctx && matrixTest(ctx)
})
</script>

<template>
	<canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped></style>
