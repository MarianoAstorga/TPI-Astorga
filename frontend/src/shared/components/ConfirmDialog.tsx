import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { MensajeError } from './EstadoError'

interface ConfirmDialogProps {
  open: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  peligroso?: boolean
  cargando?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligroso = false,
  cargando = false,
  error = null,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={titulo} onClose={onClose}>
      <p className="text-sm text-stone-600">{mensaje}</p>
      <div className="mt-3">
        <MensajeError mensaje={error} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={cargando}>
          Volver
        </Button>
        <Button variant={peligroso ? 'danger' : 'primary'} onClick={onConfirm} loading={cargando}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
