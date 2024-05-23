import { BoundingBox, Geometry } from '../geometry/Geometry'
import { PolyExtendGeometry, ShapeElementType } from '../geometry/PolyExtendGeometry'
import { PolyGeometry } from '../geometry/PolyGeometry'
import { Arc2 } from '../math/Arc2'
import { Ray2 } from '../math/Ray2'
import { Segment2 } from '../math/Segment2'
import { Vector2 } from '../math/Vector2'
import { Graph2D } from '../objects/Graph2D'
import { StandStyle } from '../style/StandStyle'
import { BVH } from './BVH'

/* 相交物体的类型，当前只有PolyExtend类型，后续可扩展。 */
type ObjectForIntersect = Graph2D<Geometry,StandStyle>

/* 相交的数据 */
export type IntersectData = {
	// 射线原点到交点的距离
	distance: number
	// 交点
	point: Vector2
	// 相交的物体
	object: ObjectForIntersect
	// 交点处的法线
	normal: Vector2
}

/* 求交的结果 */
type IntersectResult = IntersectData | null

/* 图形类型 */
type Path = Segment2 | Arc2

/* 最近交点数据的类型 */
type NearestDataCom = {
	// 距离
	distance: number
	// 点位
	point: Vector2 | null
}
type NearestData1 = NearestDataCom&{
	// 相交的元素
	path: Segment2 | Arc2 | null
}
type NearestData2 = NearestDataCom&{
	// 相交的元素
	path: Segment2 | null
}

/* 不同的物体会有不同的求交方式 
ray 默认其处于世界坐标系中
*/
const intersectLib = {
  PolyGeometry:(ray: Ray2, object:Graph2D<PolyGeometry,StandStyle>): IntersectResult => {
		const { geometry:{position} } = object
		let len = position.length
		// 最近的交点数据
		const nearestData: NearestData2 = {
			distance: Infinity,
			point: null,
			path: null,
		}

		/* 遍历PolyExtend图形中的线段 */
    for(let i=0;i<len;i+=2){
      const j=(i+2)%len
      let curPath = new Segment2(
        new Vector2(position[i],position[i+1]),
        new Vector2(position[j],position[j+1])
      )
			let curPoint = ray.intersectSegment(curPath)
			updateNearestData(nearestData, ray, curPoint, curPath)
    }
		const { distance, point, path } = nearestData
		if (point && path) {
			// 法线
			return {
				distance,
				point,
				object,
				normal:path.normal(),
			}
		}
		return null
	},
	PolyExtendGeometry: (ray: Ray2, object:Graph2D<PolyExtendGeometry,StandStyle>) => {
    const {geometry:{position,distance:extendDistance}}=object
		let len = position.length

		// 最近的交点数据
		const nearestData: NearestData1 = {
      // 距离
			distance: Infinity,
      // 交点
			point: null,
      // 交点所在的路径
			path: null,
		}

		/* 遍历PolyExtend图形中的线段和圆弧 */
		for (let i = 0; i < len; i++) {
			let curPoint: Vector2 | null = null
			let curPath: Segment2 | Arc2

			// 当前图形，顶点或圆弧
			const ele1 = position[i] 
			// 下一个图形，顶点或圆弧
			const ele2 = position[(i + 1) % len]

			if (!(ele1 instanceof Vector2)) {
				/* 圆弧求交 */
				const {
					origin: { x, y },
					startAngle,
					endAngle,
				} = ele1
				curPath = new Arc2(x, y, extendDistance, startAngle, endAngle)
				curPoint = ray.intersectArc(curPath)
				updateNearestData(nearestData, ray, curPoint, curPath)
			}

			/* 线段求交 */
			curPath = new Segment2(getPos1(ele1), getPos2(ele2))
			curPoint = ray.intersectSegment(curPath)
			updateNearestData(nearestData, ray, curPoint, curPath)
		}

		const { distance, point, path } = nearestData
		if (point && path) {
			// 法线
			let normal =
				path instanceof Arc2
					? new Vector2()
							.subVectors(point, new Vector2(path.x, path.y))
							.normalize()
					: path.normal()
			return {
				distance,
				point,
				object,
				normal,
			}
		}
		return null
	},
}

/* 更新最近的交点数据 */
function updateNearestData(
	nearestData: NearestData1,
	ray: Ray2,
	curPoint: Vector2 | null,
	curPath: Path | null
) {
	if (curPoint) {
		// 取最近的交点
		const curDistance = new Vector2().subVectors(curPoint, ray.origin).length()
		if (curDistance < nearestData.distance) {
			nearestData.distance = curDistance
			nearestData.path = curPath
			nearestData.point = curPoint
		}
	}
}

