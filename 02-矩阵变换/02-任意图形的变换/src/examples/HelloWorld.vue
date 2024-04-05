<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Matrix3 } from '../lmm/math/Matrix3'

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

const m = new Matrix3()
m.elements = [
	2, 0, 0,

	0, 2, 0,

	2, 2, 1,
]
console.log(m.determinant())
console.log(m.invert().determinant())

onMounted(() => {
	const canvas = canvasRef.value
	const ctx = canvas?.getContext('2d')
	ctx?.fillRect(100, 100, 200, 100)
})
</script>

<template>
	<canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped></style>
