<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TransformControler } from '../lmm/controler/TransformControler'
import { OrbitControler } from '../lmm/controler/OrbitControler'
import { Scene } from '../lmm/core/Scene'
import { Vector2 } from '../lmm/math/Vector2'
import { Group } from '../lmm/objects/Group'
import { ImagePromises, SelectObj } from '../lmm/objects/ObjectUtils'
import { Object2D } from '../lmm/objects/Object2D'
import { Img2D } from '../lmm/objects/Img2D'
import { Text2D } from '../lmm/objects/Text2D'

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
const transformControler = new TransformControler()
scene.add(transformControler)

const images: HTMLImageElement[] = []
for (let i = 1; i < 3; i++) {
	const image = new Image()
	image.src = `https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/${i}.png`
	images.push(image)
}
const imagePromises = ImagePromises(images)

/* 鼠标滑上的图案 */
let imgHover: Object2D | null

/* 选择图案的方法 */
const selectObj = SelectObj(scene)

/* 图形集合 */
const group = new Group()
scene.add(group)

/* 文字内容 */
const message = ref('Sphinx')

/* 文字 */
const text2D = new Text2D({
	text: message.value,
	position: new Vector2(0, 100),
	maxWidth: 400,
	style: {
		fontSize: 100,
		fillStyle: '#00acec',
		textAlign: 'center',
		textBaseline: 'top',
	},
})
group.add(text2D)

function textChange() {
	text2D.text = message.value
	transformControler.updateFrame()
	scene.render()
}

/* 所有图片加载完成 */
function onAllImageLoaded() {
	/* 添加图像 */
	group.add(
		...images.map((image, i) => {
			const size = new Vector2(image.width, image.height).multiplyScalar(0.3)
			return new Img2D({
				image,
				position: new Vector2(0, i * 150 - 250),
				offset: new Vector2(-size.x / 2, -size.y / 2),
				rotate: 0.3,
				size,
				name: 'img-' + i,
				style: {
					shadowColor: 'rgba(0,0,0,0.5)',
					shadowBlur: 5,
					shadowOffsetY: 20,
				},
			})
		})
	)

	/* 渲染 */
	scene.render()
}

/* 按需渲染 */
orbitControler.addEventListener('change', () => {
	scene.render()
})
transformControler.addEventListener('change', () => {
	scene.render()
})

/* 鼠标按下*/
function pointerdown(event: PointerEvent) {
	const { button, clientX, clientY } = event
	const mp = scene.clientToClip(clientX, clientY)
	switch (button) {
		case 0:
			imgHover = selectObj(group.children, mp)
			transformControler.pointerdown(imgHover, mp)
			updateMouseCursor()
			break
		case 1:
			orbitControler.pointerdown(clientX, clientY)
			break
	}
}
/* 鼠标移动 */
function pointermove(event: PointerEvent) {
	const { clientX, clientY } = event
	const mp = scene.clientToClip(clientX, clientY)
	orbitControler.pointermove(clientX, clientY)
	transformControler.pointermove(mp)
	imgHover = selectObj(group.children, mp)
	updateMouseCursor()
}

/* 滑动滚轮缩放 */
function wheel({ deltaY }: WheelEvent) {
	orbitControler.doScale(deltaY)
}

/* 鼠标抬起 */
window.addEventListener('pointerup', (event: PointerEvent) => {
	switch (event.button) {
		case 0:
			transformControler.pointerup()
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
		transformControler.keydown(key, altKey, shiftKey)
		updateMouseCursor()
	}
)

/* 键盘抬起 */
window.addEventListener('keyup', ({ altKey, shiftKey }: KeyboardEvent) => {
	transformControler.keyup(altKey, shiftKey)
})

/* 更新鼠标样式 */
function updateMouseCursor() {
	if (transformControler.mouseState) {
		cursor.value = 'none'
	} else if (imgHover) {
		cursor.value = 'pointer'
	} else {
		cursor.value = 'default'
	}
}

onMounted(() => {
	const canvas = canvasRef.value
	if (canvas) {
		scene.setOption({ canvas })
		Promise.all(imagePromises).then(onAllImageLoaded)
	}
})
</script>

<template>
	<canvas
		ref="canvasRef"
		:style="{ cursor }"
		:width="size.width"
		:height="size.height"
		@pointerdown="pointerdown"
		@pointermove="pointermove"
		@wheel="wheel"
	></canvas>
	<div id="text">
		<label>文字内容：</label>
		<input type="text" v-model="message" @input="textChange" />
	</div>
</template>

<style scoped>
#text {
	position: absolute;
	left: 15px;
	top: 15px;
}
</style>
