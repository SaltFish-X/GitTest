/**
 * @description 生成瀑布流
 * @param {String} parantNode 父元素名
 * @param {Array} items 图片数组
 */
function waterfall (parantNode, items) {
  var MIN_COLUMN_COUNT = 2
  var COLUMN_WIDTH = 200
  var COLUMN_PADDING = 15
  var GAP_HEGIHT = 10
  var GAP_WIDTH = 10

  var photo = [] //防止
  var contained = document.querySelector(parantNode)
  var column = parseInt(getComputedStyle(contained).width / (COLUMN_WIDTH + COLUMN_PADDING))
  
  for (var i = 0; i < items.length; i++) {
    if (i < column) {
      // 排列第一行
      photo[i] = { top: '0px', left: (COLUMN_WIDTH + COLUMN_PADDING) * i + 'px', }
    } else {
      // 非第一行找到最低高度
    }
  }
}