import { BoundingBox } from "../geometry/Geometry"
import { Geometry } from "../geometry/Geometry"
import { RectGeometry } from "../geometry/RectGeometry"
import { Vector2 } from "../math/Vector2"
import { Graph2D } from "../objects/Graph2D"
import { StandStyle } from "../style/StandStyle"

/* 包围盒的目标对象不应只是Graph2D，还有图案和文字，后续补充 */
type ObjectType=Graph2D<Geometry,StandStyle>
type BoundingBoxCallback=(obj:ObjectType)=>BoundingBox

/* 包围盒节点类 */
class BVHBox {
  // 最小数量
  minNum:number=4
  // 极值
	min = new Vector2(Infinity)
	max = new Vector2(-Infinity)
	// 子节点
	children: BVHBox[] = []
	// 父节点
	parent?: BVHBox = undefined
	// 包围盒包含的三维图形
	objects: ObjectType[] = []

  constructor(objects?: ObjectType[],minNum?:number){
    minNum&&(this.minNum=minNum)
    if(objects){
      this.pushObjects(objects)
      this.update()
    }
  }

  /* 将图形塞入包围盒 */
  pushObjects(objects: ObjectType[],computeBoundingBox=true){
    objects.forEach(obj => {
      this.pushObject(obj,computeBoundingBox)
    });
  }
  pushObject(object: ObjectType,computeBoundingBox=true){
    const {geometry}=object
    computeBoundingBox&&geometry.computeBoundingBox()
    this.objects.push(object)
    this.expand(geometry.boundingBox)
  }

  /* 包围盒尺寸 */
	get size() {
		const { min, max } = this
		return new Vector2(max.x - min.x, max.y - min.y)
	}

  /* 添加包围盒 */
  add(...objs: BVHBox[]) {
		for (let obj of objs) {
			obj.parent && obj.remove()
			obj.parent = this
			this.children.push(obj)
			if (obj === this) {
				console.error("obj can't be added as a child of itself.", obj)
				return this
			}
		}
		return this
	}

  /* 删除包围盒 */
	remove(...objs: BVHBox[]) {
		const { children } = this
		for (let obj of objs) {
			const index = children.indexOf(obj)
			if (index !== -1) {
				obj.parent = undefined
				this.children.splice(index, 1)
			} else {
				for (let child of children) {
					if (child instanceof BVHBox) {
						child.remove(obj)
					}
				}
			}
		}
		return this
	}

  /* 清空包围盒 */
  clear() {
		this.children = []
		return this
	}
	
  /* 基于子元素的包围盒扩展当前包围盒 */
	expand(boundingBox: BoundingBox) {
		this.min.expandMin(boundingBox.min)
		this.max.expandMax(boundingBox.max)
    return this;
	}

  /* 更新包围盒 */
  update(boundingBoxCallback?:BoundingBoxCallback){
    this.clear()
    this.divide(boundingBoxCallback)
  }
	
  /* 分割包围盒 */
	divide(boundingBoxCallback?:BoundingBoxCallback) {
    if(this.objects.length<=this.minNum){
      return
    }
    
		const { size, min, objects } = this
		// 切割方向
		const dir = size.x > size.y ? 'x' : 'y'
		// 切割位置
		const pos = min[dir] + size[dir] / 2
    
		// 分成两半
		const boxA: BVHBox = new BVHBox([],this.minNum)
		const boxB: BVHBox = new BVHBox([],this.minNum)
		// 遍历图形
		objects.forEach((obj) => {
			const {
				geometry:{boundingBox},
			} = obj
      const  { min, max }=boundingBox
      // console.log('boundingBox',boundingBox);
      
			const box=boundingBoxCallback?boundingBoxCallback(obj):boundingBox;
      
      if (min[dir] + (max[dir] - min[dir]) / 2 < pos) {
				boxA.objects.push(obj)
				boxA.expand(box)
			} else {
				boxB.objects.push(obj)
				boxB.expand(box)
			}
		})
    
    // return
    // 将切割出的包围盒作为当前包围盒的子节点
    /* for(let box of [boxA,boxB]){
      if(box.objects.length){
        console.log('box.objects.length',box.objects.length);
        this.add(box)
        box.divide()
      }
    } */
    if(boxA.objects.length&&boxB.objects.length){
      for(let box of [boxA,boxB]){
        this.add(box)
        box.divide()
      }
    }else{
      console.log(1);
      
    }
    return this;
	}

	/* 深度遍历包围盒
  callback1: 所有包围盒的回调函数
  callback2：包围盒的遍历条件
  */
	traverse(callback1: (obj: BVHBox) => void,callback2?: (obj: BVHBox) => boolean) {
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

export {BVHBox}