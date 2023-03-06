import { PluginMessage } from "../types"

const generateIconComponents = (pluginMessage: PluginMessage) => {
  if(pluginMessage.type !== 'generateIconComponents') {
    return
  }

  const { icons } = pluginMessage

  const document = figma.root
  const pages = document.children
  let lucidePage = pages.find(page => page.getPluginData('isLucideComponentPage'))


  if(lucidePage == null) {
    lucidePage = figma.createPage()
    lucidePage.name = 'Lucide icons'
    lucidePage.setPluginData('isLucideComponentPage', 'true')
  }

  figma.currentPage = lucidePage

  const components = lucidePage.children
      .filter((node): node is ComponentNode =>
        Boolean(node.getPluginData('isLucideIconComponent'))
        && node.type === 'COMPONENT'
      )

  const iconNodes = icons.map(({ name, svg }, index) => {
    const itemsPerRow = 24;
    const padding = 8
    const numInRow = index % itemsPerRow;
    const column = numInRow + 1;
    const row = (index - numInRow) / itemsPerRow + 1;

    const icon = figma.createNodeFromSvg(svg)

    icon.name = name
    icon.x = column * 24 - 24 + (padding * column)
    icon.y = row * 24 - 24 + (padding * row)

    return icon
  })

  const iconComponents = iconNodes.map(iconNode => {
    let component: ComponentNode | undefined = components.find((component) => component.name === iconNode.name)

    if (component == null) {
      component = figma.createComponent()
    }

    component.name = iconNode.name
    component.resizeWithoutConstraints(iconNode.width, iconNode.height)
    component.x = iconNode.x
    component.y = iconNode.y
    component.setPluginData('isLucideIconComponent', 'true')

    for (const oldChild of component.children) {
      oldChild.remove()
    }

    // TODO: Make sure color is still applied.

    for (const child of iconNode.children) {
      component.appendChild(child)
    }

    iconNode.remove()

    return component
  })

  figma.currentPage.selection = iconComponents
}

export default generateIconComponents
