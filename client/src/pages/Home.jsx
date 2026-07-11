import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Home() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          📋 TaskFlow
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A powerful Trello-style task management platform for teams and individuals.
          Organize, track, and collaborate on your projects efficiently.
        </p>
        <div className="flex gap-4 justify-center">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold">Kanban Board</h3>
            <p className="text-sm text-gray-500">Visualize your workflow with drag & drop</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-semibold">Team Collaboration</h3>
            <p className="text-sm text-gray-500">Assign tasks and work together</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-4xl mb-2">📎</div>
            <h3 className="font-semibold">File Attachments</h3>
            <p className="text-sm text-gray-500">Upload and manage files easily</p>
          </div>
        </div>
      </div>
    </div>
  );
}