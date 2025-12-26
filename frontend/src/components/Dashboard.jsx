import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API_BASE_URL from '../config';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [users, setUsers] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAddTableForm, setShowAddTableForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'appetizer', image: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [newTable, setNewTable] = useState({ number: '', capacity: '' });
  const [showEditTableForm, setShowEditTableForm] = useState(false);
  const [editTable, setEditTable] = useState({ _id: '', number: '', capacity: '' });
  const [showEditMenuForm, setShowEditMenuForm] = useState(false);
  const [editMenu, setEditMenu] = useState({ _id: '', name: '', description: '', price: '', category: 'appetizer', image: '' });
  const [selectedTable, setSelectedTable] = useState('');
  const [menuCategory, setMenuCategory] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [customerTab, setCustomerTab] = useState('menu');
  const [customerOrderFilter, setCustomerOrderFilter] = useState('all');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showAddReview, setShowAddReview] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [unrepliedReviews, setUnrepliedReviews] = useState({});
  const [analyticsFilter, setAnalyticsFilter] = useState('today');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topItems: [],
    salesData: []
  });

  useEffect(() => {
    if (user) {
      fetchMenu();
      fetchTables();
      if (user.role !== 'customer') {
        fetchOrders();
        if (['admin', 'manager'].includes(user.role)) {
          fetchUsers();
        }
      } else {
        fetchOrders(); // For customer orders
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && ['admin', 'manager'].includes(user.role) && activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [analyticsFilter, activeTab, user]);

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/menu`);
      setMenu(res.data);
      // Check unreplied reviews after menu is loaded
      if (user && ['admin', 'manager'].includes(user.role)) {
        checkUnrepliedReviewsForMenu(res.data);
      }
    } catch (error) {
      toast.error('Failed to fetch menu');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tables`);
      setTables(res.data);
    } catch (error) {
      toast.error('Failed to fetch tables');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.menuItem === item._id);
    if (existing) {
      setCart(cart.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuItem: item._id, quantity: 1, name: item.name, price: item.price }]);
    }
    toast.success('Added to cart');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.menuItem !== id));
  };

  const updateCartQuantity = (id, change) => {
    setCart(cart.map(c => {
      if (c.menuItem === id) {
        const newQuantity = c.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...c, quantity: newQuantity };
      }
      return c;
    }).filter(c => c !== null));
  };

  const placeOrder = async () => {
    try {
      const items = cart.map(c => ({ menuItem: c.menuItem, quantity: c.quantity }));
      await axios.post(`${API_BASE_URL}/api/orders`, { items, table: selectedTable || null });
      setCart([]);
      setShowCart(false);
      setSelectedTable('');
      toast.success('Order placed');
      fetchOrders();
      fetchTables();
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/menu`, newItem);
      toast.success('Menu item added');
      setNewItem({ name: '', description: '', price: '', category: 'appetizer', image: '' });
      setShowAddForm(false);
      fetchMenu();
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/menu/${id}`);
      toast.success('Menu item deleted');
      fetchMenu();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const validateUserName = (value) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!value.trim()) return 'Name is required';
    if (!nameRegex.test(value)) return 'Name must contain only letters';
    return '';
  };

  const validateUserEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!value.trim()) return 'Email is required';
    if (!emailRegex.test(value)) return 'Email must end with @gmail.com';
    return '';
  };

  const validateUserPassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length !== 8) return 'Password must be exactly 8 characters';
    return '';
  };

  const validateUserPhone = (value) => {
    const phoneRegex = /^03\d{9}$/;
    if (!value.trim()) return 'Phone is required';
    if (!phoneRegex.test(value)) return 'Phone must start with 03 and be 11 digits';
    return '';
  };

  const formatUserPhoneDisplay = (value) => {
    if (value.length <= 4) return value;
    return `${value.slice(0, 4)}-${value.slice(4)}`;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validateUserName(newUser.name),
      email: validateUserEmail(newUser.email),
      password: validateUserPassword(newUser.password),
      phone: validateUserPhone(newUser.phone)
    };
    
    setUserFormErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      toast.error('Please fix all validation errors');
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/api/users`, newUser);
      toast.success('User added');
      setNewUser({ name: '', email: '', password: '', role: 'customer', phone: '' });
      setUserFormErrors({});
      setShowAddUserForm(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to add user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
      if (error.response?.status === 404) {
        fetchUsers(); // Refresh the list if user not found
      }
    }
  };

  const handleDeleteTable = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tables/${id}`);
      toast.success('Table deleted');
      fetchTables();
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/tables`, { number: newTable.number, capacity: newTable.capacity });
      toast.success('Table added');
      setNewTable({ number: '', capacity: '' });
      setShowAddTableForm(false);
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add table');
    }
  };

  const handleEditTable = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/tables/${editTable._id}`, { number: editTable.number, capacity: editTable.capacity });
      toast.success('Table updated');
      setEditTable({ _id: '', number: '', capacity: '' });
      setShowEditTableForm(false);
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update table');
    }
  };

  const handleEditMenu = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/menu/${editMenu._id}`, editMenu);
      toast.success('Menu item updated');
      setEditMenu({ _id: '', name: '', description: '', price: '', category: 'appetizer', image: '' });
      setShowEditMenuForm(false);
      fetchMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update menu item');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/orders/${id}`);
      toast.success('Order cancelled');
      fetchOrders();
      fetchTables();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const assignStaff = async (orderId, role, staffId) => {
    if (!staffId) return;
    try {
      const data = { [role === 'chef' ? 'assignedChef' : 'assignedWaiter']: staffId };
      if (role === 'chef') {
        data.status = 'preparing';
      }
      await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, data);
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} assigned`);
      fetchOrders();
    } catch (error) {
      toast.error(`Failed to assign ${role}`);
    }
  };

  const fetchReviews = async (menuId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reviews/menu/${menuId}`);
      setReviews(res.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    }
  };

  const checkUnrepliedReviews = async () => {
    try {
      const unrepliedCount = {};
      for (const item of menu) {
        const res = await axios.get(`${API_BASE_URL}/api/reviews/menu/${item._id}`);
        const unreplied = res.data.filter(review => !review.reply).length;
        if (unreplied > 0) {
          unrepliedCount[item._id] = unreplied;
        }
      }
      setUnrepliedReviews(unrepliedCount);
    } catch (error) {
      console.error('Failed to check unreplied reviews');
    }
  };

  const checkUnrepliedReviewsForMenu = async (menuItems) => {
    try {
      const unrepliedCount = {};
      for (const item of menuItems) {
        const res = await axios.get(`${API_BASE_URL}/api/reviews/menu/${item._id}`);
        const unreplied = res.data.filter(review => !review.reply).length;
        if (unreplied > 0) {
          unrepliedCount[item._id] = unreplied;
        }
      }
      setUnrepliedReviews(unrepliedCount);
    } catch (error) {
      console.error('Failed to check unreplied reviews');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/reviews`, {
        menuItem: selectedMenuItem._id,
        rating: newReview.rating,
        comment: newReview.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review added successfully');
      setNewReview({ rating: 5, comment: '' });
      setShowAddReview(false);
      fetchReviews(selectedMenuItem._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Review deleted');
      fetchReviews(selectedMenuItem._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleReplyToReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/reviews/${reviewId}/reply`, {
        reply: replyText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Reply added successfully');
      setReplyText('');
      setReplyingTo(null);
      fetchReviews(selectedMenuItem._id);
      if (['admin', 'manager'].includes(user.role)) {
        checkUnrepliedReviewsForMenu(menu);
      }
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Calculate date range based on filter
      const now = new Date();
      let startDate = new Date();
      
      if (analyticsFilter === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (analyticsFilter === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (analyticsFilter === 'month') {
        startDate.setDate(now.getDate() - 30);
      }
      
      const res = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const filteredOrders = res.data.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && order.status === 'served';
      });
      
      // Calculate metrics
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalOrders = filteredOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calculate top items
      const itemsCount = {};
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          const itemName = item.menuItem?.name || 'Unknown';
          if (itemsCount[itemName]) {
            itemsCount[itemName].count += item.quantity;
            itemsCount[itemName].revenue += (item.menuItem?.price || 0) * item.quantity;
          } else {
            itemsCount[itemName] = {
              name: itemName,
              count: item.quantity,
              revenue: (item.menuItem?.price || 0) * item.quantity
            };
          }
        });
      });
      
      const topItems = Object.values(itemsCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Prepare sales data for chart
      const salesByDate = {};
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        if (salesByDate[date]) {
          salesByDate[date] += order.totalPrice;
        } else {
          salesByDate[date] = order.totalPrice;
        }
      });
      
      const salesData = Object.entries(salesByDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setAnalytics({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        topItems,
        salesData
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const openReviews = (item) => {
    setSelectedMenuItem(item);
    setShowReviews(true);
    fetchReviews(item._id);
  };

  const renderCustomerDashboard = () => (
    <div>
      <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mb-8 p-4 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-lg shadow-inner">
        {['menu', 'orders'].map(tab => (
          <button
            key={tab}
            onClick={() => setCustomerTab(tab)}
            className={`px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-110 ${
              customerTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg animate-pulse'
                : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
            }`}
          >
            {tab === 'menu' ? '🍽️ Menu' : '📋 My Orders'}
          </button>
        ))}
      </div>

      {customerTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Menu</h2>
            <button
              onClick={() => setShowCart(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cart ({cart.length})
            </button>
          </div>
          <div className="mb-4">
            <select value={menuCategory} onChange={(e) => setMenuCategory(e.target.value)} className="border p-2 rounded">
              <option value="all">All Categories</option>
              <option value="appetizer">Appetizer</option>
              <option value="main">Main</option>
              <option value="dessert">Dessert</option>
              <option value="drink">Drink</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.filter(item => menuCategory === 'all' || item.category === menuCategory).map(item => (
              <div key={item._id} className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-orange-200 hover:border-orange-300 relative">
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold capitalize">
                  {item.category}
                </div>
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" onError={(e) => e.target.style.display = 'none'} />
                )}
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.name}</h3>
                <p className="text-gray-600 mb-2 text-sm">{item.description}</p>
                <p className="text-lg font-bold text-green-600 mb-4">${item.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(item)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300 font-semibold"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => openReviews(item)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-300 font-semibold"
                  >
                    ⭐ Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customerTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">📋 My Orders</h2>
          <div className="mb-6">
            <select value={customerOrderFilter} onChange={(e) => setCustomerOrderFilter(e.target.value)} className="border-2 border-gray-300 p-3 rounded-lg text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">📊 All Orders</option>
              <option value="pending">⏳ Pending</option>
              <option value="preparing">👨‍🍳 Preparing</option>
              <option value="ready">✅ Ready</option>
              <option value="served">🍽️ Served</option>
            </select>
          </div>
          <div className="space-y-4">
            {orders.filter(order => customerOrderFilter === 'all' || order.status === customerOrderFilter).map(order => (
              <div key={order._id} className={`p-4 rounded-xl shadow-lg border-2 ${order.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : order.status === 'preparing' ? 'bg-blue-50 border-blue-200' : order.status === 'ready' ? 'bg-green-50 border-green-200' : order.status === 'served' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'} hover:shadow-xl transition-all duration-300`}>
                <p className="text-gray-600">Status: <span className={`font-medium ${order.status === 'pending' ? 'text-yellow-600' : order.status === 'preparing' ? 'text-blue-600' : order.status === 'ready' ? 'text-green-600' : order.status === 'served' ? 'text-purple-600' : 'text-gray-600'}`}>{order.status}</span></p>
                <p className="text-gray-600">Total: ${order.totalPrice}</p>
                <p className="text-gray-600">Placed at: {new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Items: {order.items.map(i => `${i.menuItem?.name || 'Unknown'} x${i.quantity}`).join(', ')}</p>
                <p className="text-gray-600 text-sm">Table: {order.table?.number || 'None'}</p>
                {order.status === 'pending' && (
                  <button onClick={() => handleDeleteOrder(order._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition mt-2">Cancel Order</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cart</h3>
            {cart.length === 0 ? (
              <p>Cart is empty</p>
            ) : (
              <div>
                {cart.map(item => (
                  <div key={item.menuItem} className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateCartQuantity(item.menuItem, -1)} 
                        className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.menuItem, 1)} 
                        className="bg-green-500 text-white w-8 h-8 rounded-full hover:bg-green-600 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                      <span className="font-bold text-green-600 w-16 text-right">${item.price * item.quantity}</span>
                      <button onClick={() => removeFromCart(item.menuItem)} className="text-red-500 hover:text-red-700 ml-2">🗑️</button>
                    </div>
                  </div>
                ))}
                <p className="font-bold mt-4 text-xl text-right">Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</p>
                <div className="mb-4">
                  <label className="block mb-2">Select Table (optional)</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">No table</option>
                    {tables.filter(t => t.status === 'available').map(table => (
                      <option key={table._id} value={table._id}>Table {table.number} (Capacity: {table.capacity})</option>
                    ))}
                  </select>
                </div>
                <button onClick={placeOrder} className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600">
                  Place Order
                </button>
              </div>
            )}
            <button onClick={() => setShowCart(false)} className="w-full bg-gray-500 text-white py-2 rounded mt-2 hover:bg-gray-600">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderReviewModal = () => (
    showReviews && selectedMenuItem && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Reviews for {selectedMenuItem.name}</h3>
            <button onClick={() => setShowReviews(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          
          {user.role === 'customer' && (
            <button 
              onClick={() => setShowAddReview(!showAddReview)} 
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
            >
              {showAddReview ? 'Cancel' : '✍️ Write a Review'}
            </button>
          )}
          
          {showAddReview && (
            <form onSubmit={handleAddReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block mb-2 font-semibold">Rating</label>
              <select 
                value={newReview.rating} 
                onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                className="w-full p-2 border rounded mb-4"
                required
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average)</option>
                <option value={2}>⭐⭐ (2 - Poor)</option>
                <option value={1}>⭐ (1 - Terrible)</option>
              </select>
              
              <label className="block mb-2 font-semibold">Comment</label>
              <textarea 
                value={newReview.comment} 
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full p-2 border rounded mb-4"
                rows="3"
                placeholder="Share your experience..."
                required
              />
              
              <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                Submit Review
              </button>
            </form>
          )}
          
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {user.role === 'customer' ? 'No reviews yet. Be the first to review!' : 'No reviews yet for this item.'}
              </p>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{review.customer?.name || 'Anonymous'}</p>
                      <p className="text-yellow-500">{'⭐'.repeat(review.rating)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      {user.id === review.customer?._id && (
                        <button 
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-500 text-sm hover:text-red-700 mt-1"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  
                  {review.reply && (
                    <div className="ml-6 mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-blue-700 mb-1">
                        💬 Response from {review.repliedBy?.role === 'admin' ? 'Admin' : 'Management'}:
                      </p>
                      <p className="text-gray-700">{review.reply}</p>
                    </div>
                  )}
                  
                  {['admin', 'manager'].includes(user.role) && !review.reply && (
                    <div className="ml-6 mt-2">
                      {replyingTo === review._id ? (
                        <div className="flex gap-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your response..."
                            className="flex-1 p-2 border rounded"
                            rows="2"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleReplyToReview(review._id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Send
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(review._id)}
                          className="text-blue-500 text-sm hover:text-blue-700"
                        >
                          💬 Reply to this review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => setShowReviews(false)} 
            className="w-full bg-gray-500 text-white py-2 rounded mt-4 hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  );

  const renderAdminManagerDashboard = () => (
    <div>
      <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mb-8 p-4 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-lg shadow-inner">
        {['menu', 'orders', 'tables', 'analytics', ...(user.role === 'admin' ? ['users'] : [])].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-110 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg animate-pulse'
                : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === 'menu' && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">🍽️ Menu Management</h3>
            <button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 shadow-lg font-semibold">
              ➕ Add Item
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map(item => (
              <div key={item._id} className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-2xl hover:scale-105 hover:rotate-1 transition-all duration-500 transform hover:border-purple-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-20 -mr-10 -mt-10"></div>
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" onError={(e) => e.target.style.display = 'none'} />
                )}
                <h4 className="font-bold text-gray-800 text-lg mb-2">{item.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <p className="text-2xl font-bold text-green-600 mb-4">${item.price}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setEditMenu(item); setShowEditMenuForm(true); }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 shadow-md text-sm">Edit</button>
                  <button onClick={() => handleDeleteItem(item._id)} className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-md text-sm">Delete</button>
                  <button onClick={() => openReviews(item)} className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-md text-sm">
                    ⭐ Reviews
                    {unrepliedReviews[item._id] && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                        {unrepliedReviews[item._id]}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'analytics' && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Sales Analytics</h3>
          
          {/* Time Filter */}
          <div className="mb-6 flex flex-wrap gap-3">
            {['today', 'week', 'month'].map(filter => (
              <button
                key={filter}
                onClick={() => setAnalyticsFilter(filter)}
                className={`px-4 md:px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  analyticsFilter === filter
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {filter === 'today' ? '📅 Today' : filter === 'week' ? '📆 This Week' : '🗓️ This Month'}
              </button>
            ))}
          </div>
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6 rounded-2xl shadow-lg border-2 border-green-200">
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-2">💰 Total Revenue</p>
              <p className="text-2xl md:text-4xl font-bold text-green-600">${analytics.totalRevenue.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 rounded-2xl shadow-lg border-2 border-blue-200">
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-2">📦 Total Orders</p>
              <p className="text-2xl md:text-4xl font-bold text-blue-600">{analytics.totalOrders}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-6 rounded-2xl shadow-lg border-2 border-purple-200">
              <p className="text-gray-600 text-xs md:text-sm font-semibold mb-2">📈 Average Order</p>
              <p className="text-2xl md:text-4xl font-bold text-purple-600">${analytics.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Sales Chart */}
          {analytics.salesData.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border-2 border-gray-200 mb-8">
              <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4">📊 Sales Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Top Selling Items */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border-2 border-gray-200">
            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4">🏆 Top 5 Best-Selling Items</h4>
            {analytics.topItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sales data available for this period</p>
            ) : (
              <div className="space-y-3">
                {analytics.topItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl md:text-2xl font-bold text-yellow-600">#{index + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">{item.name}</p>
                        <p className="text-xs md:text-sm text-gray-600">{item.count} orders</p>
                      </div>
                    </div>
                    <p className="text-base md:text-lg font-bold text-green-600">${item.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'orders' && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📋 Order Management</h3>
          <div className="mb-6">
            <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="border-2 border-gray-300 p-3 rounded-lg text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">📊 All Orders</option>
              <option value="pending">⏳ Pending</option>
              <option value="preparing">👨‍🍳 Preparing</option>
              <option value="ready">✅ Ready</option>
              <option value="served">🍽️ Served</option>
            </select>
          </div>
          <div className="space-y-6">
            {orders.filter(order => orderFilter === 'all' || order.status === orderFilter).map(order => (
              <div key={order._id} className={`p-6 rounded-2xl shadow-lg border-2 ${order.status === 'pending' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : order.status === 'preparing' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' : order.status === 'ready' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'} hover:shadow-2xl hover:scale-102 transition-all duration-500 transform hover:border-opacity-50 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white to-transparent rounded-full opacity-30 -mr-8 -mt-8"></div>
                <p className="font-bold text-gray-800 text-lg mb-2">👤 Customer: {order.customerName || order.customer?.name || 'Guest Customer'}</p>
                <p className="text-gray-600 mb-2">Status: <span className={`font-semibold text-lg ${order.status === 'pending' ? 'text-yellow-600' : order.status === 'preparing' ? 'text-blue-600' : order.status === 'ready' ? 'text-green-600' : 'text-gray-600'}`}>{order.status}</span></p>
                <p className="text-gray-600 mb-2">Total: <span className="font-bold text-xl text-green-600">${order.totalPrice}</span></p>
                <p className="text-gray-600 mb-2">Placed at: {new Date(order.createdAt).toLocaleString()}</p>
                <p className="text-gray-600 text-sm mb-4">Items: {order.items.map(i => `${i.menuItem?.name || 'Unknown'} x${i.quantity}`).join(', ')}</p>
                <div className="flex flex-wrap gap-3">
                  <select onChange={(e) => assignStaff(order._id, 'waiter', e.target.value)} disabled={order.status === 'served'} className="border p-2 rounded-lg text-sm bg-white shadow-sm hover:shadow-md transition">
                    <option value="">Assign Waiter</option>
                    {users.filter(u => u.role === 'waiter').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                  <select onChange={(e) => assignStaff(order._id, 'chef', e.target.value)} disabled={order.status === 'served'} className="border p-2 rounded-lg text-sm bg-white shadow-sm hover:shadow-md transition">
                    <option value="">Assign Chef</option>
                    {users.filter(u => u.role === 'chef').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'tables' && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">🪑 Table Management</h3>
            <button onClick={() => setShowAddTableForm(true)} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 shadow-lg font-semibold">
              ➕ Add Table
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map(table => (
              <div key={table._id} className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-2xl hover:scale-105 hover:-rotate-1 transition-all duration-500 transform hover:border-teal-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200 to-teal-300 rounded-full opacity-20 -mr-10 -mt-10"></div>
                <p className="font-bold text-gray-800 text-xl mb-2">🍽️ Table {table.number}</p>
                <p className="text-gray-600 mb-2">Capacity: {table.capacity}</p>
                <p className="text-gray-600 mb-4">Status: <span className={`font-semibold text-lg ${table.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>{table.status}</span></p>
                <div className="flex gap-3">
                  <button onClick={() => { setEditTable(table); setShowEditTableForm(true); }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 shadow-md">Edit</button>
                  <button onClick={() => handleDeleteTable(table._id)} className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-md">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'users' && user.role === 'admin' && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">👥 User Management</h3>
            <button onClick={() => setShowAddUserForm(true)} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 shadow-lg font-semibold">
              ➕ Add User
            </button>
          </div>
          <input type="text" placeholder="🔍 Search users by name" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="border-2 border-gray-300 p-3 rounded-lg w-full mb-6 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          <div className="space-y-6">
            {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
              <div key={u._id} className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 p-6 rounded-2xl shadow-lg border-2 border-purple-200 hover:shadow-2xl hover:scale-105 transition-all duration-500 transform hover:border-rose-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-rose-300 rounded-full opacity-20 -mr-10 -mt-10"></div>
                <p className="text-gray-800 text-lg font-semibold mb-2">👤 {u.name} - {u.email}</p>
                <p className="text-gray-600 mb-4">Role: <span className="font-bold capitalize text-purple-600">{u.role}</span></p>
                {u.role !== 'admin' && u._id !== user.id && (
                  <button onClick={() => handleDeleteUser(u._id)} className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 shadow-md">Delete</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Modals for forms */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleAddItem} className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-xl mb-4">Add Menu Item</h3>
            <input type="text" placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full p-2 border mb-2" required />
            <input type="text" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="w-full p-2 border mb-2" />
            <input type="text" placeholder="Image URL (e.g., /images/pizza.jpg)" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} className="w-full p-2 border mb-2" required />
            <p className="text-xs text-gray-500 mb-2">💡 Place images in frontend/public/images/ folder</p>
            <input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="w-full p-2 border mb-2" required />
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="w-full p-2 border mb-4">
              <option value="appetizer">Appetizer</option>
              <option value="main">Main</option>
              <option value="dessert">Dessert</option>
              <option value="drink">Drink</option>
            </select>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
              <button onClick={() => setShowAddForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleAddUser} className="bg-white p-6 rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl mb-4 font-bold">Add User</h3>
            
            <label className="block text-gray-700 mb-1 text-sm">Name</label>
            <input 
              type="text" 
              placeholder="Name (letters only)" 
              value={newUser.name} 
              onChange={(e) => {
                setNewUser({ ...newUser, name: e.target.value });
                setUserFormErrors({ ...userFormErrors, name: validateUserName(e.target.value) });
              }} 
              className={`w-full p-2 border rounded mb-1 ${userFormErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              required 
            />
            {userFormErrors.name && <p className="text-red-500 text-xs mb-2">{userFormErrors.name}</p>}
            
            <label className="block text-gray-700 mb-1 text-sm mt-2">Email</label>
            <input 
              type="email" 
              placeholder="example@gmail.com" 
              value={newUser.email} 
              onChange={(e) => {
                setNewUser({ ...newUser, email: e.target.value });
                setUserFormErrors({ ...userFormErrors, email: validateUserEmail(e.target.value) });
              }} 
              className={`w-full p-2 border rounded mb-1 ${userFormErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              required 
            />
            {userFormErrors.email && <p className="text-red-500 text-xs mb-2">{userFormErrors.email}</p>}
            
            <label className="block text-gray-700 mb-1 text-sm mt-2">Password</label>
            <input 
              type="password" 
              placeholder="Exactly 8 characters" 
              value={newUser.password} 
              onChange={(e) => {
                setNewUser({ ...newUser, password: e.target.value });
                setUserFormErrors({ ...userFormErrors, password: validateUserPassword(e.target.value) });
              }} 
              maxLength={8}
              className={`w-full p-2 border rounded mb-1 ${userFormErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              required 
            />
            <p className="text-xs text-gray-500 mb-1">{newUser.password.length}/8 characters</p>
            {userFormErrors.password && <p className="text-red-500 text-xs mb-2">{userFormErrors.password}</p>}
            
            <label className="block text-gray-700 mb-1 text-sm mt-2">Role</label>
            <select 
              value={newUser.role} 
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} 
              className="w-full p-2 border border-gray-300 rounded mb-2"
            >
              <option value="customer">Customer</option>
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            
            <label className="block text-gray-700 mb-1 text-sm">Phone</label>
            <input 
              type="tel" 
              placeholder="Enter 11 digit number" 
              value={formatUserPhoneDisplay(newUser.phone)} 
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setNewUser({ ...newUser, phone: value });
                setUserFormErrors({ ...userFormErrors, phone: validateUserPhone(value) });
              }} 
              maxLength={12}
              className={`w-full p-2 border rounded mb-1 ${userFormErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            <p className="text-xs text-gray-500 mb-1">{newUser.phone.length}/11 digits (03XX-XXXXXXX)</p>
            {userFormErrors.phone && <p className="text-red-500 text-xs mb-2">{userFormErrors.phone}</p>}
            
            <div className="flex space-x-2 mt-4">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Add</button>
              <button type="button" onClick={() => { setShowAddUserForm(false); setUserFormErrors({}); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showAddTableForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleAddTable} className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-xl mb-4">Add Table</h3>
            <input type="number" placeholder="Number" value={newTable.number} onChange={(e) => setNewTable({ ...newTable, number: e.target.value })} className="w-full p-2 border mb-2" required />
            <input type="number" placeholder="Capacity" value={newTable.capacity} onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })} className="w-full p-2 border mb-4" required />
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
              <button onClick={() => setShowAddTableForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showEditTableForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleEditTable} className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-xl mb-4">Edit Table</h3>
            <input type="number" placeholder="Number" value={editTable.number} onChange={(e) => setEditTable({ ...editTable, number: e.target.value })} className="w-full p-2 border mb-2" required />
            <input type="number" placeholder="Capacity" value={editTable.capacity} onChange={(e) => setEditTable({ ...editTable, capacity: e.target.value })} className="w-full p-2 border mb-4" required />
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Update</button>
              <button onClick={() => setShowEditTableForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showEditMenuForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form onSubmit={handleEditMenu} className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-xl mb-4">Edit Menu Item</h3>
            <input type="text" placeholder="Name" value={editMenu.name} onChange={(e) => setEditMenu({ ...editMenu, name: e.target.value })} className="w-full p-2 border mb-2" required />
            <textarea placeholder="Description" value={editMenu.description} onChange={(e) => setEditMenu({ ...editMenu, description: e.target.value })} className="w-full p-2 border mb-2" />
            <input type="text" placeholder="Image URL (e.g., /images/pizza.jpg)" value={editMenu.image} onChange={(e) => setEditMenu({ ...editMenu, image: e.target.value })} className="w-full p-2 border mb-2" />
            <p className="text-xs text-gray-500 mb-2">💡 Place images in frontend/public/images/ folder</p>
            <input type="number" placeholder="Price" value={editMenu.price} onChange={(e) => setEditMenu({ ...editMenu, price: e.target.value })} className="w-full p-2 border mb-2" required />
            <select value={editMenu.category} onChange={(e) => setEditMenu({ ...editMenu, category: e.target.value })} className="w-full p-2 border mb-4">
              <option value="appetizer">Appetizer</option>
              <option value="main">Main</option>
              <option value="dessert">Dessert</option>
              <option value="drink">Drink</option>
            </select>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Update</button>
              <button onClick={() => setShowEditMenuForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const renderChefDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <div className="space-y-4">
        {orders.filter(o => o.assignedChef && o.assignedChef._id && o.assignedChef._id.toString() === user.id).map(order => (
          <div key={order._id} className={`p-4 rounded-xl shadow-lg border-2 ${order.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : order.status === 'preparing' ? 'bg-blue-50 border-blue-200' : order.status === 'ready' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} hover:shadow-xl transition-all duration-300`}>
            <p className="font-semibold text-gray-800">Customer: {order.customerName || order.customer?.name || 'Guest Customer'}</p>
            <p className="text-gray-600">Status: <span className={`font-medium ${order.status === 'pending' ? 'text-yellow-600' : order.status === 'preparing' ? 'text-blue-600' : order.status === 'ready' ? 'text-green-600' : 'text-gray-600'}`}>{order.status}</span></p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => updateOrderStatus(order._id, 'preparing')} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">Start Preparing</button>
              <button onClick={() => updateOrderStatus(order._id, 'ready')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">Mark Ready</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWaiterDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders & Tables</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className={`p-4 rounded-xl shadow-lg border-2 ${order.status === 'ready' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} hover:shadow-xl transition-all duration-300`}>
            <p className="font-semibold text-gray-800">Customer: {order.customer?.name || 'CheckedOut'}</p>
            <p className="text-gray-600">Status: <span className={`font-medium ${order.status === 'ready' ? 'text-green-600' : 'text-gray-600'}`}>{order.status}</span></p>
            <p className="text-gray-600">Placed at: {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-gray-600">Table: {order.table?.number || 'Not assigned'}</p>
            {order.status === 'ready' && <button onClick={() => updateOrderStatus(order._id, 'served')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mt-2">Mark Served</button>}
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Tables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map(table => (
            <div key={table._id} className={`p-4 rounded-xl shadow-lg border-2 ${table.status === 'available' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} hover:shadow-xl transition-all duration-300`}>
              <p className="font-semibold text-gray-800">Table {table.number}</p>
              <p className="text-gray-600">Status: <span className={`font-medium ${table.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>{table.status}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (user.role === 'customer') return renderCustomerDashboard();
    if (['admin', 'manager'].includes(user.role)) return renderAdminManagerDashboard();
    if (user.role === 'chef') return renderChefDashboard();
    if (user.role === 'waiter') return renderWaiterDashboard();
    return <p>Role not recognized</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
            <p className="text-lg text-gray-600">Role: {user.role}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition mt-4 md:mt-0"
          >
            Logout
          </button>
        </div>
        {renderContent()}
      </div>
      {renderReviewModal()}
    </div>
  );
};

export default Dashboard;