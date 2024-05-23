import { RectGeometry } from '../geometry/RectGeometry';
import { Group } from '../objects/Group';
import { Graph2D } from '../objects/Graph2D';
import { BVH } from '../physics/BVH';
import { StandStyle } from '../style/StandStyle';


/* 样式的回调函数 */
type StyleCallback=(bvh:BVH,ind:number)=>StandStyle
/* 样式类型 */
type StyleType=StandStyle|StyleCallback

/* 默认样式 */
const defaultStyle=()=>(new StandStyle({strokeStyle:'#000'}))

class BVHHelper extends Group{
  bvh:BVH
  style: StyleType
  constructor(bvh:BVH,style: StyleType=defaultStyle()){
    super();
    this.bvh=bvh
    this.style=style
    this.update();
  }
  
  /* 遍历BVH的层级结构，建立相应的包围盒图形 */
  update(){
    const {bvh,style}=this
    this.clear()
    let ind=0
    bvh.traverse((target) => {
      const { boundingBox:{min, max} } = target
      const rectGeometry=new RectGeometry(min.x,min.y,max.x-min.x,max.y-min.y).close()
      const rectStyle=typeof style === 'object'?style:style(target,ind)
      const rectObj = new Graph2D(rectGeometry,rectStyle)
      this.add(rectObj)
      ind++;
    })
  }
}

export {BVHHelper}