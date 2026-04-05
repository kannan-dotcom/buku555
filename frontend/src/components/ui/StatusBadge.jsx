import Badge from './Badge'
import { getStatusColor, getStatusLabel } from '../../lib/utils'

export default function StatusBadge({ status }) {
  return (
    <Badge variant={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  )
}
