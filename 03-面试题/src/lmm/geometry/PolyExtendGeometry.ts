import { PolyGeometry } from './PolyGeometry'
import { Arc2 } from '../math/Arc2'
import { Matrix3 } from '../math/Matrix3'
import { Ray2 } from '../math/Ray2'
import { Segment2 } from '../math/Segment2'
import { Vector2 } from '../math/Vector2'
import { Geometry } from './Geometry'

/* 圆弧的数据类型 */
export type ArcType = {
	origin: Vector2
	startAngle: number
	endAngle: number
	startPosition: Vector2
	endPosition: Vector2
}

/* 顶点扩展后的图形类型 */
export type ShapeElementType = Vector2 | ArcType

const PI = Math.PI

/* x,y,-x,-y 方向 */
const angles = [0, PI / 2, PI, (PI * 3) / 2, PI * 2]

class PolyExtendGeometry extends Geometry {
  // 扩展目标
	target: PolyGeometry
  // 扩展距离
	distance: number
  // 图形数据集合
	position: ShapeElementType[] = []

  readonly type = 'PolyExtendGeometry'

	constructor(target: PolyGeometry = new PolyGeometry(), distance: number = 0) {
		super()
		this.target = target
		this.distance = distance
		this.updatePosition()
	}

	// 更新图形
	updatePosition() {
		const {
			target: { position, normals },
			distance,
		} = this
		const shapeLen = position.length
		// 多边形的线段扩展后的顶点集合
		const points: Vector2[] = []
		// 遍历线段，将其沿法线扩展
		for (let i = 0; i < shapeLen; i += 2) {
      // 当前线段的法线
			const normal = new Vector2(normals[i], normals[i + 1])
      // 下一个点
			const j = (i + 2) % shapeLen
			// 原线段
			const p1 = new Vector2(position[i], position[i + 1])
			const p2 = new Vector2(position[j], position[j + 1])
			// 扩展线段
			const p3 = new Ray2(p1, normal).at(distance)
			const p4 = new Ray2(p2, normal).at(distance)
			points.push(p3, p4)
		}
		const curShape: ShapeElementType[] = []
		const pointsLen = points.length
		// 遍历扩展后的顶点
		for (let i = 0; i < pointsLen; i += 2) {
			// 当前顶点前的线段
			const p1 = points[(i - 2 + pointsLen) % pointsLen]
			const p2 = points[(i - 1 + pointsLen) % pointsLen]
			const segF = new Segment2(p1, p2)
			// 当前顶点后的线段
			const p3 = points[i]
			const p4 = points[i + 1]
			const segB = new Segment2(p3, p4)

			// 线段与线段的交点
			const intersection = segF.intersect(segB)
			// 若当前顶点两侧扩展出的线段有交点，则当前顶点扩展出的图形是交点；否则是圆弧。
			if (intersection) {
				curShape.push(intersection)
			} else {
				const origin = new Vector2(position[i], position[i + 1])
				curShape.push({
					origin,
					startAngle: new Vector2().subVectors(p2, origin).angle(),
					endAngle: new Vector2().subVectors(p3, origin).angle(),
					startPosition: p2,
					endPosition: p3,
				})
			}
		}
		this.position = curShape
	}

  /* 创建路径 */
	crtSubpath(ctx: CanvasRenderingContext2D) {
    const { position,distance,closePath } = this
		for (let ele of position) {
			if (ele instanceof Vector2) {
				ctx.lineTo(ele.x, ele.y)
			} else {
				const {
					origin: { x, y },
					startAngle,
					endAngle,
				} = ele
				ctx.arc(x, y, distance, startAngle, endAngle)
			}
		}
		closePath && ctx.closePath()
    return this;
  }

	// 应用矩阵
	applyMatrix3(matrix: Matrix3) {
		const { target } = this
		target.applyMatrix3(matrix)
		this.updatePosition()
    return this
	}

	// 包围盒
	computeBoundingBox() {
		const {
			position,
			distance,
			boundingBox: { min, max },
		} = this
		min.set(Infinity)
		max.set(-Infinity)
		for (let i = 0, len = position.length; i < len; i++) {
			const curShape = position[i]
			if (curShape instanceof Vector2) {
				this.expand(curShape)
			} else {
				const { origin, startAngle, endAngle, startPosition, endPosition } =
					curShape
				this.expand(startPosition)
				this.expand(endPosition)
				const arc = new Arc2(origin.x, origin.y, distance, startAngle, endAngle)
				angles.forEach((angle) => {
					if (arc.isAngleInRange(angle)) {
						const s = Math.sin(angle)
						const c = Math.cos(angle)
						const p = new Vector2(distance * c, distance * s).add(origin)
						this.expand(p)
					}
				})
			}
		}
    return this
	}

	// 扩展
	expand({ x, y }: Vector2) {
		const {
			boundingBox: { min, max },
		} = this
		if (min.x > x) {
			min.x = x
		} else if (max.x < x) {
			max.x = x
		}
		if (min.y > y) {
			min.y = y
		} else if (max.y < y) {
			max.y = y
		}
	}

  // 克隆
	clone() {
		return new PolyExtendGeometry().copy(this)
	}

  // 拷贝
	copy(polyExtendGeometry: PolyExtendGeometry) {
    const { target, distance,boundingBox:{min,max}}=polyExtendGeometry
		this.target.copy(target)
		this.distance = distance;
    this.updatePosition()
    this.boundingBox={
      min:min.clone(),
      max:max.clone(),
    }
		return this
	}
}

export { PolyExtendGeometry }