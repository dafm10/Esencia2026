type Status = 'pending' | 'approved' | 'rejected'

export default function StatusBadge({ status }: { status: Status }) {
    const styles = {
        pending: 'bg-amber-100 text-amber-700 border border-amber-200',
        approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border border-red-200',
    }

    const labels = {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
    }

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
            {labels[status]}
        </span>
    )
}