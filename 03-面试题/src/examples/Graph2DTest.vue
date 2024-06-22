<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Scene } from '../lmm/core/Scene'
import { StandStyle } from '../lmm/style/StandStyle'
import { Graph2D } from '../lmm/objects/Graph2D'
import { CircleGeometry } from '../lmm/geometry/CircleGeometry'
import { RectGeometry } from '../lmm/geometry/RectGeometry'
import { PolyGeometry } from '../lmm/geometry/PolyGeometry'
import { TextGraph2D } from '../lmm/objects/TextGraph2D'
import { TextStyle } from '../lmm/style/TextStyle'
import { Vector2 } from '../lmm/math/Vector2'
import { ImageGraph2D } from '../lmm/objects/ImageGraph2D'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>()

// 实例化一个场景
const scene=new Scene()

// 多边形
const polyGeometry=new PolyGeometry([0, -300, 100, -250, -100, -250]).close()
const polyStyle=new StandStyle({
  strokeStyle:'#fff',
  fillStyle:'#00acec',
  lineWidth:6,
  lineDash:[6],

})
const polyObj=new Graph2D(polyGeometry,polyStyle)
scene.add(polyObj)

// 圆形
const circleGeometry=new CircleGeometry(50,32)
const circleStyle=new StandStyle({fillStyle:'#00acec'})
const circleObj=new Graph2D(circleGeometry,circleStyle)
circleObj.position.set(0,-200)
scene.add(circleObj)

// 矩形
const rectObj=new Graph2D(
  new RectGeometry(0,0,200,50),
  new StandStyle({fillStyle:'#00acec'})
)
rectObj.position.set(-100,-150)
scene.add(rectObj)

// 文字
const textStyle=new TextStyle({
  fontSize:50,
  textAlign:'center',
  textBaseline:'middle',
  fillStyle:'#00acec'
})
const textObj=new TextGraph2D('Sphinx',textStyle)
// const textObj=new TextGraph2D('Sphinx',new Vector2(0,-30),textStyle)
textObj.offset.set(0,-30)
textObj.update()
textObj.position.set(0,-20)
textObj.rotate=0.1
scene.add(textObj)
// 文字包围盒
const textBoundingBox=new Graph2D(
  textObj.geometry.clone().applyMatrix3(textObj.worldMatrix),
  new StandStyle({strokeStyle:'#00acec'})
)
scene.add(textBoundingBox)

// 图像
const image=new Image()
const src='https://yxyy-pandora.oss-cn-beijing.aliyuncs.com/stamp-images/1.png'
image.src=src
// const imageObj=new ImageGraph2D(image)
const imageObj=new ImageGraph2D(src)
scene.add(imageObj)
image.onload=function(){
  imageObj.style.setOption({
    fillStyle:'rgba(0,172,236,0.1)',
    strokeStyle:'#00acec',
    order:['image','fill','stroke'],
    // order:['fill','image','stroke'],
    shadowColor:'rgba(0,0,0,0.5)',
    shadowOffsetY:20,
    shadowBlur:5
  })
  imageObj.size.set(image.width/2,image.height/2)
  imageObj.offset.copy(imageObj.size.clone().multiplyScalar(-0.5))
  imageObj.update()
  imageObj.scale.set(0.4)
  imageObj.position.set(0,90)
  scene.render()
}

function pointermove(event:PointerEvent){
  // 鼠标的世界坐标位
  const worldPosition=scene.clientToWorld(event.clientX,event.clientY);
  // 选择图形
  [polyObj,circleObj,rectObj,textObj,imageObj].forEach(obj=>{
    // 鼠标在图形对象中的本地坐标位
    const localPosition=worldPosition.clone().applyMatrix3(obj.worldMatrix.invert())
    // 判断点位是否在图形中
    const bool=obj.isPointIn(localPosition)
    // 用于选择切换的颜色
    const colors='isImageGraph2D' in obj?['rgba(0,172,236,0.1)','rgba(255,0,0,0.1)']:['#00acec','orange']
    // 设置图形的填充样式
    obj.style.fillStyle=colors[+bool]
  })
  // 渲染
  scene.render()
}

onMounted(() => {
	const canvas = canvasRef.value
  if(canvas){
    scene.setOption({canvas})
    scene.render()
  }
})

</script>

<template>
	<canvas
		ref="canvasRef"
		:width="size.width"
		:height="size.height"
    @pointermove="pointermove"
	></canvas>
</template>

<style scoped></style>