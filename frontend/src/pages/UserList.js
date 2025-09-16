import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <div className="table-container">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">Users</h3>
      </div>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No users found. Add a new user to get started.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="font-medium">{user.name}</div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/edit-user/${user.id}`} className="action-link edit-link">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="action-link delete-link"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
