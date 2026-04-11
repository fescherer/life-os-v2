export function Menu() {
  return (

    <div>
      <nav>
        <div className="navbar bg-base-300">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl normal-case">Life OS</a>
          </div>
        </div>
      </nav>

      <div className="drawer">
        <input id="menu-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="menu-drawer" className="btn drawer-button">Open drawer</label>
        </div>
        <div className="drawer-side">
          <label htmlFor="menu-drawer" aria-label="close sidebar" className="drawer-overlay" />
          <ul className="menu bg-base-200 min-h-full w-80 p-4">
            <li><a>Sidebar Item 1</a></li>
            <li><a>Sidebar Item 2</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
