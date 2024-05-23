<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Scene } from '../lmm/core/Scene'
import { Vector2 } from '../lmm/math/Vector2'
import { Ray2 } from '../lmm/math/Ray2'
import { intersectObjects } from '../lmm/physics/PhysicUtils'
import { CircleGeometry } from '../lmm/geometry/CircleGeometry'
import { StandStyle, StandStyleType } from '../lmm/style/StandStyle'
import { Graph2D } from '../lmm/objects/Graph2D'
import { PolyGeometry } from '../lmm/geometry/PolyGeometry'
import { PolyExtendGeometry } from '../lmm/geometry/PolyExtendGeometry'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

/* 场景 */
const scene = new Scene()

// 半径
const radius = 40
// 起点
const origin = new Vector2(-200, 0)
// 小球
const circleGeometry = new CircleGeometry(radius, 36)
const circleStyle = new StandStyle({ fillStyle: '#00acec' })
const circleObj = new Graph2D(circleGeometry, circleStyle)
circleObj.position.copy(origin)
circleObj.index = 3
scene.add(circleObj)

/* 围墙 */
/* const wallGeometry = new PolyGeometry([
	-300, -300, -300, 300, 300, 300, 300, -300
]).close() */
const wallGeometry = new PolyGeometry([
	-300, -300,
  -300, 300,
  300, 300,
  300, 100,
  150, 200,
  300, -300,
]).close()
const wallStyle = new StandStyle({
	strokeStyle: '#333',
	lineWidth: 2,
})
const wallObj = new Graph2D(wallGeometry, wallStyle)
scene.add(wallObj)

/* 障碍物 */
const obstacleGeometry = new PolyGeometry([
	20, -100, 20, 50, -20, 50, -20, -100
]).close()
const obstacleStyle = new StandStyle({ fillStyle: 'green' })
const obstacleObj = new Graph2D(obstacleGeometry, obstacleStyle)
obstacleObj.position.set(100,0)
scene.add(obstacleObj)

/* 围墙内缩 */
const wallExtendObj = crtExtendObj(wallGeometry, radius, {
	strokeStyle: '#333',
	lineDash: [3],
})
scene.add(wallExtendObj)

/* 障碍物外扩 */
const obstacleExtendObj = crtExtendObj(
  obstacleGeometry.clone().applyMatrix3(obstacleObj.worldMatrix), 
  radius, {
    strokeStyle: 'green',
    lineDash: [3],
  }
)
obstacleExtendObj.name = 'obstacle'
scene.add(obstacleExtendObj)

/* 创建扩展对象方法 */
function crtExtendObj(
	geometry: PolyGeometry,
	radius: number,
	style: StandStyleType
) {
  geometry.computeSegmentNormal()
	const extendGeomtry = new PolyExtendGeometry(geometry, radius).close()
	const extendStyle = new StandStyle(style)
	return new Graph2D(extendGeomtry, extendStyle)
}

/* 围墙扩展对象的包围盒 */
{
	const boundingBox = crtBoundingBox(wallExtendObj.geometry)
	scene.add(boundingBox)
}
/* 障碍物扩展对象的包围盒 */
{
  const boundingBox = crtBoundingBox(obstacleExtendObj.geometry)
	scene.add(boundingBox)
}


function crtBoundingBox(geometry:PolyExtendGeometry){
  geometry.computeBoundingBox()
  const {
		min: { x: x1, y: y1 },
		max: { x: x2, y: y2 },
	} = geometry.boundingBox
  return new Graph2D(
    new PolyGeometry([x1, y1, x2, y1, x2, y2, x1, y2]).close(),
    new StandStyle({
			strokeStyle: 'rgba(255,120,0,0.6)',
			lineWidth: 2,
			lineDash: [12, 4, 4, 4],
		})
  )
}

// 以球心为原点，自定义一个方向，实例化一条射线。
// 小球运动方向
const direction = new Vector2(1.2, 1).normalize()
// 射线
let ray = new Ray2(origin.clone(), direction)
// 反弹路径的顶点集合
const reboundPath = [...origin]
// 反弹次数
const reflectNum = 29
// 暂存的反弹射线
const rayTem = ray.clone()

for (let i = 0; i < reflectNum; i++) {
  // 射线与墙体和障碍物的交点
  const intersectData=intersectObjects(
    rayTem,
    [wallExtendObj,obstacleExtendObj],
    true
  )
  if(intersectData){
    const {point,object,normal}=intersectData[0]
    reboundPath.push(...point)
    // 若碰撞到障碍物，不再反弹
		if (object.uuid === obstacleExtendObj.uuid) {
			break
		}
    // 否则，继续反弹
		rayTem.reflect(point, normal)
  }
}



// 根据reboundPath 绘制一条路径
scene.add(
	new Graph2D(
    new PolyGeometry(reboundPath),
    new StandStyle({strokeStyle:'#00acec'})
  )
)

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

<style scoped></style>