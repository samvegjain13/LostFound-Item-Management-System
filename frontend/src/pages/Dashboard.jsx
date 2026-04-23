import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getItems, addItem, updateItem, deleteItem, searchItems } from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactInfo: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access the dashboard');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getItems();
      setItems(data);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        handleLogout();
      } else {
        toast.error('Failed to fetch items');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Search items
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      fetchItems();
      return;
    }
    try {
      const { data } = await searchItems(query);
      setItems(data);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  // Filter items by type
  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true;
    return item.type === filter;
  });

  // Stats
  const totalItems = items.length;
  const lostCount = items.filter(i => i.type === 'Lost').length;
  const foundCount = items.filter(i => i.type === 'Found').length;

  // Open modal for Add/Edit
  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      itemName: '',
      description: '',
      type: 'Lost',
      location: '',
      date: new Date().toISOString().split('T')[0],
      contactInfo: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      contactInfo: item.contactInfo
    });
    setShowModal(true);
  };

  // Handle form submission (Add/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingItem) {
        await updateItem(editingItem._id, formData);
        toast.success('Item updated successfully!');
      } else {
        await addItem(formData);
        toast.success('Item added successfully!');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteItem(id);
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed';
      toast.error(msg);
    }
  };

  // Logout: clear token & redirect
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">🔍</div>
            <span>Lost & Found</span>
          </div>
          <div className="navbar-actions">
            <div className="navbar-user">
              <div className="navbar-user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{user.name || 'User'}</span>
            </div>
            <button className="btn btn-logout btn-sm" onClick={handleLogout}>
              ↪ Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard page-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <span>Dashboard</span>
          </h1>
          <p className="dashboard-subtitle">
            Manage lost and found items on campus
          </p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon total">📦</div>
            <div>
              <div className="stat-value">{totalItems}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon lost">🔴</div>
            <div>
              <div className="stat-value">{lostCount}</div>
              <div className="stat-label">Lost Items</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon found">🟢</div>
            <div>
              <div className="stat-value">{foundCount}</div>
              <div className="stat-label">Found Items</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search items by name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="filter-btns">
            {['All', 'Lost', 'Found'].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" onClick={openAddModal}>
            + Report Item
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">No items found</h3>
            <p className="empty-state-text">
              {searchQuery
                ? 'Try a different search query'
                : 'Click "Report Item" to add the first entry'}
            </p>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item, index) => (
              <div
                key={item._id}
                className={`item-card ${item.type.toLowerCase()}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="item-card-header">
                  <span className={`item-badge ${item.type.toLowerCase()}`}>
                    {item.type === 'Lost' ? '🔴' : '🟢'} {item.type}
                  </span>
                  {/* Show edit/delete only for own items */}
                  {item.user && (item.user._id === user._id || item.user === user._id) && (
                    <div className="item-actions">
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="item-name">{item.itemName}</h3>
                <p className="item-description">{item.description}</p>

                <div className="item-meta">
                  <div className="item-meta-row">
                    <span className="icon">📍</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="item-meta-row">
                    <span className="icon">📅</span>
                    <span>{(() => {
                      try {
                        const d = new Date(item.date);
                        if (isNaN(d.getTime())) return item.date;
                        return d.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC'
                        });
                      } catch { return item.date; }
                    })()}</span>
                  </div>
                  <div className="item-meta-row">
                    <span className="icon">📞</span>
                    <span>{item.contactInfo}</span>
                  </div>
                  {item.user && item.user.name && (
                    <div className="item-meta-row">
                      <span className="icon">👤</span>
                      <span>Reported by {item.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingItem ? '✏️ Edit Item' : '➕ Report New Item'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-itemName">Item Name</label>
                <input
                  id="modal-itemName"
                  className="form-input"
                  type="text"
                  name="itemName"
                  placeholder="e.g. Blue Backpack"
                  value={formData.itemName}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-description">Description</label>
                <textarea
                  id="modal-description"
                  className="form-textarea"
                  name="description"
                  placeholder="Describe the item in detail..."
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-type">Type</label>
                <select
                  id="modal-type"
                  className="form-select"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-location">Location</label>
                <input
                  id="modal-location"
                  className="form-input"
                  type="text"
                  name="location"
                  placeholder="e.g. Library, Building A"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-date">Date</label>
                <input
                  id="modal-date"
                  className="form-input"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-contactInfo">Contact Info</label>
                <input
                  id="modal-contactInfo"
                  className="form-input"
                  type="text"
                  name="contactInfo"
                  placeholder="Phone or email"
                  value={formData.contactInfo}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? (
                    <><div className="spinner"></div> Saving...</>
                  ) : editingItem ? (
                    'Update Item'
                  ) : (
                    'Add Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
