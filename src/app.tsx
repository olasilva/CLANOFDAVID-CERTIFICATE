import { useEffect, useState } from 'react';
import StudentFormPage from './pages/StudentFormPage';
import AdminPage from './pages/AdminPage';
import schoolLogo from '../img/IMG-20260531-WA0013 - Copy.jpg';

type Page = 'home' | 'form' | 'admin';

const getPageFromLocation = (): Page => {
  const path = window.location.pathname.toLowerCase();

  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/form')) return 'form';
  return 'home';
};

export default function App() {
  const [page, setPage] = useState<Page>(() => getPageFromLocation());

  const navigate = (nextPage: string) => {
    const safePage = nextPage as Page;
    const target = safePage === 'admin' ? '/admin' : safePage === 'form' ? '/form' : '/';

    window.history.pushState({}, '', target);
    setPage(safePage);
  };

  useEffect(() => {
    const onPopState = () => setPage(getPageFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (page === 'form') {
    return <StudentFormPage onNavigate={navigate} />;
  }

  if (page === 'admin') {
    return <AdminPage onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src={schoolLogo} alt="Clan of David logo" className="w-16 h-16 object-cover rounded-full border border-gray-200 bg-white" />
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.28em] text-blue-600 font-semibold">School</p>
            <h1 className="text-2xl font-black text-gray-900">Clan of David</h1>
          </div>
        </div>
        <p className="text-gray-600 mb-8">
          Open the student form or the admin dashboard to manage submissions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('form')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Student Form
          </button>
          <button
            onClick={() => navigate('admin')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
