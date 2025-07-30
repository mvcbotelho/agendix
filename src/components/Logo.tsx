import { Image, ImageProps } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/react'

import logoMain from '@/assets/images/logo/logo.png'
import logoDark from '@/assets/images/logo/logo-dark.png'
import logoIcon from '@/assets/images/logo/logo-icon.png'

interface LogoProps extends Omit<ImageProps, 'src'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  variant?: 'full' | 'icon'
}

export function Logo({ size = 'md', variant = 'full', ...props }: LogoProps) {
  const sizes = {
    sm: { width: "120px" },
    md: { width: "180px" },
    lg: { width: "240px" },
    xl: { width: "300px" },
    xxl: { width: "360px" },
  }
  
  const logoColor = useColorModeValue(logoMain, logoDark)
  const logoSrc = variant === 'icon' ? logoIcon : logoColor

  return (
    <Image
      src={logoSrc}
      alt="Agendix Logo"
      {...sizes[size]}
      objectFit="contain"
      {...props}
    />
  )
}

export function LogoSmall(props: Omit<LogoProps, 'size'>) {
  return <Logo size="sm" {...props} />
}

export function LogoMedium(props: Omit<LogoProps, 'size'>) {
  return <Logo size="md" {...props} />
}

export function LogoLarge(props: Omit<LogoProps, 'size'>) {
  return <Logo size="lg" {...props} />
}

export function LogoXLarge(props: Omit<LogoProps, 'size'>) {
  return <Logo size="xl" {...props} />
}

export function LogoXXLarge(props: Omit<LogoProps, 'size'>) {
  return <Logo size="xxl" {...props} />
}

export function LogoIcon(props: Omit<LogoProps, 'size' | 'variant'>) {
  return <Logo size="sm" variant="icon" {...props} />
} 