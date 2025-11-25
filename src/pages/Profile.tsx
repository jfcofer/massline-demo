import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Package, TruckIcon, CheckCircle, BarChart3, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock stats
  const monthStats = {
    receptions: 248,
    dispatches: 1523,
    accuracy: 99.2,
    productivity: 115,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Mi Perfil</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">Operador de Bodega</p>
              <p className="text-sm text-gray-500 font-mono mt-1">ID: OP-0045</p>
              <p className="text-xs text-gray-500 mt-1">Bodega Principal</p>
              <button className="mt-2 flex items-center gap-1 text-sm text-blue-600 font-medium">
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            Miembro desde: Enero 2024
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">ESTADÍSTICAS DEL MES</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Package className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{monthStats.receptions}</p>
              <p className="text-xs text-gray-600">Recepciones</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <TruckIcon className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{monthStats.dispatches}</p>
              <p className="text-xs text-gray-600">Despachos</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{monthStats.accuracy}%</p>
              <p className="text-xs text-gray-600">Precisión</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <BarChart3 className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-900">{monthStats.productivity}%</p>
              <p className="text-xs text-gray-600">Productividad</p>
            </div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 mb-1">OPERADOR DEL MES</p>
              <p className="text-xs text-gray-600">
                Excelente desempeño en precisión y velocidad de picking
              </p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          {[
            { icon: Settings, label: 'Configuración', action: () => alert('Configuración') },
            { icon: HelpCircle, label: 'Ayuda y Soporte', action: () => alert('Ayuda') },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-none"
            >
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="flex-1 text-gray-900">{item.label}</span>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="danger"
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </Button>

        {/* App Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>SmartStock v1.0.0</p>
          <p className="mt-1">© 2025 MASSLINE</p>
        </div>
      </div>

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default Profile;
