"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  LogOut,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type AppointmentStatus = "Booked" | "In Progress" | "Completed" | "Cancelled";

type Appointment = {
  ID: string;
  patient_name: string;
  phone_number: string;
  preferred_date: string;
  preferred_time?: string;
  prefered_time?: string;
  reason: string;
  current_state?: string;
  confirmation_message?: string;
  created_at?: string;
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Booked: "bg-blue-100 text-blue-800 border-blue-200",
  "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_ICONS: Record<AppointmentStatus, any> = {
  Booked: Clock,
  "In Progress": AlertCircle,
  Completed: CheckCircle,
  Cancelled: XCircle,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("adminToken");
    const name = localStorage.getItem("adminName");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    setAdminName(name || "Administrator");
    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/appointments");
      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
      } else {
        setError(data.error || "Failed to fetch appointments");
      }
    } catch (err) {
      setError("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (rowId: string, status: AppointmentStatus) => {
    setUpdatingId(rowId);

    try {
      const response = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowId, status }),
      });

      if (response.ok) {
        // Refresh appointments
        await fetchAppointments();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update appointment");
      }
    } catch (err) {
      alert("Failed to update appointment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, <span className="font-medium">{adminName}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAppointments}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Booked"
            value={appointments.filter((a) => a.current_state === "Booked").length}
            icon={Clock}
            color="indigo"
          />
          <StatCard
            title="In Progress"
            value={appointments.filter((a) => a.current_state === "In Progress").length}
            icon={AlertCircle}
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={appointments.filter((a) => a.current_state === "Completed").length}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Appointment Management</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <AppointmentRow
                      key={appointment.ID}
                      appointment={appointment}
                      onStatusUpdate={updateAppointmentStatus}
                      isUpdating={updatingId === appointment.ID}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function AppointmentRow({
  appointment,
  onStatusUpdate,
  isUpdating,
}: {
  appointment: Appointment;
  onStatusUpdate: (rowId: string, status: AppointmentStatus) => void;
  isUpdating: boolean;
}) {
  const currentStatus = (appointment.current_state || "Booked") as AppointmentStatus;
  const StatusIcon = STATUS_ICONS[currentStatus];

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="w-5 h-5 text-gray-400 mr-3" />
          <div className="text-sm font-medium text-gray-900">{appointment.patient_name}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-500">
          <Phone className="w-4 h-4 mr-2" />
          {appointment.phone_number}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{appointment.preferred_date}</div>
        <div className="text-sm text-gray-500">{appointment.preferred_time || appointment.prefered_time}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-start text-sm text-gray-500 max-w-xs">
          <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{appointment.reason}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[currentStatus]}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {currentStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={currentStatus}
          onChange={(e) => onStatusUpdate(appointment.ID, e.target.value as AppointmentStatus)}
          disabled={isUpdating}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="Booked">Booked</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </td>
    </tr>
  );
}
