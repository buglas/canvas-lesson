<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Scene } from '../lmm/core/Scene'
import { NStarGeometry } from '../lmm/geometry/NStarGeometry'
import { StandStyle } from '../lmm/style/StandStyle'
import { Graph2D } from '../lmm/objects/Graph2D'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 场景 */
const scene = new Scene()

/* 多角星 */
const nStarGeometry=new NStarGeometry(200,'auto',12)
const nStarStyle=new StandStyle({
  strokeStyle: '#73e800',
  lineWidth: 10,
  fillStyle:'#fff693'
})
const nStarObj=new Graph2D(nStarGeometry,nStarStyle)
scene.add(nStarObj)

onMounted(() => {
	const canvas = canvasRef.value
	if (canvas) {
		scene.setOption({ canvas })
		scene.render()
	}
})

</script>

<template>
	<canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>