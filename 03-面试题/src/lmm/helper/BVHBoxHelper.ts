import { Geometry } from '../geometry/Geometry';
import { RectGeometry } from '../geometry/RectGeometry';
import { Group } from '../objects/Group';
import { Graph2D } from '../objects/Graph2D';
import { BVHBox } from '../physics/BVHBox';
import { StandStyle } from '../style/StandStyle';

/* BVHBox应面向多个对象和样式，后续补充 */
const defaultStyle=()=>(new StandStyle({strokeStyle:'#000'}))
type StyleCallback=(box:BVHBox,ind:number)=>StandStyle
type StyleType=StandStyle|StyleCallback

class BVHBoxHelper extends Group{
  box:BVHBox
  style: StyleType
  constructor(box:BVHBox,style: StyleType=defaultStyle()){
    super();
    this.box=box
    this.style=style
    this.update();
  }
  update(){
    const {box,style}=this
    this.clear()
    let ind=0
    box.traverse((box) => {
      const { min, max } = box
      const rectGeometry=new RectGeometry(min.x,min.y,max.x-min.x,max.y-min.y).close()
      const rectStyle=typeof style === 'object'?style:style(box,ind)
      const rectObj = new Graph2D(rectGeometry,rectStyle)
      this.add(rectObj)
      ind++;
    })
  }
}

export {BVHBoxHelper}