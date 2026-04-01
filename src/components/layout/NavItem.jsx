import { NavLink } from 'react-router-dom';

export default function NavItem({ to, label, icon, end, activeGradient, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
      style={({ isActive }) =>
        isActive ? { '--active-gradient': activeGradient } : undefined
      }
    >
      <span className="nav-item-icon">{icon}</span>
      <span className="nav-item-label">{label}</span>
    </NavLink>
  );
}
