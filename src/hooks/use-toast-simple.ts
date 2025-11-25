import { toast as sonnerToast } from 'sonner'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'success' }: ToastProps) => {
    switch (variant) {
      case 'destructive':
        sonnerToast.error(title, {
          description,
          style: {
            background: 'var(--danger)',
            color: 'white',
            border: '1px solid var(--danger)',
          },
        })
        break
      case 'warning':
        sonnerToast.warning(title, {
          description,
          style: {
            background: 'var(--warning)',
            color: 'white',
            border: '1px solid var(--warning)',
          },
        })
        break
      case 'info':
        sonnerToast.info(title, {
          description,
          style: {
            background: 'var(--info)',
            color: 'white',
            border: '1px solid var(--info)',
          },
        })
        break
      case 'success':
      default:
        sonnerToast.success(title, {
          description,
          style: {
            background: 'var(--success)',
            color: 'white',
            border: '1px solid var(--success)',
          },
        })
        break
    }
  }

  return { toast }
} 