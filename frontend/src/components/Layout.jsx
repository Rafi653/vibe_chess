import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  return (
    <>
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

export default Layout;
