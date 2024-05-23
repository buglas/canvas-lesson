import { Matrix3 } from "../math/Matrix3"
import { Vector2 } from "../math/Vector2"

export type BoundingBox = {
	min: Vector2
	max: Vector2
}


class Geometry{
  position:any[]=[]
  closePath:boolean=false
  boundingBox: BoundingBox = {
		min: new Vector2(Infinity),
		max: new Vector2(-Infinity),
	}
  readonly type:string='Geometry'
  crtPath(ctx: CanvasRenderingContext2D){
    ctx.beginPath()
		this.crtSubpath(ctx)
    return this
  }
  crtSubpath(ctx: CanvasRenderingContext2D){return this}
  applyMatrix3(matrix:Matrix3){return this}
  computeBoundingBox(){return this}
  getBoundingBoxByMatrix(m:Matrix3){
    return this.clone().applyMatrix3(m).computeBoundingBox().boundingBox
  }
  clone(){return new Geometry()}
  copy(geometry:Geometry){return this}
  close(b:boolean=true){
    this.closePath=b
    return this
  }
}
export {Geometry}










