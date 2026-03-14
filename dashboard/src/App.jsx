import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FailureSimulation from './pages/FailureSimulation.jsx'
import GraphAnalysis from './pages/GraphAnalysis.jsx'
import RepositoryAnalysis from './pages/RepositoryAnalysis.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"         element={<Dashboard />}           />
          <Route path="/graph"    element={<GraphAnalysis />}        />
          <Route path="/repos"    element={<RepositoryAnalysis />}   />
          <Route path="/simulate" element={<FailureSimulation />}    />
          <Route path="/settings" element={<Settings />}             />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
