import { Vector2 } from '../lmm/math/Vector2'
import { Group } from '../lmm/objects/Group'
import { RectGeometry } from '../lmm/geometry/RectGeometry'
import { TextGraph2D } from '../lmm/objects/TextGraph2D'
import {Graph2D} from '../lmm/objects/Graph2D'
import { StandStyle } from '../lmm/style/StandStyle'
import { TextStyle } from '../lmm/style/TextStyle'

type LatticeType = {
	text?: string | number
	latticeColor?: string
	position?: Vector2
	latticeSize?: Vector2
	fontSize?: number
	textColor?: string
}

class Lattice extends Group {
	latticeSize = new Vector2(1)
  latticeColor = '#333'
	text: string | number = ''
	fontSize = 0.3
	textColor = '#fff'

	size = new Vector2(1)
	constructor(attr: LatticeType = {}) {
		super()
		this.setOption(attr)
		this.update()
	}

	setOption(attr: LatticeType) {
		Object.assign(this, attr)
	}

	update() {
    const {size,latticeColor,text,fontSize}=this
		const halfSize = this.size.clone().multiplyScalar(0.5)
    this.add(
      new Graph2D(
        new RectGeometry(0,0,size.x,size.y),
        new StandStyle({
          fillStyle:latticeColor
        })
      ),
			new TextGraph2D(
        String(text),
        halfSize,
        new TextStyle({
          fontSize,
					textAlign: 'center',
					textBaseline: 'middle',
					fillStyle: this.textColor,
        })
      )
		)
	}
}
export { Lattice }
