import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QrCode({ value, size = 180 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(
      canvasRef.current,
      value,
      { width: size, margin: 1, color: { dark: '#123D29', light: '#F6F5F0' } },
      (err) => {
        if (err) console.error('QR render failed', err)
      }
    )
  }, [value, size])

  if (!value) {
    return <div className="qr-placeholder">Add a UPI ID in .env to show a QR code</div>
  }

  return <canvas ref={canvasRef} className="qr-canvas" width={size} height={size} />
}
