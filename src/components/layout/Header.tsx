import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Menu, 
  X, 
  User, 
  Heart, 
  Plus, 
  LogOut,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-accent">
              <span className="text-primary">Properti</span> Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/jual" 
              className="text-neutral-700 hover:text-primary transition-colors font-medium"
            >
              Beli
            </Link>
            <Link 
              to="/sewa" 
              className="text-neutral-700 hover:text-primary transition-colors font-medium"
            >
              Sewa
            </Link>
            <Link 
              to="/premium/features" 
              className="text-neutral-700 hover:text-primary transition-colors font-medium"
            >
              Premium
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/user/favorites"
                  className="p-2 text-neutral-600 hover:text-primary transition-colors"
                  title="My Favorites"
                >
                  <Heart size={20} />
                </Link>
                <Link
                  to="/dashboard/listings/new"
                  className="btn-primary flex items-center text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Pasang Iklan
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {user.full_name}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        to="/user/dashboard"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/user/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/user/favorites"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Favorites
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-neutral-700 hover:text-primary transition-colors font-medium"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-neutral-600 hover:text-primary transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <nav className="space-y-2">
              <Link 
                to="/jual" 
                className="block py-2 text-neutral-700 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beli
              </Link>
              <Link 
                to="/sewa" 
                className="block py-2 text-neutral-700 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sewa
              </Link>
              <Link 
                to="/premium/features" 
                className="block py-2 text-neutral-700 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Premium
              </Link>
              
              {isAuthenticated && user ? (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/user/dashboard"
                    className="block py-2 text-neutral-700 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/user/favorites"
                    className="block py-2 text-neutral-700 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/dashboard/listings/new"
                    className="block py-2 text-primary font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    + Pasang Iklan
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/login"
                    className="block py-2 text-neutral-700 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 text-primary font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;