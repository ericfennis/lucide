import { useState } from 'react'
import './Menu.scss'

interface MenuProps {
  page: string
  setPage: (page:string) => void
}

const menuItems = ['icons', 'tools','info']

const Menu = ({page, setPage = (page) => {}}: MenuProps) => {
  return (
    <nav className="menu">
      {  menuItems.map((menuItem) => (
        <div
          key={menuItem}
          className={`menu-item ${page === menuItem ? 'active' : null }`}
          onClick={() => setPage(menuItem)}
        >
          {menuItem}
        </div>
      )) }
    </nav>
  )
}

export default Menu
