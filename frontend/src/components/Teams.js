import React, { useState, useEffect } from 'react';
import { teamAPI, employeeAPI } from '../services/api';
import './DataManagement.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    employee_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsResponse, employeesResponse] = await Promise.all([
        teamAPI.getAll(),
        employeeAPI.getAll()
      ]);
      setTeams(teamsResponse.data.data);
      setEmployees(employeesResponse.data.data);
    } catch (error) {
      alert('Error fetching data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamAPI.update(editingTeam.id, formData);
        alert('Team updated successfully!');
      } else {
        await teamAPI.create(formData);
        alert('Team created successfully!');
      }
      setShowForm(false);
      setEditingTeam(null);
      setFormData({ name: '', description: '', employee_ids: [] });
      fetchData();
    } catch (error) {
      alert('Error saving team: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      employee_ids: team.employees?.map(emp => emp.id) || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete team "${name}"?`)) {
      try {
        await teamAPI.delete(id);
        alert('Team deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Error deleting team: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(employeeId)
        ? prev.employee_ids.filter(id => id !== employeeId)
        : [...prev.employee_ids, employeeId]
    }));
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  return (
    <div className="data-management">
      <div className="page-header">
        <h1>Team Management</h1>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingTeam(null);
            setFormData({ name: '', description: '', employee_ids: [] });
            setShowForm(true);
          }}
        >
          Add Team
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{editingTeam ? 'Edit Team' : 'Add New Team'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Team Members</label>
                <div className="checkbox-group">
                  {employees.map(employee => (
                    <label key={employee.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.employee_ids.includes(employee.id)}
                        onChange={() => toggleEmployeeSelection(employee.id)}
                      />
                      {employee.first_name} {employee.last_name} ({employee.email})
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingTeam ? 'Update' : 'Create'} Team
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-grid">
        {teams.length === 0 ? (
          <div className="empty-state">
            <p>No teams found. Create your first team!</p>
          </div>
        ) : (
          <div className="cards-grid">
            {teams.map((team) => (
              <div key={team.id} className="card">
                <div className="card-header">
                  <h3>{team.name}</h3>
                  <div className="card-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(team)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(team.id, team.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <p>{team.description || 'No description'}</p>
                  <div className="team-members">
                    <strong>Members ({team.employees?.length || 0}):</strong>
                    {team.employees?.length > 0 ? (
                      <ul>
                        {team.employees.map(employee => (
                          <li key={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No members assigned</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;