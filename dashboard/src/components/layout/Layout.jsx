import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

export default function Layout({ children }) {
  const location = useLocation()
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#07070f' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-60">
        <Header />
        <main className="flex-1 overflow-y-auto pt-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-6 min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
