import type { LucideIcons } from "./api/fetchIcons";
import filterIcons from "./helpers/filterIcons";
import { Icon } from "./hooks/useSearch";
import drawIcon from "./lib/drawIcon";
import generateIconComponents from "./lib/generateIconComponents";
import { PluginMessage } from "./types";

figma.showUI(__uiFiles__.worker, { visible: false })

let cachedIcons: LucideIcons

const setResults = ({result, query, lucideIcons} : { result: SuggestionResults, query: string, lucideIcons: LucideIcons }) => {
  const icons = Object.entries(lucideIcons.iconNodes);

  const suggestions = filterIcons(icons, lucideIcons.tags, query.toLowerCase()).map(([name]) => ({
    name,
    icon: lucideIcons.svgs[name]
  }))

  result.setSuggestions(suggestions)
}

const getPaintStyles = () => {
  const styles = figma.getLocalPaintStyles();

  const response = { type: 'paintStyles' }

  if(styles) {
    Object.assign(response, { styles })
  }

  figma.ui.postMessage(response)
}

figma.parameters.on('input', async ({ parameters, key, query, result }) => {
  if (key === 'icon-name') {
    cachedIcons = await figma.clientStorage.getAsync(`lucide-icons`)

    if(cachedIcons && cachedIcons.iconNodes && cachedIcons.tags) {
      setResults({result, query, lucideIcons: cachedIcons})
    }
  }
  if(key === 'size') {
    const iconSizes = [24,36,48,72]
    result.setSuggestions(iconSizes.map((size)=>({
      name: size.toString(),
      data: size
    })))
  }
})

const setCachedIcons = async (pluginMessage: PluginMessage) => {
  if(pluginMessage.type === 'setCachedIcons' && pluginMessage.lucideIcons) {
    await figma.clientStorage.setAsync(`lucide-icons`, pluginMessage.lucideIcons)
  }
}

const getCachedIcons = async () => {
  cachedIcons = await figma.clientStorage.getAsync(`lucide-icons`)

  const response = { type: 'cachedIcons' }

  if(cachedIcons) {
    Object.assign(response, { cachedIcons })
  }

  figma.ui.postMessage(response)
}

getCachedIcons()

figma.ui.onmessage = (pluginMessage: PluginMessage) => {
  switch (pluginMessage.type) {
    case "drawIcon":
      drawIcon(pluginMessage)
      break;
    case "getCachedIcons":
      getCachedIcons()
      break;

    case "setCachedIcons":
      setCachedIcons(pluginMessage)
      break;

    case "getPaintStyles":
      getPaintStyles()
      break;

    case "generateIconComponents":
      generateIconComponents(pluginMessage)
      break;

    case "close":
      figma.closePlugin()
      break;

    default:
      break;
  }
}

figma.on('run', event => {
  if(event.parameters) {
    figma.ui.postMessage({
      type: 'getSvg',
      iconName: event.parameters['icon-name'],
      size: event.parameters['size'],
      cachedIcons
    })
  } else {
    figma.showUI(__uiFiles__.interface, { width: 300, height: 400 })
  }
})
