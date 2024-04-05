<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Editor } from './component/Editor'
import { Effector } from './component/Effector'

/* 图案类型 */
type ImgType = {
	src?: string
	globalCompositeOperation: GlobalCompositeOperation
}

/* 图层数据类型 */
interface Layer {
	src: string
	name: string
	uuid: string
	active: boolean
}

/* 模拟fetch请求后端T恤数据 */
const TShirtData = new Promise<{
	designImgSrc: string
	effectImgData: ImgType[]
}>((resolve) => {
	const path = 'https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/'
	resolve({
		/* 设计图 */
		designImgSrc: path + 'design.png',
		/* 效果图素材 */
		effectImgData: [
			{
				src: '',
				globalCompositeOperation: 'source-over',
			},
			{
				src: path + 'shirt-shadow.jpg',
				globalCompositeOperation: 'multiply',
			},
			{
				src: path + 'shirt-mask.png',
				globalCompositeOperation: 'destination-in',
			},
			{
				src: '',
				globalCompositeOperation: 'destination-in',
			},
			{
				src: path + 'shirt-origin.jpg',
				globalCompositeOperation: 'destination-over',
			},
		],
	})
})

const patternData = new Promise<string[]>((resolve) => {
	const arr: string[] = []
	for (let i = 1; i <= 8; i++) {
		arr.push(
			`https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/${i}.png`
		)
	}
	resolve(arr)
})

/* 图案库 */
const patternsRef = ref<string[]>([])
/* 编辑器的DOMRef */
const editorDomRef = ref<HTMLDivElement>()
/* 效果图的DOMRef */
const effectDomRef = ref<HTMLDivElement>()
/* 图案编辑器 */
const editor = new Editor()
const {
	cursor,
	transformControler,
	group,
	group: { children },
} = editor
transformControler.addEventListener('selected', ({ obj }) => {
	// 更新图层选择状态
	activateLayer(children.length - 1 - children.indexOf(obj))
})

group.addEventListener('remove', ({ obj: { uuid } }) => {
	// 删除图层
	removeLayer(uuid)
})
/* 删除图层 */
function removeLayer(uuid: string) {
	const { value } = layersRef
	for (let i = 0, len = value.length; i < len; i++) {
		if (value[i].uuid === uuid) {
			value.splice(i, 1)
			break
		}
	}
}

/* 效果图 */
const effector = new Effector()

/* 图层集合 */
const layersRef = ref<Layer[]>([])

/* 渲染效果图 */
editor.addEventListener('render', () => {
	effector.render()
})

/* 图案库 */
patternData.then((data) => {
	patternsRef.value = data
})

onMounted(() => {
	if (!editorDomRef.value || !effectDomRef.value) {
		return
	}

	/* 图案编辑器 */
	editor.onMounted(editorDomRef.value, effectDomRef.value)

	/* T恤数据 */
	TShirtData.then(({ designImgSrc, effectImgData }) => {
		editor.setDesignImg(designImgSrc)
		effector.addImgs(effectImgData, editor.resultScene.canvas)
	})

	/* 效果图 */
	effector.onMounted(effectDomRef.value)
})

onUnmounted(() => {
	editor.onUnmounted()
	effector.onUnmounted()
})

/* 当点击图像库中的图案时，将图案添加到图案编辑器和图层中 */
function addPattern({ target }: MouseEvent) {
	if (!(target instanceof Image)) {
		return
	}
	/* 将图案添加到编辑器中 */
	const { uuid, name } = editor.addImg(target)

	/* 取消当前图层的选择 */
	for (let layer of layersRef.value) {
		if (layer.active) {
			layer.active = false
			break
		}
	}

	/* 添加图案到layersRef中 */
	layersRef.value.unshift({
		src: target.src,
		active: true,
		uuid,
		name,
	})
}

/* 选择图层 */
function selectLayer(index: number) {
	const { value } = layersRef
	// 激活图层
	activateLayer(index)
	// 更新图案的控制状态
	editor.selectImgByUUID(value[index].uuid)
}

