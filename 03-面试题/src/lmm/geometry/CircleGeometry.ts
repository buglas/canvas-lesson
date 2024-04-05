import { PolyGeometry } from "./PolyGeometry";

const PI2=Math.PI*2

class CircleGeometry extends PolyGeometry{
  radius:number=300
  segments:number=8
  counterclockwise:boolean=false
  constructor(radius?:number,counterclockwise?:boolean)
  constructor(radius?:number,segments?:number,counterclockwise?:boolean)
  constructor(radius?:number,segments?:number|boolean,counterclockwise?:boolean){
    super()
    const argLen=arguments.length
    if(!argLen){return}
    const argEnd=arguments[argLen-1]
    let end=argLen
    if(typeof argEnd==='boolean'){
      this.counterclockwise=argEnd
      end-=1
    }
    for(let i=0;i<end;i++){
      this[['radius','segments'][i]]=arguments[i]
    }
    this.updatePosition()
  }

  // 更新
  updatePosition(){
    const {radius,segments,counterclockwise} = this
    const dir=counterclockwise?-1:1
    const step=PI2/segments*dir
    const position:number[]=[]
    for(let i=0;i<segments;i++){
      const ang=step*i
      position.push(
        Math.cos(ang)*radius,
        Math.sin(ang)*radius,
      )
    }
    this.position=position
  }

  // 包围盒
	computeBoundingBox() {
		const {
			radius,
			boundingBox: { min, max },
		} = this
		min.set(-radius)
		max.set(radius)
		return this
	}

  // 克隆
	clone() {
		return new CircleGeometry().copy(this)
	}

  // 拷贝
  copy(circleGeometry:CircleGeometry){
    const {radius,segments,counterclockwise}=circleGeometry
    super.copy(circleGeometry)
    this.radius=radius
    this.segments=segments
    this.counterclockwise=counterclockwise
    return this
  }
}
export {CircleGeometry}