import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, TrendingUp, AlertTriangle, XCircle, Plus, X } from 'lucide-react';

export default function Dashboard({ searchQuery, mode, onProductsUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products');
      const productsData = res.data;
      
      // Fetch stock for each product
      const productsWithStock = await Promise.all(productsData.map(async (p) => {
        try {
          const invRes = await axios.get(`http://localhost:8080/api/inventory/${p.id}`);
          return { ...p, stock: invRes.data?.quantity || 0 };
        } catch (e) {
          return { ...p, stock: 0 };
        }
      }));

      setProducts(productsWithStock);
      if (onProductsUpdate) onProductsUpdate(productsWithStock);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 15).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (p.name && p.name.toLowerCase().includes(lowerQuery)) || 
           (p.sku && p.sku.toLowerCase().includes(lowerQuery));
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">
          {mode === 'full' && 'Dashboard Overview'}
          {mode === 'products' && 'Product Catalog'}
          {mode === 'inventory' && 'Inventory Management'}
        </h2>
        <div className="space-x-3">
          {(mode === 'full' || mode === 'inventory') && (
            <button 
              onClick={() => setShowAddStock(true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Stock
            </button>
          )}
          {(mode === 'full' || mode === 'products') && (
            <button 
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {mode === 'full' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Products" value={totalProducts} icon={Package} trend="+12.4%" />
          <KpiCard title="Total Stock Units" value={totalStock} icon={TrendingUp} trend="+5.2%" />
          <KpiCard title="Low Stock Alerts" value={lowStockCount} icon={AlertTriangle} trend="-2" trendColor="text-amber-600 dark:text-amber-400" />
          <KpiCard title="Out of Stock" value={outOfStockCount} icon={XCircle} trend="+1" trendColor="text-rose-600 dark:text-rose-400" />
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-8 transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 transition-colors">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            {mode === 'products' ? 'All Products' : 'Recent Inventory Status'}
          </h3>
          {searchQuery && (
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded transition-colors">
              Showing results for "{searchQuery}"
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 transition-colors">
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Product Name</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Stock Level</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Loading data...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    {searchQuery ? 'No matching results found.' : 'No items found. Add one!'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  let status = 'In Stock';
                  if (p.stock === 0 || p.stock == null) status = 'Out of Stock';
                  else if (p.stock <= 15) status = 'Low Stock';
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">{p.sku}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">${(p.price || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{p.stock || 0}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddProduct && (
        <AddProductModal 
          onClose={() => setShowAddProduct(false)} 
          onSuccess={() => { setShowAddProduct(false); fetchProducts(); }} 
        />
      )}
      
      {showAddStock && (
        <AddStockModal 
          products={products}
          onClose={() => setShowAddStock(false)} 
          onSuccess={() => { setShowAddStock(false); fetchProducts(); }} 
        />
      )}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, trendColor = "text-emerald-600 dark:text-emerald-400" }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>
      <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{value}</div>
      <div className={`text-xs font-medium ${trendColor}`}>{trend} from last month</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'In Stock': 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Low Stock': 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'Out of Stock': 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };
  const dots = {
    'In Stock': 'bg-emerald-500',
    'Low Stock': 'bg-amber-500',
    'Out of Stock': 'bg-rose-500',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${styles[status] || styles['In Stock']}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 transition-colors ${dots[status] || dots['In Stock']}`}></span>
      {status}
    </span>
  );
}

function AddProductModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', sku: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/products', {
        ...formData,
        price: parseFloat(formData.price)
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Add New Product</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-900/30 p-3 rounded-md border border-rose-200 dark:border-rose-800">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors" placeholder="e.g. Mechanical Keyboard" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
            <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors" placeholder="e.g. KB-104" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
            <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors" placeholder="0.00" />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700 mt-6 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors">{loading ? 'Adding...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddStockModal({ products, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ productId: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/inventory/add?productId=${formData.productId}&quantity=${formData.quantity}`);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Add Stock</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-900/30 p-3 rounded-md border border-rose-200 dark:border-rose-800">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Product</label>
            <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors">
              <option value="">-- Choose a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity to Add</label>
            <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors" placeholder="100" />
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700 mt-6 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors">{loading ? 'Adding...' : 'Update Inventory'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
