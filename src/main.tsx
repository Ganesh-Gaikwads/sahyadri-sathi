import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import TrekDetail from './TrekDetail.tsx'
import MyTreks from './MyTreks.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/trek/:id" element={<TrekDetail />} />
        <Route path="/my-treks" element={<MyTreks />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)