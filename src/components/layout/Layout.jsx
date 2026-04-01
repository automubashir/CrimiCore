import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout({ onLogout }) {
  return (
    <div className="layout">
      <Header onLogout={onLogout} />
      <div className="main">
        <Outlet />
      </div>
    </div>
  );
}
