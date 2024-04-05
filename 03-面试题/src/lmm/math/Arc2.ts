import { Vector2 } from './Vector2'
import {formatRadian} from './MathUtils'

const PI2 = Math.PI * 2

class Arc2 {
	constructor(
		public x: number = 0,
		public y: number = 0,
		public r: number = 100,
		public startAngle: number = 0,
		public endAngle: number = PI2,
		public counterclockwise: boolean = false
	) {}

  // 顶点到圆心的方向是否在圆弧范围内
	isPointInRange(p: Vector2) {
		const { x, y } = this
		const ang = new Vector2(p.x - x, p.y - y).angle()
		return this.isAngleInRange(ang)
	}

  // 弧度是否在圆弧范围内
  isAngleInRange(ang:number){
    const { counterclockwise } = this
    const startAngle = formatRadian(this.startAngle)
		const endAngle = formatRadian(this.endAngle)
    if (counterclockwise) {
			if (startAngle < endAngle) {
				if (ang <= startAngle || ang >= endAngle) {
					return true
				}
			} else {
				if (ang >= endAngle && ang <= startAngle) {
					return true
				}
			}
		} else {
			if (startAngle < endAngle) {
				if (ang >= startAngle && ang <= endAngle) {
					return true
				}
			} else {
				if (ang <= endAngle || ang >= startAngle) {
					return true
				}
			}
		}
		return false
  }
}

export { Arc2 }
