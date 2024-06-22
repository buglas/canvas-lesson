<script setup lang="ts">
/* 文章链接：
https://juejin.cn/post/7260668104753545276 
https://www.bilibili.com/video/BV1zz4y1m7Nq/?spm_id_from=333.337.search-card.all.click&vd_source=fc98bc82ca25234b3a3030baea035443
*/

/* 节点关系图
 * id 唯一标志符，与其key值一致
 * adjacency 邻点
 * distance 当前点到起点的路径距离
 * prev 前面点
 */
type MapData = {
	id: number
	adjacency: number[]
	distance: number
	prev: undefined | MapData
}
const map: Map<number, MapData> = new Map([
	[0, { id: 0, adjacency: [1, 7], distance: Infinity, prev: undefined }],
	[1, { id: 1, adjacency: [0, 2, 7], distance: Infinity, prev: undefined }],
	[2, { id: 2, adjacency: [1, 3, 5, 8], distance: Infinity, prev: undefined }],
	[3, { id: 3, adjacency: [2, 4, 5], distance: Infinity, prev: undefined }],
	[4, { id: 4, adjacency: [3, 5], distance: Infinity, prev: undefined }],
	[5, { id: 5, adjacency: [2, 3, 4, 6], distance: Infinity, prev: undefined }],
	[6, { id: 6, adjacency: [5, 7, 8], distance: Infinity, prev: undefined }],
	[7, { id: 7, adjacency: [0, 1, 6, 8], distance: Infinity, prev: undefined }],
	[8, { id: 8, adjacency: [2, 6, 7], distance: Infinity, prev: undefined }],
])

/* 线段长度图
 * key用'-'符号将两个自个升序的id链接起来。
 */
const segmentLengthMap: { [k: string]: number } = {
	'0-1': 4,
	'0-7': 8,
	'1-2': 8,
	'1-7': 11,
	'2-3': 7,
	'2-5': 4,
	'2-8': 2,
	'3-4': 9,
	'3-5': 14,
	'4-5': 10,
	'5-6': 2,
	'6-7': 1,
	'6-8': 6,
	'7-8': 7,
}

const start = 0
const end = 4

// 标记节点集合
const mark = new Set<number>()
// 未标记节点集合
let unmark = new Set<number>()

// 最优路径
let optimal: number[] = []

// 初始化
init()

/* 初始化
 * 定义起点start
 * 对起点做标记，将起点添加到最优路径mark中
 * 起点的路径距离默认为0
 * 起点的前面点默认为undefined
 * 让未标记点集合unmark等于map中除start之外的所有点
 * 寻路
 * 回溯
 */
function init() {
	const startNode = map.get(start)
	if (!startNode) {
		console.error('起点未找到')
		return
	}
	mark.add(start)
	startNode.distance = 0
	unmark = new Set([...map.values()].map((ele) => ele.id))
	unmark.delete(start)
	explorer(startNode)
	optimal = backtrack(map.get(end))
}

/* 寻路 */
function explorer(markNode: MapData) {
	/* 更新当前标记点的邻点的距离与前面点 */
	for (let n of markNode.adjacency) {
		// 若标记点集合中包含此点，则跳过此点
		if (mark.has(n)) {
			continue
		}
		// 根据id获取当前邻点
		const curNode = map.get(n)
		if (!curNode) {
			console.error('当前邻点未找到')
			continue
		}
		// 获取当前邻点过当前标记点后的路径距离
		const dist = getDistance2(curNode, markNode)
		/* 若dist小于当前邻点的已记录过的路径距离，则：
		 * 更新当前邻点的路径距离为dist
		 * 前面点为当前标记点
		 */
		if (dist < curNode.distance) {
			curNode.distance = dist
			curNode.prev = markNode
		}
	}

	/* 从未标记点集合unmark中寻找到start的路径距离最短的点 */
	// 基于路径距离对unmark进行升序排序，然后取第一个点
	const nearest = [...unmark].sort((a, b) => {
		const [an, bn] = [map.get(a), map.get(b)]
		if (!an || !bn) {
			console.error('节点不存在')
			return 0
		}
		return getDistance1(an) - getDistance1(bn)
	})[0]

	/* 标记nearest，将其添加到标记点集合mark中，并从unmark中删除 */
	const nearestNode = map.get(nearest)
	if (!nearestNode) {
		console.error('最近点获取失败')
		return
	}
	mark.add(nearest)
	unmark.delete(nearest)

	/* 若unmark中还有没标记完的点，继续寻路 */
	if (unmark.size) {
		explorer(nearestNode)
	}
}

/* 获取node到起点start的路径距离 */
function getDistance1(node: MapData): number {
	// 当前节点的前面点
	const { prev } = node
	if (!prev) {
		// 没有前面点，具备此情况的点除了起点还有所有未探索过的点
		return Infinity
	}
	return getDistance2(node, prev)
}

/* 获取node过prev后，到起点start的路径距离 */
function getDistance2(node: MapData, prev: MapData): number {
	/* 获取当前点与前一个点的距离
	 * 基于两个节点的id拼成segmentLengthMap中的key
	 */
	const [n, p] = [node.id, prev.id]
	const key = [n, p].sort().join('-')
	const d = segmentLengthMap[key]
	if (d === undefined) {
		console.error('节点距离未找到')
		return Infinity
	}
	/*
	 * 若前面点是起点，返回d
	 * 否则，进行线段距离的累加
	 */
	if (p === start) {
		return d
	} else {
		const ppNode = prev.prev
		if (!ppNode) {
			console.error('前面点的前一个点未找到')
			return Infinity
		}
		return d + getDistance2(prev, ppNode)
	}
}

/* 从结束点回溯路径 */
function backtrack(node: MapData | undefined): number[] {
	if (!node) {
		console.error('回溯点的前面点未找到')
		return []
	}
	const { id } = node
	if (id === start) {
		return [id]
	}
	return [node.id, ...backtrack(node.prev)]
}
</script>

<template>
  <div class="dijkstra_cont">
    <img class="dijkstra_img"  src="https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/canvas-lesson/dijkstra.jpg" alt="dijkstra">
    <p>从 {{ start }} 到 {{end}} 的最优路径是：{{[...optimal].reverse()}}</p>
  </div>
</template>

<style scoped>
  .dijkstra_cont{
    background-color: black;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .dijkstra_img{
    width: 512px;
  }
  .dijkstra_cont p{
    color: #fff;
    font-size: 18px;
  }
</style>
