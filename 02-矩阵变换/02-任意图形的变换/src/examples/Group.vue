<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Vector2 } from '../lmm/math/Vector2'
import { Group } from '../lmm/objects/Group'
import { Img2D } from '../lmm/objects/Img2D'
import { ImagePromises } from '../lmm/objects/ObjectUtils'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

const images: HTMLImageElement[] = []
for (let i = 1; i < 8; i++) {
	const image = new Image()
	image.src = `https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/${i}.png`
	images.push(image)
}

const group = new Group()

/* 渲染 */
function render(ctx: CanvasRenderingContext2D) {
	group.add(
		...images.map((image, i) => {
			return new Img2D({
				image,
				position: new Vector2(200, 80 * i + 50),
				size: new Vector2(image.width, image.height).multiplyScalar(0.3),
				style: {
					shadowColor: 'rgba(0,0,0,0.5)',
					shadowBlur: 5,
					shadowOffsetY: 20,
				},
			})
		})
	)
	group.draw(ctx)
}

onMounted(() => {
	const canvas = canvasRef.value
	const ctx = canvas?.getContext('2d')
	if (!ctx) {
		return
	}
	Promise.all(ImagePromises(images)).then(() => {
		render(ctx)
	})
})
</script>

<template>
	<canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped></style>
