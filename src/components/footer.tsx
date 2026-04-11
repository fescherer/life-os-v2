export function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="p-4 text-center">
      <p>© {year} Felipe Scherer. All rights reserved.</p>
    </div>
  )
}
