import { Line2 } from "../math/Line2";
import { Vector2 } from "../math/Vector2";
import { PolyGeometry } from "./PolyGeometry";

type R2Type = number | 'auto'

const PI = Math.PI
const PI2 = PI * 2

class NStarGeometry extends PolyGeometry{
  // 角数
  count:number=5
  // 外圆半径
	r1:number=300
  // 内圆半径
	r2: R2Type='auto'
  // 是否逆时针绘图
  counterclockwise:boolean=false
  // 闭合路径
	closePath = true

  constructor(r1?:number,r2?:R2Type,count?:number,counterclockwise?:boolean){
    super()
    for(let i=0,len=arguments.length;i<len;i++){
      this[['r1','r2','count','counterclockwise'][i]]=arguments[i]
    }
    this.updatePosition()
  }

  /* 计算相邻的两个内角顶点共线的内圆半径 */
	autoR2() {
		const { r1, count } = this
		if (count < 5) {
			return r1 / 3
		}
		const space = PI2 / count
		const [A, B, C, D] = [0, 2, 1, 3].map((n) => {
			const ang = space * n
			return new Vector2(Math.cos(ang) * r1, Math.sin(ang) * r1)
		})
		const intersection = new Line2(A, B).intersect(new Line2(C, D))
		if (intersection) {
			return intersection.length()
		}
		return 0
	}

	// 更新点位
	updatePosition() {
		this.r2 === 'auto' && (this.r2 = this.autoR2())
		const { r1, r2, count,counterclockwise } = this
    const dir=counterclockwise?-1:1
		const space = PI2 / count*dir
		const halfSpace = PI / count*dir
		const position: number[] = []
		for (let i = 0; i < count; i++) {
			const ang1 = space * i
			const ang2 = ang1 + halfSpace
			position.push(
				Math.cos(ang1) * r1,
				Math.sin(ang1) * r1,
				Math.cos(ang2) * r2,
				Math.sin(ang2) * r2
			)
		}
		this.position = position
	}

  // 克隆
	clone() {
		return new NStarGeometry().copy(this)
	}

  // 拷贝
  copy(nStarGeometry:NStarGeometry){
    const {r1,r2,count,counterclockwise}=nStarGeometry
    super.copy(nStarGeometry)
    this.r1=r1
    this.r2=r2
    this.count=count
    this.counterclockwise=counterclockwise
    return this
  }
}
export {NStarGeometry}