import { Matrix3 } from "../math/Matrix3"
import { Vector2 } from "../math/Vector2"
import { Geometry } from "./Geometry"

export type BoundingBox = {
	min: Vector2
	max: Vector2
}


class GeometryGroup{
  children:Set<Geometry>=new Set()
  boundingBox: BoundingBox = {
		min: new Vector2(),
		max: new Vector2(),
	}
  readonly type:string='GeometryGroup'
  constructor(...geometries:Geometry[]){
    this.add(...geometries)
  }
  add(...geometries:Geometry[]){
    for(let geometry of geometries){
      this.children.add(geometry)
    }
  }
  crtPath(ctx: CanvasRenderingContext2D){
    const {children}=this
    ctx.beginPath()
    children.forEach(geometry=>{
      geometry.crtSubpath(ctx)
    })
    return this
  }
  applyMatrix3(matrix:Matrix3){
    const {children}=this
    children.forEach(geometry=>{
      geometry.applyMatrix3(matrix)
    })
    return this
  }
  computeBoundingBox(updateChilrenBoundingBox=false){
    const {children,boundingBox:{min,max}}=this
    children.forEach(geometry=>{
      updateChilrenBoundingBox&&geometry.computeBoundingBox()
      min.expandMin(geometry.boundingBox.min)
		  max.expandMax(geometry.boundingBox.max)
    })
    return this
  }
  clone(){
    return new GeometryGroup().copy(this)
  }
  copy(geometryGroup:GeometryGroup){
    const {children,boundingBox:{min,max}}=geometryGroup
    for(let geometry of children){
      this.add(geometry.clone())
    }
    this.boundingBox={
      min:min.clone(),
      max:max.clone(),
    }
    return this
  }
  
}
export {GeometryGroup}