/* 激活图层 */
function activateLayer(index: number) {
	const { value } = layersRef
	for (let i = 0, len = value.length; i < len; i++) {
		value[i].active = i === index
	}
}

/* 开始拖拽 */
function dragstart({ dataTransfer }: DragEvent, index: number) {
	dataTransfer && dataTransfer.setData('index', index.toString())
}

/* 置入 */
function drop({ dataTransfer }: DragEvent, index: number) {
	if (!dataTransfer) {
		return
	}
	/* 激活图层 */
	const dragIndex = parseInt(dataTransfer.getData('index'))
	activateLayer(dragIndex)

	const { value } = layersRef
	/* 选择图案 */
	editor.selectImgByUUID(value[dragIndex].uuid)

	/* 置换图层 */
	;[value[dragIndex], value[index]] = [value[index], value[dragIndex]]
	/* 置换图案 */
	const len = value.length - 1
	editor.replaceImg(len - dragIndex, len - index)
}
</script>

<template>
	<div id="left">
		<div class="tit">图案库</div>
		<div id="patternLib">
			<div class="patternWrapper" v-for="item in patternsRef">
				<img class="pattern" :src="item" alt="" @click="addPattern" />
			</div>
		</div>
	</div>
	<div id="center" ref="editorDomRef" :style="{ cursor }"></div>
	<div id="right">
		<div id="effect" ref="effectDomRef"></div>
		<ul id="layers">
			<template v-for="(item, index) in layersRef" :key="item.uuid">
				<li
					class="layer"
					:class="{ layerActive: item.active }"
					:data-uuid="item.uuid"
					:index="index"
					@click="selectLayer(index)"
					draggable="true"
					@dragover.prevent
					@dragstart="dragstart($event, index)"
					@drop="drop($event, index)"
				>
					<img class="thumbnail" :src="item.src" alt="" />
					{{ item.name }}
				</li>
			</template>
		</ul>
	</div>
</template>

<style scoped>
* {
	box-sizing: border-box;
}

#left {
	display: flex;
	flex-direction: column;
	border-right: 1px solid #ddd;
}
.tit {
	font-weight: bold;
	font-size: 18px;
	padding: 15px 15px 6px 15px;
	border-bottom: 1px solid #ddd;
}

#patternLib {
	padding: 15px;
	width: 200px;
	height: 100%;
	overflow-y: scroll;
}
.patternWrapper {
	flex-wrap: wrap;
	margin: 15px 0px;
}
.pattern {
	width: 100%;
	cursor: pointer;
	transition: transform 100ms;
}
.pattern:hover {
	transform: scale(1.1);
}

#center {
	flex: 1;
	background-image: url('https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/alpha_back.png');
	position: relative;
}
.tips {
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	padding: 15px;
	line-height: 28px;
	position: absolute;
	bottom: 0;
}

#right {
	display: flex;
	flex-direction: column;
	width: 350px;
	border-left: 1px solid #ddd;
}
#effect {
	background-color: antiquewhite;
	height: 350px;
}
#layers {
	flex: 1;
	padding: 0;
	margin: 0;
	overflow-y: scroll;
}
.layer {
	display: flex;
	align-items: center;
	padding: 3px;
	list-style: none;
	cursor: pointer;
	transition: all 100ms;
	border-bottom: 1px solid #ddd;
	line-height: 0;
}

.layerActive {
	background-color: #f5f5f5;
	box-shadow: inset #ccc 0 1px 2px;
}
.thumbnail {
	width: 50px;
	background-image: url('https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/alpha_back.png');
	background-size: 8px;
	margin-right: 12px;
}

/* 滚动条样式 */
ul::-webkit-scrollbar,
div::-webkit-scrollbar {
	width: 8px;
}
ul::-webkit-scrollbar-thumb,
div::-webkit-scrollbar-thumb {
	-webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
ul::-webkit-scrollbar-track,
div::-webkit-scrollbar-track {
	-webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>
