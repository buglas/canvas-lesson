function randChar(
	length: number,
	characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
) {
	const arr = characters.split('')
	let result = ''
	while (result.length < length)
		result += arr[Math.round(Math.random() * arr.length)]
	return result
}
export { randChar }
