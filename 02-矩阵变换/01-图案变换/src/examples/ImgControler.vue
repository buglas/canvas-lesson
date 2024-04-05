<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ImgControler } from '../lmm/controler/ImgControler'
import { OrbitControler } from '../lmm/controler/OrbitControler'
import { Scene } from '../lmm/core/Scene'
import { Vector2 } from '../lmm/math/Vector2'
import { Group } from '../lmm/objects/Group'
import { Img } from '../lmm/objects/Img'
import { ImagePromises } from '../lmm/objects/ObjectUtils'
import { Object2D } from '../lmm/objects/Object2D'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})
// 鼠标样式
const cursor = ref('default')

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 场景 */
const scene = new Scene()

/* 相机轨道控制器 */
const orbitControler = new OrbitControler(scene.camera)

/* 图案控制器 */
const imgControler = new ImgControler()
scene.add(imgControler)

const images: HTMLImageElement[] = []
for (let i = 1; i < 5; i++) {
	const image = new Image()
	image.src = `https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/${i}.png`
	images.push(image)
}

/* 图案集合 */
const imgGroup = new Group()
scene.add(imgGroup)

/* 鼠标滑上的图案 */
let imgHover: Img | null

/* 测试 */
function test(canvas: HTMLCanvasElement) {
	/* 添加图案 */
	imgGroup.add(
		...images.map((image, i) => {
			const size = new Vector2(image.width, image.height).multiplyScalar(0.3)
			return new Img({
				image,
				position: new Vector2(0, 160 * i - canvas.height / 2 + 50),
				size,
				offset: new Vector2(-size.x / 2, 0),
				name: 'img-' + i,
				style: {
					shadowColor: 'rgba(0,0,0,0.5)',
					shadowBlur: 5,
					shadowOffsetY: 20,
				},
			})
		})
	)

	/* 鼠标按下*/
	canvas.addEventListener('pointerdown', (event: PointerEvent) => {
		const { button, clientX, clientY } = event
		const mp = scene.clientToClip(clientX, clientY)
		switch (button) {
			case 0:
				imgHover = selectObj(imgGroup.children, mp)
				imgControler.pointerdown(imgHover, mp)
				updateMouseCursor()
				break
			case 1:
				orbitControler.pointerdown(clientX, clientY)
				break
		}
	})

	/* 鼠标移动 */
	canvas.addEventListener('pointermove', (event: PointerEvent) => {
		const { clientX, clientY } = event
		orbitControler.pointermove(clientX, clientY)
		const mp = scene.clientToClip(clientX, clientY)
		imgHover = selectObj(imgGroup.children, mp)
		imgControler.pointermove(mp)
		updateMouseCursor()
	})

	/* 鼠标抬起 */
	window.addEventListener('pointerup', (event: PointerEvent) => {
		switch (event.button) {
			case 0:
				imgControler.pointerup()
				break
			case 1:
				orbitControler.pointerup()
				break
		}
	})

	/* 键盘按下 */
	window.addEventListener(
		'keydown',
		({ key, altKey, shiftKey }: KeyboardEvent) => {
			imgControler.keydown(key, altKey, shiftKey)
			updateMouseCursor()
		}
	)

	/* 键盘抬起 */
	window.addEventListener('keyup', ({ altKey, shiftKey }: KeyboardEvent) => {
		imgControler.keyup(altKey, shiftKey)
	})

	/* 滑动滚轮缩放 */
	canvas.addEventListener('wheel', ({ deltaY }) => {
		orbitControler.doScale(deltaY)
	})

	/* 按需渲染 */
	orbitControler.addEventListener('change', () => {
		scene.render()
	})
	imgControler.addEventListener('change', () => {
		scene.render()
	})

	/* 渲染 */
	scene.render()
}

/* 更新鼠标样式 */
function updateMouseCursor() {
	if (imgControler.mouseState) {
		cursor.value = 'none'
	} else if (imgHover) {
		cursor.value = 'pointer'
	} else {
		cursor.value = 'default'
	}
}

/* 选择图案 */
function selectObj(imgGroup: Object2D[], mp: Vector2): Img | null {
	for (let img of [...imgGroup].reverse()) {
		if (img instanceof Img && scene.isPointInObj(img, mp, img.pvmoMatrix)) {
			return img
		}
	}
	return null
}

onMounted(() => {
	const canvas = canvasRef.value
	if (canvas) {
		scene.setOption({ canvas })
		Promise.all(ImagePromises(images)).then(() => {
			test(canvas)
		})
	}
})
</script>

<template>
	<canvas
		ref="canvasRef"
		:style="{ cursor }"
		:width="size.width"
		:height="size.height"
	></canvas>
</template>

<style scoped></style>
