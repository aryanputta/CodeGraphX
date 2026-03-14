import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

async function unwrap(promise) {
  const res = await promise
  if (res.data.error) throw new Error(res.data.error)
  return res.data.data
}

export const fetchRepos         = ()            => unwrap(api.get('/api/repos'))
export const analyzeRepo        = (url, branch) => unwrap(api.post('/api/repos/analyze', { repo_url: url, branch }))
export const fetchGraph         = (repo)        => unwrap(api.get(`/api/graphs/${repo}`))
export const fetchPredictions   = (repo)        => unwrap(api.get(`/api/predictions/${repo}`))
export const fetchTopPredictions= (repo, k=20)  => unwrap(api.get(`/api/predictions/${repo}/top?k=${k}`))
export const fetchCriticalNodes = (repo)        => unwrap(api.get(`/api/cascade/${repo}/critical`))
export const fetchHeatmap       = (repo)        => unwrap(api.get(`/api/risk/${repo}/heatmap`))
export const simulateCascade    = (repo, nodes, model, beta) =>
  unwrap(api.post(`/api/cascade/${repo}/simulate`, { nodes, model, beta }))

export default api
