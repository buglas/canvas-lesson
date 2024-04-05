import { SRGBColorSpace, LinearSRGBColorSpace,ColorSpaceType,RGBType } from '../constants.js';
// const SRGBColorSpace = 'srgb';
// const LinearSRGBColorSpace = 'srgb-linear';

// SRGB 转线性, c为r|g|b
export function SRGBToLinear( c:number ) {
	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );
}
// 线性转SRGB
export function LinearToSRGB( c:number ) {
	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}

/* 
JavaScript RGB-to-RGB transforms, defined as
FN[InputColorSpace][OutputColorSpace] callback functions.
{
  "srgb":{"srgb-linear":SRGBToLinear},
  "srgb-linear":{"srgb":SRGBToLinear},
}
*/
const FN = {
  // srgb
	[ SRGBColorSpace ]: { [ LinearSRGBColorSpace ]: SRGBToLinear },
  // srgb-linear
	[ LinearSRGBColorSpace ]: { [ SRGBColorSpace ]: LinearToSRGB },
};

export const ColorManagement = {
  // 传统模式
	legacyMode: true,

  // 颜色空间-线性
	get workingColorSpace() {
		return LinearSRGBColorSpace;
	},

	set workingColorSpace( colorSpace ) {
		console.warn( 'THREE.ColorManagement: .workingColorSpace is readonly.' );

	},

  // 颜色转换
	convert: function ( color:RGBType, sourceColorSpace:ColorSpaceType, targetColorSpace:ColorSpaceType ) {
		if ( this.legacyMode || sourceColorSpace === targetColorSpace || ! sourceColorSpace || ! targetColorSpace ) {
			return color;
		}

		if ( FN[ sourceColorSpace ] && FN[ sourceColorSpace ][ targetColorSpace ] !== undefined ) {
			const fn = FN[ sourceColorSpace ][ targetColorSpace ];
			color.r = fn( color.r );
			color.g = fn( color.g );
			color.b = fn( color.b );
			return color;
		}

		throw new Error( 'Unsupported color space conversion.' );

	},

  // 从颜色中提取某一颜色空间的色值
	fromWorkingColorSpace: function ( color:RGBType, targetColorSpace:ColorSpaceType ) {
		return this.convert( color, this.workingColorSpace, targetColorSpace );
	},

  // 将当前颜色转换成某一颜色空间的色值
	toWorkingColorSpace: function ( color:RGBType, sourceColorSpace:ColorSpaceType ) {
		return this.convert( color, sourceColorSpace, this.workingColorSpace );
	},

};

