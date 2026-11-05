import { useEffect, useState } from 'react'
import northstarMark from './assets/northstar-mark.svg'
import './BrandMark.css'

function BrandMark({ className = '' }) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setRotation((current) => current + 1)
    }, 5 * 60 * 1000)

    return () => window.clearInterval(timerId)
  }, [])

  return <img key={rotation} className={`${className} rotating-brand-mark`} src={northstarMark} alt="" />
}

export default BrandMark
