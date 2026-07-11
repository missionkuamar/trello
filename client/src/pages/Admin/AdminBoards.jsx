import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBoards, deleteBoard } from '../../redux/slices/boardSlice';
import Loading from '../../components/common/Loading';

export default function AdminBoards() {
  const dispatch = useDispatch();
  const { boards, isLoading } = useSelector((state) => state.boards);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      await dispatch(deleteBoard(id));
    }
  };

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(search.toLowerCase()) ||
    board.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Boards</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search boards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          <Link
            to="/boards/create"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            + Create Board
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoards.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500">No boards found</p>
          </div>
        ) : (
          filteredBoards.map((board) => (
            <div key={board._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
                  <div className="flex gap-2">
                    <Link
                      to={`/board/${board._id}`}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(board._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {board.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Members:</span>
                    <span className="font-medium">{board.members?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {new Date(board.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {board.members?.slice(0, 4).map((member) => (
                      <div
                        key={member._id}
                        className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold border-2 border-white"
                        title={member.user?.name}
                      >
                        {member.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ))}
                    {board.members?.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white">
                        +{board.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {board.members?.length || 0} members
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}