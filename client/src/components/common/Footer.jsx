import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/about" className="text-sm text-gray-500 hover:text-gray-700">About</Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}