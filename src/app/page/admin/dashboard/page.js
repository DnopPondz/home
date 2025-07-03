// pages/admin/dashboard.js หรือ app/page/admin/dashboard/page.js
import NavigationSwitcher from '../../../components/NavigationSwitcher';

export default function AdminDashboard() {
  return (
    <div>
      {/* Main Content - เว้นพื้นที่สำหรับ sidebar */}
      <div className=" bg-gray-100">
       
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
              <p className="text-gray-600">Welcome to the admin dashboard!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">1,234</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Promotions</h3>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">$45,678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}