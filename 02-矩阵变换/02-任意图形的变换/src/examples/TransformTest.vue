<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Vector2 } from '../lmm/math/Vector2'
import { Matrix3 } from '../lmm/math/Matrix3'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 变换基点 */
const origin = new Vector2(150, 100)

/* localMatrix */
const localPosition_old = new Vector2(0, 0)
const localRotate = 0.3
const localScale = new Vector2(1.5, 1)
const localMatrix = new Matrix3()
	.scale(localScale.x, localScale.y)
	.rotate(localRotate)
	.translate(localPosition_old.x, localPosition_old.y)

/* 相对变换矩阵relativeMatrix中的变换量 */
const relativeScale = new Vector2(1, 2)
const relativeRotate = 0.2
const relativePosition = new Vector2(-100, -50)

/* m1 */
const m1 = new Matrix3().makeTranslation(-origin.x, -origin.y)

/* m2 */
const localPosition = origin.clone().applyMatrix3(localMatrix)
const m2 = new Matrix3()
	.scale(localScale.x * relativeScale.x, localScale.y * relativeScale.y)
	.rotate(localRotate + relativeRotate)
	.translate(
		localPosition.x + relativePosition.x,
		localPosition.y + relativePosition.y
	)
const localMatrix_next = new Matrix3().multiplyMatrices(m2, m1)

/* 变换测试 */
function transformTest(ctx: CanvasRenderingContext2D) {
	/* obj */
	drawRect(ctx, localMatrix)
	/* m1 */
	drawRect(ctx, m1, 'orange')
	/* localMatrix_next */
	drawRect(ctx, localMatrix_next, 'red')
}

/* 绘制矩形 */
function drawRect(
	ctx: CanvasRenderingContext2D,
	m: Matrix3,
	fillStyle = '#000'
) {
	const { elements: e } = m
	ctx.save()
	ctx.fillStyle = fillStyle
	ctx.transform(e[0], e[1], e[3], e[4], e[6], e[7])
	ctx.fillRect(0, 0, 150, 100)
	ctx.restore()
}

onMounted(() => {
	const canvas = canvasRef.value
	const ctx = canvas?.getContext('2d')
	if (canvas && ctx) {
		ctx.translate(canvas.width / 2, canvas.height / 2)
		transformTest(ctx)
	}
})
</script>

<template>
	<canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped></style>
