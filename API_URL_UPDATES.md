# Remaining API URLs to Update in Dashboard.jsx

## How to Update Remaining URLs

**Option 1: Use Find & Replace in VS Code**
1. Press `Ctrl+H` to open Find & Replace
2. Find: `http://localhost:5000`
3. Replace: `${API_BASE_URL}`
4. Click "Replace All"

**Option 2: Manual Update Lines**

These functions still need updating in `frontend/src/components/Dashboard.jsx`:

```javascript
// Line 149 - placeOrder
- await axios.post('http://localhost:5000/api/orders', { items, table: selectedTable || null });
+ await axios.post(`${API_BASE_URL}/api/orders`, { items, table: selectedTable || null });

// Line 164 - handleAddItem
- await axios.post('http://localhost:5000/api/menu', newItem);
+ await axios.post(`${API_BASE_URL}/api/menu`, newItem);

// Line 176 - handleDeleteItem
- await axios.delete(`http://localhost:5000/api/menu/${id}`);
+ await axios.delete(`${API_BASE_URL}/api/menu/${id}`);

// Line 236 - handleAddUser
- await axios.post('http://localhost:5000/api/users', newUser);
+ await axios.post(`${API_BASE_URL}/api/users`, newUser);

// Line 249 - handleDeleteUser
- await axios.delete(`http://localhost:5000/api/users/${id}`);
+ await axios.delete(`${API_BASE_URL}/api/users/${id}`);

// Line 263 - handleDeleteTable
- await axios.delete(`http://localhost:5000/api/tables/${id}`);
+ await axios.delete(`${API_BASE_URL}/api/tables/${id}`);

// Line 274 - handleAddTable
- await axios.post('http://localhost:5000/api/tables', { number: newTable.number, capacity: newTable.capacity });
+ await axios.post(`${API_BASE_URL}/api/tables`, { number: newTable.number, capacity: newTable.capacity });

// Line 287 - handleEditTable
- await axios.put(`http://localhost:5000/api/tables/${editTable._id}`, { number: editTable.number, capacity: editTable.capacity });
+ await axios.put(`${API_BASE_URL}/api/tables/${editTable._id}`, { number: editTable.number, capacity: editTable.capacity });

// Line 300 - handleEditMenu
- await axios.put(`http://localhost:5000/api/menu/${editMenu._id}`, editMenu);
+ await axios.put(`${API_BASE_URL}/api/menu/${editMenu._id}`, editMenu);

// Line 312 - updateOrderStatus
- await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status });
+ await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, { status });

// Line 322 - handleDeleteOrder
- await axios.delete(`http://localhost:5000/api/orders/${id}`);
+ await axios.delete(`${API_BASE_URL}/api/orders/${id}`);

// Line 338 - assignStaff
- await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, data);
+ await axios.put(`${API_BASE_URL}/api/orders/${orderId}/status`, data);

// Line 348 - fetchReviews
- const res = await axios.get(`http://localhost:5000/api/reviews/menu/${menuId}`);
+ const res = await axios.get(`${API_BASE_URL}/api/reviews/menu/${menuId}`);

// Line 359 - checkUnrepliedReviewsForMenu
- const res = await axios.get(`http://localhost:5000/api/reviews/menu/${item._id}`);
+ const res = await axios.get(`${API_BASE_URL}/api/reviews/menu/${item._id}`);

// Line 375 - checkUnrepliedReviews
- const res = await axios.get(`http://localhost:5000/api/reviews/menu/${item._id}`);
+ const res = await axios.get(`${API_BASE_URL}/api/reviews/menu/${item._id}`);

// Line 391 - handleAddReview
- await axios.post('http://localhost:5000/api/reviews', {
+ await axios.post(`${API_BASE_URL}/api/reviews`, {

// Line 410 - handleDeleteReview
- await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
+ await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {

// Line 429 - handleReplyToReview
- await axios.put(`http://localhost:5000/api/reviews/${reviewId}/reply`, {
+ await axios.put(`${API_BASE_URL}/api/reviews/${reviewId}/reply`, {

// Line 504 - fetchAnalytics
- const res = await axios.get('http://localhost:5000/api/orders', {
+ const res = await axios.get(`${API_BASE_URL}/api/orders`, {
```

## Quick Steps

1. ✅ Already updated: `fetchMenu`, `fetchOrders`, `fetchTables`, `fetchUsers`
2. 📝 Need to update: All POST, PUT, DELETE calls (see list above)
3. 📝 Need to update: `fetchAnalytics`, `fetchReviews` calls

## Use Find & Replace

**Easiest Method:**
1. Open Dashboard.jsx
2. Press `Ctrl+H`
3. Find: `'http://localhost:5000`
4. Replace: `` `${API_BASE_URL} ``
5. Replace All

**Then manually fix any that got double backticks**

Done! ✅
