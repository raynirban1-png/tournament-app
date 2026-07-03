// Builds a standard UPI deep link. Any UPI app (GPay, PhonePe, Paytm, etc.)
// can scan/open this and pre-fill the payee, amount and note — no backend
// or payment gateway account required.
export function buildUpiLink({ amount, note } = {}) {
  const pa = import.meta.env.VITE_UPI_ID
  const pn = import.meta.env.VITE_UPI_PAYEE_NAME || 'Tournament'

  if (!pa) return null

  const params = new URLSearchParams({ pa, pn, cu: 'INR' })
  if (amount) params.set('am', Number(amount).toFixed(2))
  if (note) params.set('tn', note)

  return `upi://pay?${params.toString()}`
}
