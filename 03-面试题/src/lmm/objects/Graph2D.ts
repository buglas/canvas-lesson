import { StandStyle } from '../style/StandStyle'
import { Object2D } from '../core/Object2D'
import { Geometry } from '../geometry/Geometry'
import { GeometryGroup } from '../geometry/GeometryGroup'
import { Vector2 } from '../math/Vector2'
import { Matrix3 } from '../math/Matrix3'

/* 虚拟上下文对象 */
const virtuallyCtx = document
	.createElement('canvas')
	.getContext('2d') as CanvasRenderingContext2D

/* 路径 */
class Graph2D<S extends Geometry|GeometryGroup,T extends StandStyle> extends Object2D {
  geometry:S =new Geometry() as S
	style: T=new StandStyle() as T
	readonly Path2D = true

	constructor(geometry?:S,style?:T) {
		super()
		geometry&&(this.geometry=geometry)
		style&&(this.style=style)
	}

  /* 点位是否在路径中 */
  isPointIn(point:Vector2){
    const {geometry} = this
    virtuallyCtx.save()
		geometry.crtPath(virtuallyCtx)
		const bool = virtuallyCtx.isPointInPath(point.x, point.y)
		virtuallyCtx.restore()
		return bool
  }

  /* 获取物体在世界坐标系内的边界 */
  getWorldBoundingBox(){
    const {geometry,worldMatrix}=this
    return geometry.getBoundingBoxByMatrix(worldMatrix)
  }

	/* 绘图 */
	drawShape(ctx: CanvasRenderingContext2D) {
		const {
      geometry,
			style,
		} = this
		//样式
		style.apply(ctx)
		// 创建路径
		geometry.crtPath(ctx)
		// 绘图
		for (let method of style.order) {
			style[`${method}Style`] && ctx[method]()
		}
	}
}

export { Graph2D }
