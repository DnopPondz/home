"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import {
  RefreshCw,
  Layers3,
  ClipboardList,
  Clock3,
  ShieldCheck,
  CheckCircle2,
  CircleX,
  Users,
  UserCog,
} from "lucide-react";

const initialTotals = {
  totalServices: 0,
  totalBookings: 0,
  completedBookings: 0,
  successfulBookings: 0,
  cancelledBookings: 0,
  pendingBookings: 0,
  acceptBookings: 0,
  totalUsers: 0,
  totalTechs: 0,
  totalCustomers: 0,
};

const metricConfig = [
  {
    key: "totalServices",
    label: "บริการทั้งหมด",
    icon: Layers3,
    iconStyles: "bg-blue-100 text-blue-600",
  },
  {
    key: "totalBookings",
    label: "งานที่กำลังดำเนินการ",
    icon: ClipboardList,
    iconStyles: "bg-indigo-100 text-indigo-600",
  },
  {
    key: "pendingBookings",
    label: "รอดำเนินการ",
    icon: Clock3,
    iconStyles: "bg-amber-100 text-amber-600",
  },
  {
    key: "acceptBookings",
    label: "รับงานแล้ว",
    icon: ShieldCheck,
    iconStyles: "bg-sky-100 text-sky-600",
  },
  {
    key: "completedBookings",
    label: "งานเสร็จสิ้น",
    icon: CheckCircle2,
    iconStyles: "bg-teal-100 text-teal-600",
  },
  {
    key: "cancelledBookings",
    label: "งานถูกยกเลิก",
    icon: CircleX,
    iconStyles: "bg-rose-100 text-rose-600",
  },
];

const thaiNumberFormatter = new Intl.NumberFormat("th-TH");
const thaiDateTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

