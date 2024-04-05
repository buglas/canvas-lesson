import { Line2 } from './Line2'
import { Vector2 } from './Vector2'

const _v = new Vector2()

/* 此线段是有方向概念的，所以就有了法线、正反面等概念。*/
class Segment2 extends Line2{
  // 类型
	readonly Line2 = true

  /* 线段长度 */
  length() {
		return this.vector().length()
	}

	/* 线段长度的平方 */
	lengthSq() {
		return this.vector().lengthSq()
	}

  /* 方向：单位向量 */
	direction() {
		return this.vector().normalize()
	}

  /* 向量：end-start */
	vector() {
		const { start, end } = this
		return new Vector2(end.x - start.x, end.y - start.y)
	}

  /* 线段与线段交点 */
	intersect(seg: Segment2):Vector2|null {
    const {start,end}=this
    // 线段相连
    if(start.equals(seg.end)){
      return start.clone()
    }
    if(end.equals(seg.start)){
      return end.clone()
    }
    // 线段不相连
    return super.intersect(seg,(p:Vector2)=>{
      if (this.isPointIn(p) && seg.isPointIn(p)) {
        return p
      }
      return null
    })
	}

  /* 法线 */
	normal() {
		const { start, end } = this
		const { x, y } = end.clone().sub(start)
		return new Vector2(y, -x).normalize()
	}

  /* 线段所在的直线上一点是否在线段上 */
	isPointIn(p: Vector2) {
		const { start, end } = this
		const len = _v.subVectors(end, start).lengthSq()
		const ls = _v.subVectors(p, start).lengthSq()
		const le = _v.subVectors(p, end).lengthSq()
		if (ls <= len && le <= len) {
			return true
		}
		return false
	}
}

export { Segment2 }
