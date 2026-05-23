import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthProvider';
import {
  HomePage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  SearchPage,
  BookDetailPage,
} from './pages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
