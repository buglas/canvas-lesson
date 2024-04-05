import { Vector2 } from './Vector2'

type IntersectCallback=(data:Vector2)=>Vector2|null

class Line2 {
  // 起点
	start = new Vector2()
  // 终点
	end = new Vector2()
  // 类型
	readonly Line2 = true

	constructor(start?:Vector2, end?:Vector2) {
		start&&(this.start = start)
		end&&(this.end = end)
	}

	set(start: Vector2, end: Vector2) {
		this.start.copy(start)
		this.end.copy(end)
		return this
	}

	// 直线一般式：Ax+By+C=0，返回A、B、C
	ABC() {
		const { start, end } = this
		const [dx, dy] = [end.x - start.x, end.y - start.y]
		const [A, B] = [dy, -dx]
		return [A, B, -(A * start.x + B * start.y)]
	}

	// 与另一条直线的交点
	intersect(line: Line2,callback:IntersectCallback=(p:Vector2)=>p):Vector2|null  {
		const [A1, B1, C1, A2, B2, C2] = [...this.ABC(), ...line.ABC()]
		const sub = A1 * B2 - A2 * B1
		if (sub) {
      const p = new Vector2(
				(B1 * C2 - C1 * B2) / sub,
				(A2 * C1 - A1 * C2) / sub
			)
			// 相交，默认返回交点p，可以自定义过滤函数，过滤交点
      return callback(p)
		} else {
			// 平行
			return null
		}
	}
}

export { Line2 }