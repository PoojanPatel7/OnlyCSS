import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import OnboardingModal from './OnboardingModal';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <OnboardingModal />
      <main className="flex-grow flex flex-col pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
