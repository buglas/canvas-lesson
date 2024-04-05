import { Vector2 } from "../math/Vector2";
import { PolyGeometry } from "./PolyGeometry";

class RectGeometry extends PolyGeometry{
  offset:Vector2=new Vector2()
  size:Vector2=new Vector2(300,150)
  counterclockwise:boolean=false
  closePath: boolean=true
  constructor(offset?:Vector2,counterclockwise?:boolean)
  constructor(offset?:Vector2,size?:Vector2,counterclockwise?:boolean)
  constructor(x?:number,y?:number,counterclockwise?:boolean)
  constructor(x?:number,y?:number,w?:number,h?:number,counterclockwise?:boolean)
  constructor(x?:number|Vector2,y?:number|Vector2|boolean,w?:number|boolean,h?:number,counterclockwise?:boolean){
    super()
    const argLen=arguments.length
    if(!argLen){return}
    const argEnd=arguments[argLen-1]
    let end=argLen
    if(typeof argEnd==='boolean'){
      this.counterclockwise=argEnd
      end-=1
    }
    if(typeof arguments[0]==='number'){
      const keys=['x','y','width','height']
      for(let i=0;i<end;i++){
        if(i<=1){
          this.offset[keys[i]]=arguments[i]
        }else{
          this.size[keys[i]]=arguments[i]
        }
      }
    }else{
      for(let i=0;i<end;i++){
        this[['offset','size'][i]]=arguments[i]
      }
    }
    this.updatePosition()
  }
  // 更新点位
  updatePosition(){
    const {
			size:{width,height},
      offset:{x,y},
      counterclockwise
		} = this

    this.position=counterclockwise?[
      x,height+y,
      width+x,height+y,
      width+x,y,
      x,y,
    ]:[
      x,y,
      width+x,y,
      width+x,height+y,
      x,height+y,
    ]
  }

  // 克隆
	clone() {
		return new RectGeometry().copy(this)
	}

  // 拷贝
  copy(rectGeometry:RectGeometry){
    const {size,offset,counterclockwise}=rectGeometry
    super.copy(rectGeometry)
    this.size.copy(size)
    this.offset.copy(offset)
    this.counterclockwise=counterclockwise
    return this
  }
}
export {RectGeometry}