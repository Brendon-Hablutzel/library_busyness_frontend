import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/Home.tsx'
import ErrorPage from './components/ErrorPage.tsx'
import { Metrics } from './components/Metrics.tsx'
import About from './components/About.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    element: <Home />,
  },
  {
    path: '/metrics',
    errorElement: <ErrorPage />,
    element: <Metrics />,
  },
  {
    path: '/about',
    errorElement: <ErrorPage />,
    element: <About />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
