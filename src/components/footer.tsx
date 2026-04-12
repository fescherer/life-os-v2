export function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="bg-base-200 border-base-300 mt-2 border p-4 text-center shadow">
      <p>© {year} Felipe Scherer. All rights reserved.</p>
    </div>
  )
}
