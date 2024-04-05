<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Vector2 } from '../lmm/math/Vector2'
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

/* 矩形的初始顶点 */
const vertices = [
	//1
	0, 0,
	//2
	100, 0,
	//3
	100, 50,
	//4
	0, 50,
]

/* 矩形的模型矩阵数据 */
const position = new Vector2(300, 200)
const rotate = 0.4
const scale = new Vector2(1, 2)

/* 矩阵 */
/* const [pm, rm, sm] = [
	new Matrix3().makeTranslation(position.x, position.y),
	new Matrix3().makeRotation(rotate),
	new Matrix3().makeScale(scale.x, scale.y),
]
const matrix = pm.multiply(rm).multiply(sm) */
const matrix = new Matrix3()
	.scale(scale.x, scale.y)
	.rotate(rotate)
	.translate(position.x, position.y)

/* 绘制矩形 */
function drawRect(
	ctx: CanvasRenderingContext2D,
	vertices: number[],
	color: string = 'black',
	lineWidth: number = 0
) {
	ctx.fillStyle = color
	ctx.strokeStyle = color
	ctx.lineWidth = lineWidth
	ctx.beginPath()
	ctx.moveTo(vertices[0], vertices[1])
	for (let i = 2, len = vertices.length; i < len; i += 2) {
		ctx.lineTo(vertices[i], vertices[i + 1])
	}
	ctx.closePath()
	ctx.stroke()
	ctx.fill()
}

/* 矩阵测试 */
function matrixTest(ctx: CanvasRenderingContext2D) {
	/* translate(),rotate(),scale()测试 */
	ctx.save()
	ctx.translate(position.x, position.y)
	/* 先缩放，后旋转 > 矩形 */
	ctx.rotate(rotate)
	ctx.scale(scale.x, scale.y)
	/* 先旋转，后缩放 > 平行四边形 */
	/* ctx.scale(scale.x, scale.y)
	ctx.rotate(rotate) */
	drawRect(ctx, vertices, 'black', 40)
	ctx.restore()

	/* 矩阵测试 */
	const { elements: e } = matrix
	console.log(e)
	ctx.save()
	ctx.transform(e[0], e[1], e[3], e[4], e[6], e[7])
	drawRect(ctx, vertices, '#00acec', 20)
	ctx.restore()

	/* 顶点变换 */
	ctx.save()
	drawRect(ctx, tranformVertices(vertices, matrix), '#acec00', 0)
	ctx.restore()
}

/* 顶点变换 */
function tranformVertices(vertices: number[], matrix: Matrix3) {
	const worldVertives: number[] = []
	for (let i = 0, len = vertices.length; i < len; i += 2) {
		const { x, y } = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(
			matrix
		)
		worldVertives.push(x, y)
	}
	return worldVertives
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
