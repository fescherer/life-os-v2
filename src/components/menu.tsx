import {
  ArrowRightFromLine,
  ClipboardList,
  House,
  Images,
  PiggyBank,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

const basePath = '/life-os'

export function Menu() {
  return (
    <div className="bg-base-200 border-base-300 my-2 ml-2 flex flex-col gap-4 rounded border p-2 shadow">
      <Link href={`${basePath}/settings`} className="btn drawer-button p-2">
        <Settings />
      </Link>

      <div className="drawer flex flex-1 flex-col justify-between">
        <input id="menu-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content">
          <label
            htmlFor="menu-drawer"
            className="btn drawer-button p-2"
            title="Toggle Menu"
          >
            <ArrowRightFromLine />
          </label>
        </div>

        <div className="flex flex-col gap-4">
          <Link href={basePath} className="btn drawer-button p-2" title="Home">
            <House />
          </Link>
          <Link
            href={`${basePath}/finance`}
            className="btn drawer-button p-2"
            title="Finance"
          >
            <PiggyBank />
          </Link>
          <Link
            href={`${basePath}/organization`}
            className="btn drawer-button p-2"
            title="Organization"
          >
            <ClipboardList />
          </Link>
          <Link
            href={`${basePath}/collections`}
            className="btn drawer-button p-2"
            title="Collections"
          >
            <Images />
          </Link>
        </div>

        <div>
          <Link
            href={`${basePath}/settings`}
            className="btn drawer-button p-2"
            title="Settings"
          >
            <Settings />
          </Link>
        </div>

        <div className="drawer-side">
          <label
            htmlFor="menu-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          />
          <ul className="menu bg-base-200 min-h-full w-80 p-4">
            <li>
              <a>Sidebar Item 1</a>
            </li>
            <li>
              <a>Sidebar Item 2</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
