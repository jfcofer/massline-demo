import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Package, Clock, User, Plus } from 'lucide-react';
import { mockOrders } from '../data/mockData';
import EmptyState from '../components/ui/EmptyState';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgent' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'Todas', count: mockOrders.length },
    { id: 'urgent', label: 'Urgentes', count: mockOrders.filter(o => o.priority === 'urgent').length },
    { id: 'mine', label: 'Mías', count: 0 },
  ];

  const filteredOrders = mockOrders.filter(order => {
    if (selectedFilter === 'urgent' && order.priority !== 'urgent') return false;
    if (selectedFilter === 'mine' && order.assignedTo !== 'current-user') return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(search) ||
        order.destination.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${Math.round(diffHours / 24)} días`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Órdenes de Despacho</h1>
          <button className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform">
            <Filter className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as 'all' | 'urgent' | 'mine')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedFilter === filter.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className="ml-1.5 opacity-75">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por # orden, tienda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <EmptyState
            type="no_orders"
            onAction={() => window.location.reload()}
          />
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  order.priority === 'urgent' ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="p-4">
                  {/* Priority Badge */}
                  {order.priority === 'urgent' && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-xs font-bold text-red-600 uppercase">
                        URGENTE
                      </span>
                    </div>
                  )}

                  {/* Order Number */}
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    ORDEN {order.orderNumber}
                  </h3>

                  {/* Destination */}
                  <p className="text-sm text-gray-700 mb-3">{order.destination.name}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      <span>
                        {order.items.length} productos | {order.items.reduce((sum, item) => sum + item.requestedQuantity, 0)} unidades
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{order.assignedTo || 'Sin asignar'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 active:scale-95 transition-transform">
                      Ver detalles
                    </button>
                    <button
                      onClick={() => navigate(`/dispatch/picking/${order.id}`)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform ${
                        order.assignedTo
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {order.assignedTo ? 'VER PROGRESO' : 'TOMAR ORDEN'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - New Order */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-20"
        onClick={() => alert('Crear nueva orden (próximamente)')}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Navigation Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default OrderList;
