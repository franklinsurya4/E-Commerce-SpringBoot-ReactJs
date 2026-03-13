import React, { useState, useEffect } from "react";
import "../styles/Account.css";
import { getMe, getOrdersByEmail } from "../api/api";

export default function Account() {

  const [tab,setTab] = useState("overview");
  const [user,setUser] = useState(null);
  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try{
      setLoading(true);
      setError(null);

      const u = await getMe(token);
      setUser(u);

      const o = await getOrdersByEmail(u.email);
      setOrders(o);

    }catch(e){
      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e.message ||
        "Failed to load account"
      );
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(!token){
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }
    fetchData();
  },[]);

  useEffect(()=>{
    const handleVisibilityChange = ()=>{
      if(document.visibilityState === "visible" && token){
        fetchData();
      }
    };

    document.addEventListener("visibilitychange",handleVisibilityChange);

    return ()=>{
      document.removeEventListener("visibilitychange",handleVisibilityChange);
    };
  },[]);

  const delivered  = orders.filter(o=>o.status==="DELIVERED").length;
  const shipped    = orders.filter(o=>o.status==="SHIPPED").length;
  const active     = orders.filter(o=>["PENDING","CONFIRMED","SHIPPED"].includes(o.status)).length;
  const cancelled  = orders.filter(o=>o.status==="CANCELLED").length;

  const totalSpent = orders.reduce((s,o)=>s+(o.totalAmount||0),0);

  if(loading){
    return(
      <div className="account-center">
        <h3>Loading Account...</h3>
      </div>
    );
  }

  if(error){
    return(
      <div className="account-center">
        <p className="account-error">{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return(
    <div className="account-wrap">

      {/* HERO */}
      <div className="account-hero">

        <div className="hero-card user-card">
          <div className="account-hero-left">

            <div className="account-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{user.username}</h2>
              <p>{user.email}</p>
            </div>

          </div>
        </div>

        <div className="hero-card refresh-card">
          <button
            className="account-refresh-btn"
            onClick={fetchData}
          >
            ↻ Refresh Data
          </button>
        </div>

        <div className="hero-card address-card">
          <h3>Address</h3>
          <p>{user.address || "No address added"}</p>
        </div>

      </div>


      {/* STATS BAR */}

      <div className="account-stats-bar">

        <div className="account-stat">
          <h3>{orders.length}</h3>
          <p>Orders</p>
        </div>

        <div className="account-stat">
          <h3 className="stat-delivered">{delivered}</h3>
          <p>Delivered</p>
        </div>

        <div className="account-stat">
          <h3 className="stat-shipped">{shipped}</h3>
          <p>Shipped</p>
        </div>

        <div className="account-stat">
          <h3 className="stat-active">{active}</h3>
          <p>Active</p>
        </div>

        <div className="account-stat">
          <h3 className="stat-cancelled">{cancelled}</h3>
          <p>Cancelled</p>
        </div>

      </div>


      {/* TABS */}

      <div className="account-tabs">

        <button
          className={tab==="overview" ? "active":""}
          onClick={()=>setTab("overview")}
        >
          Overview
        </button>

        <button
          className={tab==="orders" ? "active":""}
          onClick={()=>setTab("orders")}
        >
          Orders
        </button>

        <button
          className={tab==="profile" ? "active":""}
          onClick={()=>setTab("profile")}
        >
          Profile
        </button>

      </div>


      {/* CONTENT */}

      <div className="account-content">

        {tab==="overview" &&(

          <div className="account-grid">

            <div className="overview-card">
              <p>Total Orders</p>
              <h3>{orders.length}</h3>
            </div>

            <div className="overview-card card-delivered">
              <p>Delivered</p>
              <h3>{delivered}</h3>
            </div>

            <div className="overview-card card-shipped">
              <p>Shipped</p>
              <h3>{shipped}</h3>
            </div>

            <div className="overview-card card-active">
              <p>Active</p>
              <h3>{active}</h3>
            </div>

            <div className="overview-card card-cancelled">
              <p>Cancelled</p>
              <h3>{cancelled}</h3>
            </div>

            <div className="overview-card card-spent">
              <p>Total Spent</p>
              <h3>₹{totalSpent.toLocaleString("en-IN")}</h3>
            </div>

          </div>

        )}


        {tab==="orders" &&(

          <div>

            {orders.length===0 ? (

              <p>No orders yet</p>

            ):(

              orders.map(o=>(
                <div key={o.id} className="account-order-card">

                  <div>
                    <p>Order #{o.id}</p>
                    <h4>{o.customerName}</h4>

                    <span className={`account-order-status account-status-${o.status?.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </div>

                  <div>
                    ₹{o.totalAmount?.toLocaleString("en-IN")}
                  </div>

                </div>
              ))

            )}

          </div>

        )}


        {tab==="profile" &&(

          <div className="account-profile">

            <div className="account-info">
              <span>Member ID</span>
              <span>{user.id}</span>
            </div>

            <div className="account-info">
              <span>Username</span>
              <span>{user.username}</span>
            </div>

            <div className="account-info">
              <span>Email</span>
              <span>{user.email}</span>
            </div>

          </div>

        )}

      </div>

    </div>
  );
}