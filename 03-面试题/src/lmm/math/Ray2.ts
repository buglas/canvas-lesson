import { Arc2 } from './Arc2.js'
import { Line2 } from './Line2.js'
import { Matrix3 } from './Matrix3.js'
import { Segment2 } from './Segment2.js'
import { Vector2 } from './Vector2.js'

const _vector =  new Vector2()

class Ray2 {
	constructor(
		public origin = new Vector2(),
		public direction = new Vector2(1, 0)
	) {}

	set(origin: Vector2, direction: Vector2) {
		this.origin.copy(origin)
		this.direction.copy(direction)

		return this
	}

	// 获取射线上距离origin为t的点位，t为有向距离
	at(t: number, target: Vector2 = new Vector2()) {
		return target.copy(this.direction).multiplyScalar(t).add(this.origin)
	}

	// 看向某点
	lookAt(v: Vector2) {
		this.direction.copy(v).sub(this.origin).normalize()
		return this
	}

	// 在当前射线上将origin 滑动到t的位置
	slide(t: number) {
		this.origin.add(this.direction.clone().multiplyScalar(t))
		return this
	}
  
  // 点投影在射线上的有向距离
  projectDistance(point: Vector2){
    return _vector
    .subVectors(point, this.origin)
    .dot(this.direction)
  }

	// point在射线上的投影
	projectByPoint(point: Vector2, target: Vector2 = new Vector2()) {
		// point 投影在射线上的有向距离
		const distance = this.projectDistance(point)

		// distance 小于等于0时，point无法投影到射线上
		if (distance < 0) {
			return null
		}

		return this.at(distance, target)
	}

	// 射线到点的距离
	distanceToPoint(point: Vector2) {
		return Math.sqrt(this.distanceSqToPoint(point))
	}

	// 射线到点的距离的平方
	distanceSqToPoint(point: Vector2) {
		const directionDistance = _vector
			.subVectors(point, this.origin)
			.dot(this.direction)

		// point behind the ray
		if (directionDistance < 0) {
			return this.origin.distanceToSquared(point)
		}

		return this.at(directionDistance).distanceToSquared(point)
	}

	// 射线与直线的交点，Vector2|null
	intersectLine(line: Line2) {
		const { origin, direction } = this
    /* 射线所在直线与线段所在直线有交点 */
		const interPoint = new Line2(
			origin,
			_vector.addVectors(origin, direction)
		).intersect(line)

		/* 没有交点 */
		if (!interPoint) {
			return null
		}
		/* 有交点 */
		// 交点是否在射线上
		const inRay = interPoint.clone().sub(origin).dot(direction) >= 0
    
		if (!inRay) {
			return null
		}
		return interPoint
	}

	// 射线与线段正面的交点，Vector2|null
	intersectSegment(seg: Segment2) {
		const { direction } = this

		/*射线是否从背面穿过有向线段 */
		if (seg.vector().cross(direction) < 0) {
			return null
		}

		/* 射线与线段的交点 */
		const interPoint = this.intersectLine(seg)
    
		if (!interPoint) {
			return null
		}
		// 判断交点是否在线段中
		const seglen = seg.lengthSq()
		if (interPoint.distanceToSquared(seg.start) <= seglen && interPoint.distanceToSquared(seg.end)<=seglen) {
			return interPoint
		}
		return null
	}

	/* 射线在圆弧正面上的交点 */
	intersectArc(arc: Arc2) {
		const {origin, direction } = this
		const { x, y, r,counterclockwise} = arc

		/* 圆心 */
		const O = new Vector2(x, y)

    /* 射线源点是否在圆内 */
    const isInCircle=new Vector2().subVectors(origin,O).length()<r

    /* 当射线源点在圆内 */
    if(isInCircle){
      if(counterclockwise){
        // 圆心在射线所处的直线上的投影，即垂足
        const F=this.at(this.projectDistance(O))
        // 通过三角函数算出垂足到交点的距离平方
        const bSq = _vector.subVectors(F, O).lengthSq()
        // 射线与圆的交点
        const intersection= new Ray2(F,direction.clone()).at(Math.sqrt(r*r-bSq))
        // 交点在圆弧之上
        if(arc.isPointInRange(intersection)){
          return intersection
        }else{
          return null
        }
      }else{
        return null
      }
    }
    
    /* 当射线源不在圆内 */
		/* 圆心在射线上的投影，可能有垂足，可能没有 */
		const F = this.projectByPoint(O)
    /* 若射线背离圆弧，无垂足 */
		if (!F) {
			return null
		}

		/* 垂足到圆心的距离 */
		const bSq = _vector.subVectors(F, O).lengthSq()
    /* 半径的平方 */
    const rSq=r*r

		/* 相离 */
		if (bSq > rSq) {
			return null
		}

		/* 相切 */
		if (bSq === rSq ) {
      if(arc.isPointInRange(F)){
        return F
      }else{
        return null
      }
		}

		/* 相交 */
		/* 勾股定理求直角边-垂足到交点的距离 */
		const d = Math.sqrt(rSq-bSq)
    
    /* 以垂足为原点，与当前射线同向的射线 */
    const FRay=new Ray2(F, direction.clone())
    /* 直线与圆相交时有2个交点 */
    const A=FRay.at(d)
    const B=FRay.at(-d)

		/* 
    射线与圆弧的有效交点只有1或0个，它需要满足以下条件：
      1.射线从圆弧正面射入
      2.交点在圆弧之上
    按照上面的两个条件，过滤交点。任意一点满足条件，便可以直接返回此点。
    */
		return this.isIntersectionInArcFront(A,arc)||this.isIntersectionInArcFront(B,arc)
	}

  /* 判断交点是否在圆弧正面上 */
  isIntersectionInArcFront(intersection:Vector2,arc: Arc2){
    // 交点是否在圆弧之上
    if(!arc.isPointInRange(intersection)){
      return null
    }
    const { direction } = this
		const { counterclockwise } = arc
		const o = new Vector2(arc.x, arc.y)
    const m=counterclockwise?-1:1;

    // 通过点积判断射线是否从圆弧的正面射入
		const n=new Vector2().subVectors(o, intersection).dot(direction)
		if (n*m > 0 ) {
			return intersection
		}
		return null
  }

	// 射线的反弹
	reflect(p: Vector2, n: Vector2) {
		const { origin, direction } = this
		origin.copy(p)
		this.direction.subVectors(
			direction,
			n.clone().multiplyScalar(2 * n.dot(direction))
		)
	}

	// 求等
	equals(ray: Ray2) {
		return (
			ray.origin.equals(this.origin) && ray.direction.equals(this.direction)
		)
	}

	// 翻转方向
	invert() {
		this.direction.multiplyScalar(-1)
		return this
	}

  /* 矩阵变换 */
  applyMatrix3(matrix:Matrix3){
    const {origin,direction}=this
    direction.add(origin)
    origin.applyMatrix3(matrix)
    direction.applyMatrix3(matrix).sub(origin).normalize()
    return this;
  }

  /* 斜截式: y=kx+b，或者x=ky+b */
  getSlopeIntercept(type:'x'|'y'='y'){
    const { origin, direction } = this
    const [m,n]=type==='y'?['y','x']:['x','y'];
    const k=direction[m]/direction[n]
    const b = origin[m] - k * origin[n]
    return function (arg: number) {
      return k * arg + b
    }
  }

  /* 克隆 */
	clone() {
		return new Ray2().copy(this)
	}

  /* 拷贝 */
	copy(ray: Ray2) {
		this.origin.copy(ray.origin)
		this.direction.copy(ray.direction)
		return this
	}
}

export { Ray2 }