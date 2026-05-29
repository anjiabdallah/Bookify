import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './context/ToastProvider';
import {
  HomePage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  SearchPage,
  MyBooksPage,
  YearlyBooksPage,
  BookDetailPage,
  ShelfPage,
} from './pages';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-books" element={<MyBooksPage />} />
            <Route path="/my-books/:status" element={<ShelfPage />} />
            <Route path="/yearly" element={<YearlyBooksPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
