// utils/tree.js
export function buildCommentTree(flatComments) {
  const map = new Map();
  const roots = [];

  // 1. 把所有评论放入 Map，并初始化 children 数组
  flatComments.forEach(comment => {
    // 假设后端传过来的 ID 是大写 ID 或小写 id，统一处理
    comment.children = [];
    map.set(comment.ID, comment);
  });

  // 2. 遍历组装树结构
  flatComments.forEach(comment => {
    // 解析 Path，例如 "1/5/12/"
    // 去掉空字符串后变成 ['1', '5', '12']
    const pathParts = comment.path.split('/').filter(p => p !== '');

    // 如果长度大于 1，说明它有父节点（比如上面的父节点是 5）
    if (pathParts.length > 1) {
      const parentId = parseInt(pathParts[pathParts.length - 2]);
      const parent = map.get(parentId);
      if (parent) {
        parent.children.push(comment);
      } else {
        roots.push(comment); // 如果找不到父节点（可能是脏数据），作为根节点兜底
      }
    } else {
      // 长度为 1（例如 "1/"），说明是顶级评论
      roots.push(comment);
    }
  });

  return roots;
}
