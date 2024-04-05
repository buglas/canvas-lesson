<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { OrbitControler } from '../lmm/controler/OrbitControler'
import { Scene } from '../lmm/core/Scene'
import { Text2D } from '../lmm/objects/Text2D'

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

/* 文字测试 */
const text2D = new Text2D({
	text: 'Sphinx',
	style: {
		fontSize: 100,
		fillStyle: 'yellow',
		strokeStyle: 'red',
		order: 0,
		lineWidth: 6,
		textAlign: 'center',
		textBaseline: 'middle',
		lineDash: [3, 6],
	},
})
scene.add(text2D)

/* 按需渲染 */
orbitControler.addEventListener('change', () => {
	scene.render()
	drawRect()
})

/* 滑动滚轮缩放 */
function wheel({ deltaY }: WheelEvent) {
	orbitControler.doScale(deltaY)
}

/* 按住滚轮平移 */
function pointerdown(event: PointerEvent) {
	if (event.button == 1) {
		orbitControler.pointerdown(event.clientX, event.clientY)
	}
}
function pointermove(event: PointerEvent) {
	orbitControler.pointermove(event.clientX, event.clientY)
}
function pointerup(event: PointerEvent) {
	if (event.button == 1) {
		orbitControler.pointerup()
	}
}

/* 绘制文字边界 */
function drawRect() {
	const {
		ctx,
		canvas: { width, height },
	} = scene
	ctx.save()
	ctx.strokeStyle = 'maroon'
	ctx.translate(width / 2, height / 2)
	ctx.beginPath()
	text2D.crtPath(ctx, text2D.pvmMatrix)
	ctx.closePath()
	ctx.stroke()
	ctx.restore()
}

onMounted(() => {
	const canvas = canvasRef.value
	if (canvas) {
		scene.setOption({ canvas })
		scene.render()
		drawRect()
	}
})
</script>

<template>
	<canvas
		ref="canvasRef"
		:width="size.width"
		:height="size.height"
		@wheel="wheel"
		@pointerdown="pointerdown"
		@pointermove="pointermove"
		@pointerup="pointerup"
	></canvas>
</template>

<style scoped></style>
