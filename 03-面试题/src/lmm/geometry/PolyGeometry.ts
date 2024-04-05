import { Matrix3 } from '../math/Matrix3'
import { Segment2 } from '../math/Segment2'
import { Vector2 } from '../math/Vector2'
import { Geometry } from './Geometry'

type TraverseCallback = (data: Vector2, ind: number) => void | boolean

class PolyGeometry extends Geometry {
  // 法线集合
	normals: number[]=[]
  readonly type = 'PolyGeometry'

	constructor(position: number[] = []) {
		super()
		this.position = position
	}

  // 创建路径
	crtPath(ctx: CanvasRenderingContext2D) {
		ctx.beginPath()
		this.crtSubpath(ctx)
    return this
	}

  // 创建子路径
  crtSubpath(ctx: CanvasRenderingContext2D) {
		const { position, closePath } = this
		const { length } = position
		if (length < 4) {return this}
		ctx.moveTo(position[0], position[1])
		for (let i = 2; i < length; i += 2) {
			ctx.lineTo(position[i], position[i + 1])
		}
		closePath && ctx.closePath()
    return this
	}

	// 为顶点应用矩阵
	applyMatrix3(matrix: Matrix3) {
		const { position } = this
		for (let i = 0, len = position.length; i < len; i += 2) {
			const { x, y } = new Vector2(position[i], position[i + 1]).applyMatrix3(
				matrix
			)
			position[i] = x
			position[i + 1] = y
		}
    return this
	}

	// 包围盒
	computeBoundingBox() {
		const {
			position,
			boundingBox: { min, max },
		} = this
		min.set(position[0], position[1])
		max.copy(min)
		for (let i = 2, len = position.length; i < len; i += 2) {
			const [x, y] = [position[i], position[i + 1]]
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
		return this
	}

  // 克隆
	clone() {
		return new PolyGeometry().copy(this)
	}

  // 拷贝
	copy(polyGeometry: PolyGeometry) {
    const {position,normals,boundingBox:{min,max}}=polyGeometry
		this.position = [...position]
		this.normals = [...normals]
    this.boundingBox={
      min:min.clone(),
      max:max.clone(),
    }
		return this
	}

	// 逐线段计算法线
	computeSegmentNormal() {
		const { position, normals } = this
		normals.length = 0
		for (let i = 0, len = position.length; i < len; i += 2) {
			const j = (i + 2) % len
			const { x, y } = new Segment2(
				new Vector2(position[i], position[i + 1]),
				new Vector2(position[j], position[j + 1])
			).normal()
			normals.push(x, y)
		}
    return this
	}

	// 遍历顶点
	traverse(
		callback: TraverseCallback,
		start = 0,
		end = this.position.length / 2
	) {
		const { position } = this
		const len = end * 2
		for (start; start < len; start++) {
			const i = start / 2
			const point = new Vector2(position[i], position[i + 1])
			if (callback(point, start) === false) {
				break
			}
		}
	}
}
export { PolyGeometry }
