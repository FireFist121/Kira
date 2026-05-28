import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ available }) {
  return (
    <>
      <Navbar available={available} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
