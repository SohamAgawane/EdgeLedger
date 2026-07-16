import { cn } from '../../utils/cn'

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function Select({ options, placeholder, className, ...rest }: Props) {
  return (
    <select
      className={cn('input-base appearance-none cursor-pointer', className)}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
