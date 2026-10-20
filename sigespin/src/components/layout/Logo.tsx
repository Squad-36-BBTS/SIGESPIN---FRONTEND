import type { ImgHTMLAttributes } from 'react'
import logo from '../../assets/logo.png'

export interface LogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  alt?: string
}

export default function Logo({
  className = 'h-full w-auto object-contain',
  alt = 'Logo SIGES-PIN · BBTS',
  ...props
}: LogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`object-contain select-none ${className}`.trim()}
      draggable={false}
      {...props}
    />
  )
}