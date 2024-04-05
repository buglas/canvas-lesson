<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Scene } from '../lmm/core/Scene'
import { Vector2 } from '../lmm/math/Vector2'
import { Img } from '../lmm/objects/Img'

// 获取父级属性
const props = defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 场景 */
const scene = new Scene()

/* 图案 */
const image = new Image()
image.src =
	'https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/1.png'
const pattern = new Img({ image })
scene.add(pattern)

/* 鼠标的裁剪坐标位 */
const mouseClipPos = new Vector2(Infinity)

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

		/* 样式 */
		style: {
			globalAlpha: 0.8,
			shadowColor: 'rgba(0,0,0,0.5)',
			shadowBlur: 0,
		},
	})

	/* 相机位移测试 */
	scene.camera.position.set(0, 100)

	/* 记录鼠标的裁剪坐标位 */
	canvas.addEventListener('mousemove', ({ clientX, clientY }) => {
		mouseClipPos.copy(scene.clientToClip(clientX, clientY))
	})

	/* 动画 */
	ani()
}

function ani(time = 0) {
	/* 相机缩放测试 */
	const inter = (Math.sin(time * 0.002) + 1) / 2
	scene.camera.zoom = inter + 0.5
	/* 投影 */
	pattern.style.shadowOffsetY = 80 * (1 - inter)
	pattern.style.shadowBlur = 10 * (1 - inter)
	/* 选择测试 */
	if (scene.isPointInObj(pattern, mouseClipPos, pattern.pvmoMatrix)) {
		pattern.rotate += 0.02
	}
	/* 渲染 */
	scene.render()
	requestAnimationFrame(ani)
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
