export type RGBType={
  r:number
  g:number
  b:number
}
export type HSLType={
  h:number
  s:number
  l:number
}

export type ColorSpaceType='srgb'|'srgb-linear'
export const SRGBColorSpace:ColorSpaceType = 'srgb';
export const LinearSRGBColorSpace:ColorSpaceType = 'srgb-linear';