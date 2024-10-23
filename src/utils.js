import { initialize, svg2png } from 'svg2png-wasm';
import wasm from 'svg2png-wasm/svg2png_wasm_bg.wasm';
import { milestonesvg } from './milestone';

initialize(wasm).catch((error) => {
	console.log('initialize error: ', error)
});

/**
 * 
 * @param {Object} stores
 * @param {string} stores.repo 
 * @param {string} stores.stars
 * @returns 
 */
export async function getMilestonePng(stores) {
	const fontFamily = 'Titan+One'
	const fontData = await loadFont(fontFamily);

	const svg = milestonesvg(formatToK(stores.stars), stores.repo)

	const options = {
		fonts: await Promise.all([new Uint8Array(fontData)]),
		defaultFontFamily: {
			sansSerifFamily: fontFamily,
			serifFamily: fontFamily,
			cursiveFamily: fontFamily,
			fantasyFamily: fontFamily,
			monospaceFamily: fontFamily,
		},
	};

	const buf = svg2png(svg, options);
	return buf;
}

/**
 * 加载字体数据
 * @param {string} fontFamily
 * @returns 
 */
export async function loadFont(fontFamily) {
	const fontResponse = await fetch(
		`https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400&display=swap`
	);
	const css = await fontResponse.text();

	// 从 CSS 中提取字体 URL
	const fontUrl = css.match(/url\((.*?)\)/)[1];

	// 获取字体文件数据
	const fontData = await fetch(fontUrl).then(res => res.arrayBuffer());
	return fontData;
}

function formatToK(number) {
  if (number < 1000) return number;
  
  // 将数字除以 1000 并保留一位小数
  const k = Math.round(number / 100) / 10;
  
  return `${k}k`;
}