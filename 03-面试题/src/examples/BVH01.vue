<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Scene } from "../lmm/core/Scene";
import { RectGeometry } from "../lmm/geometry/RectGeometry";
import { Graph2D } from "../lmm/objects/Graph2D";
import { StandStyle } from "../lmm/style/StandStyle";
import { BVH, BVHTargetType } from "../lmm/physics/BVH";
import { BVHHelper } from "../lmm/helper/BVHHelper";
import { RectStore } from "./dataLib/RectStore";
import { Color } from "../lmm/math/Color";


// 获取父级属性
defineProps({
  size: { type: Object, default: { width: 0, height: 0 } },
});

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>();

/* 场景 */
const scene = new Scene();


/* 创建图形 */
const targets:BVHTargetType[]=[]
for(let { x, y, w, h, r, g, b, counter} of RectStore){
  // 创建矩形
  const rectGeometry = new RectGeometry(0,0,w, h, counter)
  const rectStyle = new StandStyle({
    fillStyle:`rgba(${r},${g},${b},0.5)`,
  })
  const rectObj = new Graph2D(rectGeometry, rectStyle)
  rectObj.position.set(x - w / 2, y - h / 2)
  rectObj.rotate=Math.random()*3.14
  scene.add(rectObj);
  
  // BVH的targets
  targets.push({
    object:rectObj,
    boundingBox:rectObj.getWorldBoundingBox()
  })
}

/* 实例化BVH对象 */
const bvh = new BVH(targets, 4);


/* 显示BVH包围盒 */
/* const bvhStyle = new StandStyle({
  strokeStyle:'rgba(0,0,0,0.3)',
  lineWidth:2
}); */

// 颜色类，颜色转换
const color = new Color();
// 样式函数
const bvhStyle=function(bvh: BVH, ind: number){
  color.setHSL(ind/10, 1, 0.4);
  const strokeStyle = color.getStyle();
  const fillStyle = color.getRGBA(0.02);
  return new StandStyle({ strokeStyle, fillStyle });
}

const bvhHelper = new BVHHelper(bvh, bvhStyle);
scene.add(bvhHelper);

onMounted(() => {
  const canvas = canvasRef.value;
  if (canvas) {
    scene.setOption({ canvas });
    scene.render();
  }
});
</script>

<template>
  <canvas ref="canvasRef" :width="size.width" :height="size.height"></canvas>
</template>

<style scoped></style>