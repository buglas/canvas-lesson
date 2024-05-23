import { BoundingBox } from "../geometry/Geometry"
import { Geometry } from "../geometry/Geometry"
import { Vector2 } from "../math/Vector2"
import { Graph2D } from "../objects/Graph2D"
import { StandStyle } from "../style/StandStyle"

/* 包围盒包含的所有目标对象，object类型后续可做扩展 */
export type BVHTargetType={
  object:Graph2D<Geometry,StandStyle>
  boundingBox:BoundingBox
}

class BVH {
  // 目标对象集合
	targets: BVHTargetType[]
  // 当图形小于minNum时，停止区域划分
  minNum:number
  // 包围盒
  boundingBox:BoundingBox={
    min:new Vector2(Infinity),
    max:new Vector2(-Infinity)
  }
	// 子节点
	children: BVH[] = []
	// 父节点
	parent?: BVH = undefined

  constructor(targets: BVHTargetType[]=[],minNum=4){
    this.targets=targets
    this.minNum=minNum
    // 计算targets的包围盒
    this.computeBoundingBox()
    // 计算层次结构
    this.computeHierarchy()
  }

  /* 包围盒尺寸 */
	get size() {
		const { boundingBox:{min, max} } = this
		return new Vector2(max.x - min.x, max.y - min.y)
	}

  /* 计算包裹targets的包围盒 */
  computeBoundingBox(){
    const {targets,boundingBox:b1}=this
    targets.forEach(({boundingBox:b2}) => {
      b1.min.expandMin(b2.min)
		  b1.max.expandMax(b2.max)
    });
  }

  /* 计算targets的层次结构 */
  computeHierarchy(){
    // 清空子集
    this.children = []
    // 区域划分
    this.divide()
  }

  /* 区域划分 */
	divide() {
    const {targets,minNum, size, boundingBox:{min} } = this

    // 若target数量小于最小分割数量，则返回
    if(targets.length<=minNum){
      return this
    }

		// 切割方向
		const dir = size.x > size.y ? 'x' : 'y'
		// 切割位置
		const pos = min[dir] + size[dir] / 2
    
    // 将分targets 成两半
    const targetsA:BVHTargetType[]=[]
    const targetsB:BVHTargetType[]=[]
		targets.forEach(target => {
      const {boundingBox}=target
      const  { min, max }=boundingBox
      if (min[dir] + (max[dir] - min[dir]) / 2 < pos) {
				targetsA.push(target)
			} else {
				targetsB.push(target)
			}
		})

    // 若分割出空集，则返回
    if(!targetsA.length||!targetsB.length){
      return this
    }

    // 根据分割出的targets创建新的BVH，并将其作为当前BVH的子集
    for(let subTargets of [targetsA,targetsB]){
      const box: BVH = new BVH(subTargets,minNum)
      this.children.push(box)
    }

    return this;
	}

	/* 深度遍历包围盒
  callback1: 遍历所有包围盒
  callback2：用于中断遍历的条件
  */
	traverse(callback1: (obj: BVH) => void,callback2?: (obj: BVH) => boolean) {
    if(callback2&&!callback2(this)){return}
		callback1(this)
		const { children } = this
		for (let child of children) {
			if (child.children.length) {
				child.traverse(callback1,callback2)
			} else {
				callback1(child)
			}
		}
	}
}

export {BVH}