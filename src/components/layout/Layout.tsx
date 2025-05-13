
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  
  // Only add padding to non-home pages since home page has a full-height hero section
  const isHomePage = location.pathname === "/";
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 ${isHomePage ? '' : 'pt-24'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
