export function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="text-center p-4">
      <p>© {year} Felipe Scherer. All rights reserved.</p>
    </div>
  )
}
