// src/components/settings/AnalyticsSettings.jsx
import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import "../../styles/analytics.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AnalyticsSettings({ orders }) {
  const [counts, setCounts] = useState({
    total: 0,
    delivered: 0,
    shipped: 0,
    active: 0,
    cancelled: 0,
    upcoming: 0,
  });

  useEffect(() => {
    if (!orders || !Array.isArray(orders)) return;

    const delivered = orders.filter(o => o.status === "DELIVERED").length;
    const shipped = orders.filter(o => o.status === "SHIPPED").length;
    const active = orders.filter(o => ["PENDING", "CONFIRMED", "SHIPPED"].includes(o.status)).length;
    const cancelled = orders.filter(o => o.status === "CANCELLED").length;
    const upcoming = orders.filter(o => ["PENDING", "CONFIRMED"].includes(o.status)).length;

    setCounts({
      total: orders.length,
      delivered,
      shipped,
      active,
      cancelled,
      upcoming,
    });
  }, [orders]);

  if (!orders) return <p>Loading analytics...</p>;

  // Bar Chart Data
  const barData = {
    labels: ["Total Orders", "Delivered", "Shipped", "Active", "Cancelled", "Upcoming"],
    datasets: [
      {
        label: "Orders Count",
        data: [counts.total, counts.delivered, counts.shipped, counts.active, counts.cancelled, counts.upcoming],
        backgroundColor: ["#2563eb","#16a34a","#facc15","#8b5cf6","#f43f5e","#0ea5e9"],
        barThickness: 30, // thicker bars
      },
    ],
  };

  // Pie Chart Data
  const pieData = {
    labels: ["Delivered", "Shipped", "Active", "Cancelled", "Upcoming"],
    datasets: [{
      label: "Orders Distribution",
      data: [counts.delivered, counts.shipped, counts.active, counts.cancelled, counts.upcoming],
      backgroundColor: ["#16a34a","#facc15","#8b5cf6","#f43f5e","#0ea5e9"],
    }],
  };

  // Line Chart Data
  const lineData = {
    labels: ["Delivered", "Shipped", "Active", "Cancelled", "Upcoming"],
    datasets: [{
      label: "Orders Trend",
      data: [counts.delivered, counts.shipped, counts.active, counts.cancelled, counts.upcoming],
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.3)",
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  };

  // Stacked Bar Chart Data
  const stackedData = {
    labels: ["Orders Status"],
    datasets: [
      { label: "Delivered", data: [counts.delivered], backgroundColor: "#16a34a" },
      { label: "Shipped", data: [counts.shipped], backgroundColor: "#facc15" },
      { label: "Active", data: [counts.active], backgroundColor: "#8b5cf6" },
      { label: "Cancelled", data: [counts.cancelled], backgroundColor: "#f43f5e" },
      { label: "Upcoming", data: [counts.upcoming], backgroundColor: "#0ea5e9" },
    ],
  };

  const stackedOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  return (
    <div className="analytics-settings">
      <h3>📊 Orders Analytics</h3>

      <div className="chart-grid">
        <div className="chart-container">
          <h4>Bar Chart - Orders Overview</h4>
          <Bar data={barData} />
        </div>

        <div className="chart-container">
          <h4>Pie Chart - Orders Distribution</h4>
          <Pie data={pieData} />
        </div>

        <div className="chart-container">
          <h4>Line Chart - Trend</h4>
          <Line data={lineData} />
        </div>

        <div className="chart-container">
          <h4>Stacked Bar Chart - Status Breakdown</h4>
          <Bar data={stackedData} options={stackedOptions} />
        </div>
      </div>
    </div>
  );
}