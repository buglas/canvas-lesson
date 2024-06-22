<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { OrbitControler } from '../lmm/controler/OrbitControler'
import { Scene } from '../lmm/core/Scene'
import { Vector2 } from '../lmm/math/Vector2'
import { Group } from '../lmm/objects/Group'
import { Grid } from '../component/Grid'
import { Lattice } from '../component/Lattice'

/* 文章链接：https://juejin.cn/post/7262634764301697080 */

// 获取父级属性
const props = defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 场景 */
const scene = new Scene()
scene.camera.zoom = 0.02

/* 相机轨道控制器 */
const orbitControler = new OrbitControler(scene.camera)

/* 地图尺寸 */
const mapSize = new Vector2(10, 10)

/* 起点 */
const start = 40
/* 终点 */
const end = 49

/* 障碍物 */
const obstruction: number[] = [
	31, 32, 42, 52, 62, 72, 33, 34, 44, 54, 64, 74, 36, 37, 38, 48, 58, 68, 78,
]

/* 探索过的基点集合 */
const explored: Map<number, number | undefined> = new Map([[start, undefined]])

/* 探索出的路 */
const road: number[] = []

/* 探索基点 */
let basic: number | null = start

/*  探索状态：finding探索中、fail探索失败、success探索成功 */
let state: 'finding' | 'fail' | 'success' = 'finding'

/* 开始探索 */
// 循环探索
while (state === 'finding') {
	explorer()
}
// 逐步探索
/* let n = 0
while (n < 22) {
	explorer()
	n++
} */

/* 寻路 */
function explorer(extrude?: number) {
	if (basic === null) {
		return
	}
	const { width, height } = mapSize
	const p = getPos(basic)

	const x1 = Math.max(0, p.x - 1)
	const x2 = Math.min(width, p.x + 1)
	const y1 = Math.max(0, p.y - 1)
	const y2 = Math.min(height, p.y + 1)

	let minPoint: number | undefined
	let minDistance = Infinity

	for (let y = y1; y <= y2; y++) {
		for (let x = x1; x <= x2; x++) {
			const current = y * width + x
			if (current === end) {
				state = 'success'
				return
			}
			if (
				current !== basic &&
				current !== start &&
				!road.includes(current) &&
				!obstruction.includes(current) &&
				((extrude !== undefined && extrude !== current) ||
					extrude === undefined)
			) {
				// 获取到目标最近的点
				const distance = getPos(end).distanceToSquared(new Vector2(x, y))
				if (distance < minDistance) {
					minDistance = distance
					minPoint = current
				}
			}
		}
	}

	/* 基于前面点寻找除当前点之外的点 */
	if (minPoint === undefined) {
		const prev = explored.get(basic)
		if (prev !== undefined) {
			extrude = basic
			basic = prev
			explorer(extrude)
		} else {
			state = 'fail'
			return
		}
	} else {
		if (extrude !== undefined) {
			const ind = road.indexOf(extrude)
			if (ind !== -1) {
				road.splice(ind)
			}
		}
		/* 标记节点 */
		explored.set(minPoint, basic)
		/* 添加路线 */
		road.push(minPoint)
		/* 更新基点 */
		basic = minPoint
	}
}

/* 获取点位 */
function getPos(n: number) {
	const { width } = mapSize
	return new Vector2(n % width, Math.floor(n / width))
}

/* 地图 */
const map = new Group()
map.position=mapSize.clone().multiplyScalar(-0.5)
scene.add(map)

/* 地图网格 */
const grid = new Grid(mapSize,mapSize)
grid.style.setOption({
  lineWidth:0.01,
  strokeStyle:'#000'
})
map.add(grid)

/* 添加起点、终点、障碍物 */
map.add(
	new Lattice({
		text: start,
		position: getPos(start),
		latticeColor: '#00acec',
	})
)
map.add(
	new Lattice({
		text: end,
		position: getPos(end),
		latticeColor: 'red',
	})
)
obstruction.forEach((n) => {
	map.add(
		new Lattice({
			text: n,
			position: getPos(n),
			latticeColor: 'green',
		})
	)
})
/* 路径点 */
road.forEach((n, ind) => {
	map.add(
		new Lattice({
			text: ind,
			position: getPos(n),
			latticeColor: '#333',
		})
	)
})

/* 按需渲染 */
orbitControler.addEventListener('change', () => {
	scene.render()
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
	const { clientX, clientY } = event
	const mp = scene.clientToClip(clientX, clientY)

	orbitControler.pointermove(clientX, clientY)
}
function pointerup(event: PointerEvent) {
	if (event.button == 1) {
		orbitControler.pointerup()
	}
}

onMounted(() => {
	const canvas = canvasRef.value
	if (canvas) {
		scene.setOption({ canvas })
		scene.render()
	}
})
</script>

<template>
	<canvas
		ref="canvasRef"
		:width="props.size.width"
		:height="props.size.height"
		@wheel="wheel"
		@pointerdown="pointerdown"
		@pointermove="pointermove"
		@pointerup="pointerup"
	></canvas>
</template>

<style scoped></style>
