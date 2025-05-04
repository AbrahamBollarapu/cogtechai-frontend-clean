import { useState } from 'react';
import axios from 'axios';

export default function InviteUserForm() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/admin/invite-user', { email, fullName, role });
      setMessage('Invitation sent successfully');
    } catch (error) {
      setMessage('Error sending invitation');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Invite New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="fullName" className="block">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="role" className="block">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send Invitation</button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
