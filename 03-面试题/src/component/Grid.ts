import { Vector2 } from '../lmm/math/Vector2'
import { Graph2D } from '../lmm/objects/Graph2D'
import { GeometryGroup } from '../lmm/geometry/GeometryGroup'
import { StandStyle } from '../lmm/style/StandStyle'
import { PolyGeometry } from '../lmm/geometry/PolyGeometry'

class Grid extends Graph2D<GeometryGroup,StandStyle> {
	size:Vector2
	ranks:Vector2
  offset:Vector2
  geometry: GeometryGroup=new GeometryGroup()

	constructor(size=new Vector2(400, 400),ranks=new Vector2(10, 10),offset=new Vector2()) {
		super()
    this.size=size
    this.ranks=ranks
    this.offset=offset
    this.updated()
	}

	/* 单元格尺寸 */
	get checkSize() {
		return this.size.clone().divide(this.ranks)
	}

	/* 更新几何体 */
	updated() {
		const {
			size: { width, height },
			ranks,
			offset,
			checkSize: { x: checkWidth, y: checkHeight },
      geometry
		} = this
		const [colNum, rowNum] = [ranks.x + 1, ranks.y + 1]
		for (let y = 0; y < rowNum; y++) {
			const py = y * checkHeight+offset.y
      geometry.add(new PolyGeometry([0, py,width, py]))
		}
		for (let x = 0; x < colNum; x++) {
			const px = x * checkWidth+offset.x
      geometry.add(new PolyGeometry([px, 0,px, height]))
		}
	}
}

export { Grid }
