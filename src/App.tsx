import { Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EntrenoPage } from './pages/EntrenoPage';
import { HistorialPage } from './pages/HistorialPage';
import { GuiaPage } from './pages/GuiaPage';
import { AjustesPage } from './pages/AjustesPage';

function NoEncontrado(): JSX.Element {
  return (
    <>
      <h1 className="page-title">No encontrado</h1>
      <p className="muted">
        Esta pantalla no existe. <Link to="/">Volver al entreno</Link>
      </p>
    </>
  );
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<EntrenoPage />} />
        <Route path="historial" element={<HistorialPage />} />
        <Route path="guia" element={<GuiaPage />} />
        <Route path="ajustes" element={<AjustesPage />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