function DashboardMetricCard({ icon: Icon, label, value, iconStyles }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconStyles}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [dashboardState, setDashboardState] = useState({
    totals: initialTotals,
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const isMountedRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    setDashboardState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [servicesRes, bookingsRes, usersRes] = await Promise.all([
        axios.get("/api/services"),
        axios.get("/api/bookings"),
        axios.get("/api/users"),
      ]);

      const servicesData = servicesRes.data || [];
      const bookingsData = bookingsRes.data || [];
      const usersData = usersRes.data || [];

      const techUsers = usersData.filter((user) => user.role === "tech");
      const customerUsers = usersData.filter((user) => user.role === "user");

      const completedBookings = bookingsData.filter(
        (booking) => booking.status === "completed" || booking.status === "rejected"
      );
      const successfulBookings = bookingsData.filter(
        (booking) => booking.status === "completed"
      );
      const cancelledBookings = bookingsData.filter(
        (booking) => booking.status === "rejected"
      );
      const pendingBookings = bookingsData.filter(
        (booking) => booking.status === "pending"
      );
      const acceptBookings = bookingsData.filter(
        (booking) => booking.status === "accepted"
      );
      const activeBookings = bookingsData.filter(
        (booking) => booking.status !== "completed" && booking.status !== "rejected"
      );

      const totals = {
        totalServices: servicesData.length,
        totalBookings: activeBookings.length,
        completedBookings: completedBookings.length,
        successfulBookings: successfulBookings.length,
        cancelledBookings: cancelledBookings.length,
        pendingBookings: pendingBookings.length,
        acceptBookings: acceptBookings.length,
        totalUsers: usersData.length,
        totalTechs: techUsers.length,
        totalCustomers: customerUsers.length,
      };

      if (!isMountedRef.current) {
        return;
      }

      setDashboardState({
        totals,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (!isMountedRef.current) {
        return;
      }
      setDashboardState((prev) => ({
        ...prev,
        loading: false,
        error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      }));
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDashboardData();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    if (!dashboardState.loading) {
      fetchDashboardData();
    }
  };

  const { totals, loading, error, lastUpdated } = dashboardState;

  const formattedMetrics = useMemo(
    () =>
      metricConfig.map((config) => ({
        ...config,
        value: thaiNumberFormatter.format(totals[config.key] ?? 0),
      })),
    [totals]
  );

  const statusBreakdown = useMemo(() => {
    const statuses = [
      { key: "successfulBookings", label: "สำเร็จ", color: "bg-emerald-500" },
      { key: "cancelledBookings", label: "ยกเลิก", color: "bg-rose-500" },
      { key: "acceptBookings", label: "รับงานแล้ว", color: "bg-sky-500" },
      { key: "pendingBookings", label: "รอดำเนินการ", color: "bg-amber-500" },
    ];

    const total = statuses.reduce(
      (sum, item) => sum + (totals[item.key] ?? 0),
      0
    );

    return statuses.map((item) => {
      const value = totals[item.key] ?? 0;
      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
      return {
        ...item,
        value: thaiNumberFormatter.format(value),
        percentage,
      };
    });
  }, [totals]);

  const userBreakdown = useMemo(() => {
    const entries = [
      {
        key: "totalTechs",
        label: "ช่างผู้เชี่ยวชาญ",
        icon: UserCog,
        highlight: "bg-blue-100 text-blue-700",
      },
      {
        key: "totalCustomers",
        label: "ลูกค้า",
        icon: Users,
        highlight: "bg-purple-100 text-purple-700",
      },
    ];

    return entries.map((entry) => ({
      ...entry,
      value: thaiNumberFormatter.format(totals[entry.key] ?? 0),
    }));
  }, [totals]);

  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return null;
    return thaiDateTimeFormatter.format(lastUpdated);
  }, [lastUpdated]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">ภาพรวมระบบ</h2>
            <p className="mt-1 text-sm text-slate-500">
              ติดตามการดำเนินงานแบบเรียลไทม์เพื่อบริหารจัดการทีมและบริการได้อย่างมั่นใจ
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 text-sm text-slate-500 sm:flex-row sm:items-center">
            {formattedLastUpdated && (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                อัปเดตล่าสุด: {formattedLastUpdated}
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              รีเฟรชข้อมูล
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? metricConfig.map((config) => (
              <div
                key={config.key}
                className="h-28 animate-pulse rounded-xl border border-slate-100 bg-slate-100/60"
              />
            ))
          : formattedMetrics.map((metric) => (
              <DashboardMetricCard key={metric.key} {...metric} />
            ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">สถานะการดำเนินงาน</h3>
          <p className="mt-1 text-sm text-slate-500">
            วิเคราะห์จำนวนงานแต่ละสถานะเพื่อปรับแผนการทำงานของทีมให้ตอบสนองได้ไวขึ้น
          </p>
          <div className="mt-6 space-y-4">
            {statusBreakdown.map((status) => (
              <div key={status.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>{status.label}</span>
                  <span>{status.value} ({status.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${status.color}`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {statusBreakdown.every((status) => status.percentage === 0) && (
              <p className="text-sm text-slate-500">
                ยังไม่มีข้อมูลสถานะที่จะแสดงในขณะนี้
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">ข้อมูลผู้ใช้งาน</h3>
          <p className="mt-1 text-sm text-slate-500">
            ตรวจสอบสัดส่วนผู้ใช้งานและทีมงานเพื่อประเมินทรัพยากรที่พร้อมให้บริการ
          </p>
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">ผู้ใช้งานทั้งหมด</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {thaiNumberFormatter.format(totals.totalUsers ?? 0)} คน
            </p>
          </div>
          <div className="mt-6 space-y-3">
            {userBreakdown.map((entry) => {
              const Icon = entry.icon;
              return (
                <div
                  key={entry.key}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-3 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${entry.highlight}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{entry.label}</p>
                      <p className="text-xs text-slate-500">อัปเดตเรียลไทม์จากฐานข้อมูล</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">{entry.value}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
