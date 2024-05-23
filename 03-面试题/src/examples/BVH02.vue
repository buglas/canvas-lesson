<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Scene } from "../lmm/core/Scene";
import { Vector2 } from "../lmm/math/Vector2";
import { PolyExtendGeometry } from "../lmm/geometry/PolyExtendGeometry";
import { RectGeometry } from "../lmm/geometry/RectGeometry";
import { Graph2D } from "../lmm/objects/Graph2D";
import { StandStyle, StandStyleType } from "../lmm/style/StandStyle";
import { BVH, BVHTargetType } from "../lmm/physics/BVH";
import { BVHHelper } from "../lmm/helper/BVHHelper";
import { Color } from "../lmm/math/Color";
import { Ray2 } from "../lmm/math/Ray2";
import { PolyGeometry } from "../lmm/geometry/PolyGeometry";
import {
  IntersectData,
  intersectBVH,
  intersectObject,
} from "../lmm/physics/PhysicUtils";
import { CircleGeometry } from "../lmm/geometry/CircleGeometry";
import { RectStore } from "./dataLib/RectStore";

// 获取父级属性
defineProps({
  size: { type: Object, default: { width: 0, height: 0 } },
});

// 对应canvas 画布的Ref对象
const canvasRef = ref<HTMLCanvasElement>();

/* 场景 */
const scene = new Scene();

// 半径
const radius = 10;
// 起点
// const origin = new Vector2(-180, -220)
const origin = new Vector2(0, -0);
// 球体
const circleGeometry = new CircleGeometry(radius, 12);
const circleStyle = new StandStyle({
  fillStyle: "#00acec",
});
const circleObj = new Graph2D(circleGeometry, circleStyle);
circleObj.position.copy(origin);
circleObj.index = 3;
scene.add(circleObj);


/* 障碍物 */
const targets:BVHTargetType[]=[]
for(let { x, y, w, h, r, g, b, counter} of RectStore){
  // 创建矩形
  const rectGeometry = new RectGeometry(0,0,w, h, counter)
  const rectStyle = new StandStyle({
    fillStyle:`rgba(${r},${g},${b},0.5)`,
  })
  const rectObj = new Graph2D(rectGeometry, rectStyle)
  rectObj.position.set(x - w / 2, y - h / 2);
  scene.add(rectObj);

  // 扩展矩形
  const worldRectGeometry=rectGeometry
    .clone()
    .applyMatrix3(rectObj.worldMatrix)
    .computeSegmentNormal()
    .close()
  const polyExtendGeometry = new PolyExtendGeometry(worldRectGeometry, radius)
    .computeBoundingBox()
    .close();
  const polyExtendStyle = new StandStyle({
    strokeStyle:`rgba(${r},${g},${b},1)`,
    lineDash: [3],
  });
  const polyExtend = new Graph2D(polyExtendGeometry, polyExtendStyle);
  polyExtend.name = "obstacle";
  scene.add(polyExtend);
  polyExtendGeometry.computeBoundingBox();

  
  // BVH的targets
  targets.push({
    object:polyExtend,
    boundingBox:polyExtendGeometry.boundingBox
  })
}

/* 为障碍物创建BVH包围盒 */
const bvh = new BVH(targets, 4);

/* 显示包围盒 */
const color = new Color();
const bvhHelper = new BVHHelper(bvh, (bvh: BVH, ind: number)=>{
  color.setHSL(ind/10, 1, 0.4);
  const strokeStyle = color.getStyle();
  const fillStyle = color.getRGBA(0.02);
  return new StandStyle({ strokeStyle, fillStyle });
});
scene.add(bvhHelper);

/* 围墙 */
const wallGeometry = new RectGeometry(-320, -320, 640, 640, true);
const wallStyle = new StandStyle({
  strokeStyle: "#333",
  lineWidth: 2,
});
const wallObj = new Graph2D(wallGeometry, wallStyle);
scene.add(wallObj);
/* 围墙内缩 */
const wallExtendObj = crtExtendObj(wallGeometry, radius, {
  strokeStyle: "#333",
  lineDash: [3],
});
scene.add(wallExtendObj);
function crtExtendObj(geometry: PolyGeometry, radius: number, style: StandStyleType) {
  geometry.computeSegmentNormal();
  const extendGeomtry = new PolyExtendGeometry(geometry, radius).close();
  const extendStyle = new StandStyle(style);
  return new Graph2D(extendGeomtry, extendStyle);
}
/* 围墙内缩后的包围盒 */
{
  const boundingBox = crtBoundingBox(wallExtendObj.geometry);
  scene.add(boundingBox);
}
function crtBoundingBox(geometry: PolyExtendGeometry) {
  geometry.computeBoundingBox();
  const {
    min: { x: x1, y: y1 },
    max: { x: x2, y: y2 },
  } = geometry.boundingBox;
  return new Graph2D(
    new PolyGeometry([x1, y1, x2, y1, x2, y2, x1, y2]).close(),
    new StandStyle({
      strokeStyle: "rgba(255,120,0,0.6)",
      lineWidth: 2,
      lineDash: [12, 4, 4, 4],
    })
  );
}

// 球体运动方向
const direction = new Vector2(1, 0.3).normalize();
// 射线
let ray2D = new Ray2(origin.clone(), direction);

// 碰撞反弹路径
const reboundGeometry = new PolyGeometry();
const reboundStyle = new StandStyle({
  strokeStyle: "#00acec",
  lineWidth: 2,
});
const reboundObj = new Graph2D(reboundGeometry, reboundStyle);
scene.add(reboundObj);

// 射线与包围盒的相交数据
let intersectObstractData: IntersectData[] | null = null;

// 反弹次数
const reflectNum = 29;

ani()
/* 连续动画 */
function ani() {
  // 若intersectObstractData存在，恢复其中第1个图形的样式
  if (intersectObstractData) {
    intersectObstractData[0].object.style.setOption({
      lineWidth: 1,
      lineDash: [3],
    });
  }
  // 旋转射线
  ray2D.direction.rotate(0.005);
  // 暂存射线
  const rayTem = ray2D.clone();
  // 反弹路径
  const reboundPath = [...origin];
  // 在特定的反弹次数内，让射线通过BVH选择物体
  for (let i = 0; i < reflectNum; i++) {
    intersectObstractData = intersectBVH(rayTem, bvh);
    if (intersectObstractData) {
      const { point } = intersectObstractData[0];
      // 将交点存入reboundPath
      reboundPath.push(...point);
      // 将选中的图形的描边加粗
      intersectObstractData[0].object.style.setOption({
        lineWidth: 3,
        lineDash: [],
      });
      break;
    }

    // 射线与墙体的相交数据
    const intersectWallData = intersectObject(rayTem, wallExtendObj, true);
    if (intersectWallData) {
      const { point, normal } = intersectWallData;
      // 将交点存入reboundPath
      reboundPath.push(...point);
      // 反弹射线
      rayTem.reflect(point, normal);
      continue;
    }
  }
  // 更新反弹图形
  reboundGeometry.position = reboundPath;
  // 渲染
  scene.render();
  requestAnimationFrame(ani);
}

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