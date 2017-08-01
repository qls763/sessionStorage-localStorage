# sessionStorage-localStorage
使用 sessionStorage 保存通过ajax加载的数据和加载时间，并保存滚动位置,
返回页面：先通过sessionStorage 获取数据并判断时间，超时 通过服务端获取数据，滚动到保存的位置
刷新页面: 先通过sessionStorage 获取数据并判断时间，超时 通过服务端获取数据,滚动到保存的位置

