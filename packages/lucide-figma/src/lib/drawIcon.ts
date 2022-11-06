type InsertableNodes = FrameNode | GroupNode

function isInsertableNode (node: SceneNode): node is InsertableNodes {
  return ['FRAME', 'GROUP'].includes(node.type)
}

const drawIcon = ({ icon: { name, svg, size }}: any) => {
  const min = 0
  const max = 100
  const randomPosition = () => Math.floor(Math.random() * (max - min + 1) + min)

  const icon = figma.createNodeFromSvg(svg)
  icon.setPluginData('isLucideIcon', 'true')
  icon.setPluginData('iconName', name)

  // const pluginData = icon.getPluginData('isLucideIcon')

  icon.name = name
  icon.x = Math.round(figma.viewport.center.x + randomPosition())
  icon.y = Math.round(figma.viewport.center.y + randomPosition())

  if(figma.currentPage.selection.length) {
    let currentSelection = figma.currentPage.selection[0]
    const isLucideIcon = currentSelection.getPluginData('isLucideIcon')

    // if(isLucideIcon && currentSelection?.parent) {
    //   return
    //   // currentSelection = currentSelection.parent as SceneNode
    // }

    if(!isLucideIcon && isInsertableNode(currentSelection)) {
      icon.x = currentSelection.type === 'GROUP' ? currentSelection.x : 0
      icon.y = currentSelection.type === 'GROUP' ? currentSelection.y : 0

      currentSelection.appendChild(icon)
    }
  }

  figma.currentPage.selection = [icon]

  // lock children
  // icon.children.forEach((vectorNode, key) => {
  //   icon.children[key].locked = true
  // });
}

export default drawIcon
