import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';
import UserForm from './pages/users/UserForm';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="users/:id/edit" element={<UserForm />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
