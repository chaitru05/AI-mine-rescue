import { useMine } from '../store/MineContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastContainer() {
  const { state, dispatch } = useMine();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {state.toasts.map(toast => (
          <motion.div
            key={toast.id}
            className={`toast ${toast.type}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            onClick={() => dispatch({ type: 'REMOVE_TOAST', id: toast.id })}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
