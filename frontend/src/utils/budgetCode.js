export function generateBudgetCode(department) {
  const deptCode = department?.slice(0, 3).toUpperCase() || "GEN"
  const year = new Date().getFullYear()
  const random = String(Math.floor(Math.random() * 9000) + 1000)
  return `${deptCode}-${year}-${random}`
}