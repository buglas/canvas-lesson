<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Vector2 } from '../lmm/math/Vector2'
import { Img } from '../lmm/objects/Img'

// 获取父级属性
const props = defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 图案 */
const image = new Image()
image.src =
	'https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/1.png'
const pattern = new Img({ image })

/* 渲染 */
function render(ctx: CanvasRenderingContext2D) {
	const imgSize = new Vector2(image.width, image.height).multiplyScalar(0.6)

	pattern.setOption({
		/* 模型矩阵 */
		rotate: 0.4,
		position: new Vector2(0, -50),
		scale: new Vector2(0.5),

		/* Img属性 */
		size: imgSize.clone(),
		offset: imgSize.clone().multiplyScalar(-0.5),
		view: {
			x: 0,
			y: 0,
			width: image.width / 2,
			height: image.height / 2,
		},

		/* 样式 */
		style: {
			globalAlpha: 0.8,
			shadowColor: 'rgba(0,0,0,0.5)',
			shadowBlur: 5,
			shadowOffsetY: 20,
		},
	})

	/* 把canvas坐标系的原点移动到画布中心，以此为裁剪空间 */
	ctx.translate(props.size.width / 2, props.size.height / 2)
	/* 绘图 */
	pattern.draw(ctx)
	/* 绘制图案边界 */
	ctx.save()
	pattern.crtPath(ctx)
	ctx.stroke()
	ctx.restore()
}

onMounted(() => {
	const canvas = canvasRef.value
	const ctx = canvas?.getContext('2d')
	if (!ctx) {
		return
	}
	image.onload = function () {
		render(ctx)
	}
})
</script>

<template>
	<canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped></style>
