import { renderToString } from "react-dom/server"
import createIconComponent from "../helpers/createIconComponent"
import { Icon } from "../hooks/useSearch"

interface ToolsProps {
  icons: Icon[]
}

const Tools = ({ icons: iconNodes }: ToolsProps) => {
  const generateComponents = () => {
    const icons = iconNodes.map(([iconName, iconNode]) => {
      const Icon = createIconComponent(iconName, iconNode)
      return {
        name: iconName,
        svg: renderToString(<Icon color='#000' />),
        size: 24,
      }
    })

    parent.postMessage({
      pluginMessage: {
        type: "generateIconComponents",
        icons,
      }
    }, "*")
  }

  return (
    <main>
      <section>
        <h3>
          Create icon component page
        </h3>
        <p>
          Create a page of Lucide icons components, this page can be updates and your icons you used through the project will be updated.
        </p>
        <button className="button contained" onClick={generateComponents}>
          Create or update components
        </button>
      </section>

    </main>
  )
}

export default Tools
