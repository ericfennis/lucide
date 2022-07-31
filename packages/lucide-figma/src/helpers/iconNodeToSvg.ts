import createIconComponent from '../helpers/createIconComponent'
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { IconNode } from "../api/fetchIcons";

const iconNodeToSvg = (iconName: string, iconNode : IconNode) => {
  const IconComponent = createIconComponent(iconName, iconNode)
  return  renderToString(createElement(IconComponent));
}

export default iconNodeToSvg