/* 射线与包围盒的相交 */
function intersectBoundingBox(ray: Ray2, boundingBox: BoundingBox) {
	const {
		origin: O,
		origin: { x: ox, y: oy },
		direction: v,
		direction: { x: vx, y: vy },
	} = ray
	const {
		min: { x: minX, y: minY },
		max: { x: maxX, y: maxY },
	} = boundingBox
	if (vy === 0) {
		const b1 = oy > minY && oy < maxY
		const b2 =
			new Vector2(minX - ox, 0).dot(v) > 0 ||
			new Vector2(maxX - ox, 0).dot(v) > 0
    return b1 && b2
	} else if (vx === 0) {
		const b1 = ox > minX && ox < maxX
		const b2 =
			new Vector2(0, minY - oy).dot(v) > 0 ||
			new Vector2(0, maxY - oy).dot(v) > 0
      return b1 && b2
	} else {
		// 因变量为y的斜截式
		const interceptY = ray.getSlopeIntercept('y')
		// 因变量为x的斜截式
		const interceptX =ray.getSlopeIntercept('x')

		// 射线与包围盒的四条边所在的直线的4个交点减O
    const OA1 = new Vector2(interceptX(minY), minY).sub(O)
		const OA2 = new Vector2(interceptX(maxY), maxY).sub(O)
		const OB1 = new Vector2(minX, interceptY(minX)).sub(O)
		const OB2 = new Vector2(maxX, interceptY(maxX)).sub(O)
		// OA1、OA2 中的极小值Amin和极大值Amax
		const [Amin, Amax] = [OA1.dot(v), OA2.dot(v)].sort((a, b) =>
			a > b ? 1 : -1
		)
		// OB1、OB2 中的极小值Bmin和极大值Bmax
		const [Bmin, Bmax] = [OB1.dot(v), OB2.dot(v)].sort((a, b) =>
			a > b ? 1 : -1
		)
		if (Math.max(Amin, Bmin) < Math.min(Amax, Bmax)) {
			return true
		}
	}
	return false
}



/* 
与单个物体的求交
一条射线可能与一个物体存在多个交点。
此方法返回离射线原点最近的点。  
*/
function intersectObject(
	ray: Ray2,
	object: ObjectForIntersect,
	useBoundingBox: boolean = false
): IntersectResult {
	const { geometry:{boundingBox,type} } = object
  // 先与包围盒进行碰撞检测
	if (useBoundingBox && !intersectBoundingBox(ray, boundingBox)) {
		console.log(object.name,'未碰撞到包围盒')
		return null
	}
  // 再与具体图形做碰撞检测
	if (intersectLib[type]) {
		return intersectLib[type](ray, object)
	}
	return null
}

/* 获取当前点或当前圆弧的endPosition */
function getPos1(ele: ShapeElementType) {
	return ele instanceof Vector2 ? ele : ele.endPosition
}

/* 获取当前点或当前圆弧的startPosition */
function getPos2(ele: ShapeElementType) {
	return ele instanceof Vector2 ? ele : ele.startPosition
}

/* 射线与多个物体的求交 
ray 射线
objects 求交的图形集合
useBoundingBox 是否使用包围盒求交
sort 是否基于交点到射线源点的距离对求交结果排序
*/
function intersectObjects(
	ray: Ray2,
	objects: ObjectForIntersect[],
	useBoundingBox: boolean = false,
  sort:boolean=true
): IntersectData[] | null {
	const arr: IntersectData[] = []
	objects.forEach((obj) => {
		const intersectResult = intersectObject(ray, obj, useBoundingBox)
		intersectResult && arr.push(intersectResult)
	})
	if (arr.length) {
		// 按照相交距离排序
		sort&&arr.sort((a, b) => a.distance - b.distance)
		return arr
	}
	return null
}

/* 射线与BVH包围盒的相交 */
function intersectBVH(ray: Ray2, rootBox: BVH) {
	// 相交数据
	const arr: IntersectData[] = []
  // 遍历BVH层级
	rootBox.traverse(
		(box) => {
			// 若box没有子级，与此box中的图形做求交运算
      if(!box.children.length){ 
        const objects=box.targets.map(target=>target.object)
        const objs=intersectObjects(ray,objects,true,false)
        objs&&arr.push(...objs)
      }
		},
		(box) => intersectBoundingBox(ray, box.boundingBox)
	)
  if (arr.length) {
		// 按照相交距离排序
		arr.sort((a, b) => a.distance - b.distance)
		return arr
	}
	return null
}

export { intersectObject,intersectObjects,intersectBoundingBox,intersectBVH }
