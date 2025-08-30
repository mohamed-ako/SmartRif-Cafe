import React, { useState, useEffect } from 'react';
import API from '../../api';
import "../../styles.css";

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startNumber, setStartNumber] = useState('');
  const [endNumber, setEndNumber] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/tables');
      setTables(response.data);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTables = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setFormMessage('');

    const start = parseInt(startNumber, 10);
    const end = parseInt(endNumber, 10);

    if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
      setFormMessage('Please enter a valid number range.');
      setIsAdding(false);
      return;
    }

    try {
      const response = await API.post('/admin/tables/add-range', {
        startTable: start,
        endTable: end,
      });
      setFormMessage(response.data.message);
      setStartNumber('');
      setEndNumber('');
      fetchData();
    } catch (err) {
      console.error('Error adding tables:', err);
      setFormMessage(err.response?.data?.error || 'Failed to add tables. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTable = async (tableNumber) => {
    if (window.confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
      try {
        const response = await API.delete(`/admin/tables/${tableNumber}`);
        setFormMessage(response.data.message || `Table ${tableNumber} deleted successfully.`);
        fetchData();
      } catch (err) {
        console.error('Error deleting table:', err);
        setFormMessage(err.response?.data?.error || 'Failed to delete table. It might be busy or have associated data.');
      }
    }
  };

  return (
    <div className="tables-management-container">
      <h2>Table Management</h2>
      <div className="add-tables-section">
        <h3>Add New Tables</h3>
        <form onSubmit={handleAddTables}>
          <div className="form-group">
            <label htmlFor="startNumber">From:</label>
            <input
              type="number"
              id="startNumber"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              disabled={isAdding}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endNumber">To:</label>
            <input
              type="number"
              id="endNumber"
              value={endNumber}
              onChange={(e) => setEndNumber(e.target.value)}
              disabled={isAdding}
              required
            />
          </div>
          <button type="submit" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Tables'}
          </button>
        </form>
        {formMessage && <p className="status-message">{formMessage}</p>}
      </div>

      <div className="show-tables-section">
        <h3>Current Tables</h3>
        {loading ? (
          <p>Loading tables...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : tables.length > 0 ? (
          <ul className="tables-list">
            {tables.map((table) => (
              <li key={table.table_number} className={`table-item ${table.status}`}>
                <span>Table {table.table_number}</span>
                <span className="table-status">{table.status}</span>
                <button
                  onClick={() => handleDeleteTable(table.table_number)}
                  className="delete-button"
                  disabled={table.status === 'busy'}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tables have been added yet.</p>
        )}
      </div>
    </div>
  );
}