import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const blank = {
  name: "",
  email: "",
  plan: "Basic",
  amount: 0,
  status: "Active",
  billingCycle: "Monthly",
};

function App() {
  const [token, setToken] = useState(() =>
    sessionStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [customers, setCustomers] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    pastDue: 0,
    revenue: 0,
  });

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [modal, setModal] = useState(false);
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ================================
  // API HELPER
  // ================================

  const api = async (path, opt = {}) => {
    const response = await fetch(API + path, {
      ...opt,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Login again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  // ================================
  // LOAD CUSTOMERS + STATS
  // ================================

  const load = async () => {
    if (!token) return;

    try {
      const [customersData, statsData] = await Promise.all([
        api("/api/customers"),
        api("/api/customers/stats"),
      ]);

      setCustomers(customersData);
      setStats(statsData);
    } catch (error) {
      setMsg(error.message);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  // ================================
  // LOGOUT
  // ================================

  function logout() {
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  }

  // ================================
  // LOGIN
  // ================================

  function login(data) {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  // ================================
  // REGISTER
  // ================================

  async function register(formData) {
    const response = await fetch(API + "/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    setMode("login");
    setMsg("Account created. Please login.");
  }

  // ================================
  // SAVE CUSTOMER
  // ================================

  async function save(event) {
    event.preventDefault();

    try {
      setLoading(true);

      await api(
        edit ? `/api/customers/${edit}` : "/api/customers",
        {
          method: edit ? "PUT" : "POST",
          body: JSON.stringify(form),
        }
      );

      setModal(false);
      setEdit(null);
      setForm(blank);

      await load();

      setMsg(
        edit
          ? "Customer updated successfully."
          : "Customer created successfully."
      );
    } catch (error) {
      setMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  // ================================
  // DELETE CUSTOMER
  // ================================

  async function del(id) {
    if (!confirm("Delete this customer?")) {
      return;
    }

    try {
      await api(`/api/customers/${id}`, {
        method: "DELETE",
      });

      await load();

      setMsg("Customer deleted successfully.");
    } catch (error) {
      setMsg(error.message);
    }
  }

  // ================================
  // SEARCH
  // ================================

  const filtered = useMemo(() => {
    return customers.filter((customer) =>
      (
        customer.name +
        customer.email +
        customer.plan
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customers, search]);

  // ================================
  // LOGIN / REGISTER PAGE
  // ================================

  if (!token) {
    return mode === "login" ? (
      <Login
        onLogin={login}
        register={() => setMode("register")}
        msg={msg}
      />
    ) : (
      <Register
        onRegister={register}
        login={() => setMode("login")}
      />
    );
  }

  const admin = user?.role === "Admin";

  // ================================
  // MAIN APPLICATION
  // ================================

  return (
    <div className="app">

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside>
        <div>
          <div className="brand">
            ◈ BillFlow
          </div>

          <small>SaaS Billing Portal</small>

          <nav>

            <button
              className={page === "dashboard" ? "on" : ""}
              onClick={() => setPage("dashboard")}
            >
              ▦ Dashboard
            </button>

            <button
              className={page === "customers" ? "on" : ""}
              onClick={() => setPage("customers")}
            >
              ♙ Customers
            </button>

            <button
              className={page === "billing" ? "on" : ""}
              onClick={() => setPage("billing")}
            >
              ▣ Billing
            </button>

            {admin && (
              <button
                className={page === "admin" ? "on" : ""}
                onClick={() => setPage("admin")}
              >
                ⚙ Admin
              </button>
            )}

          </nav>
        </div>

        {/* Sidebar User */}

        <div className="side-user">

          <b>
            {user?.name?.[0]?.toUpperCase()}
          </b>

          <span>
            {user?.name}

            <small>
              {user?.role}
            </small>
          </span>

          <button onClick={logout}>
            Logout
          </button>

        </div>
      </aside>

      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main>

        {/* HEADER */}

        <header>

          <div>
            <h1>
              {page[0].toUpperCase() + page.slice(1)}
            </h1>

            <p>
              Manage your SaaS business from one place.
            </p>
          </div>

          <div className="profile-wrap">
            <button
              className="profile-button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-label="Open profile menu"
            >
              <span className="profile-avatar">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
              <span className="profile-info">
                <b>{user?.name || "User"}</b>
                <small>{user?.role || "Employee"}</small>
              </span>
              <span className={`profile-arrow ${profileOpen ? "open" : ""}`}>⌄</span>
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-head">
                  <span className="profile-menu-avatar">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  <div>
                    <b>{user?.name || "User"}</b>
                    <small>{user?.email || ""}</small>
                  </div>
                </div>

                <div className="profile-divider" />

                <div className="profile-role">
                  <span>Account type</span>
                  <b>{user?.role || "Employee"}</b>
                </div>

                <button
                  className="profile-logout"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                >
                  <span>↪</span> Logout
                </button>
              </div>
            )}
          </div>

        </header>

        {/* MESSAGE */}

        {msg && (
          <div className="msg">

            {msg}

            <button onClick={() => setMsg("")}>
              ×
            </button>

          </div>
        )}

        {/* ================================
            DASHBOARD
        ================================= */}

        {page === "dashboard" && (
          <>
            <section className="hero">

              <div>

                <label>
                  OVERVIEW
                </label>

                <h2>
                  Welcome, {user?.name} 👋
                </h2>

                <p>
                  Track customers, subscriptions and recurring revenue.
                </p>

              </div>

              {admin && (
                <button
                  className="primary"
                  onClick={() => {
                    setForm(blank);
                    setEdit(null);
                    setModal(true);
                  }}
                >
                  + Add Customer
                </button>
              )}

            </section>

            {/* STATS */}

            <div className="stats">

              <Stat
                t="Total Customers"
                v={stats.total}
              />

              <Stat
                t="Active"
                v={stats.active}
              />

              <Stat
                t="Trial"
                v={stats.trial}
              />

              <Stat
                t="Revenue"
                v={
                  "₹" +
                  stats.revenue.toLocaleString()
                }
              />

            </div>

            {/* RECENT CUSTOMERS */}

            <Panel title="Recent Customers">

              <Table
                data={customers.slice(0, 5)}
                admin={admin}
                edit={(customer) => {
                  setForm(customer);
                  setEdit(customer._id);
                  setModal(true);
                }}
                del={del}
              />

            </Panel>
          </>
        )}

        {/* ================================
            CUSTOMERS
        ================================= */}

        {page === "customers" && (
          <Panel title="Customer Management">

            <div className="paneltop">

              <input
                className="search"
                placeholder="Search customers..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {admin && (
                <button
                  className="primary"
                  onClick={() => {
                    setForm(blank);
                    setEdit(null);
                    setModal(true);
                  }}
                >
                  + Add Customer
                </button>
              )}

            </div>

            <Table
              data={filtered}
              admin={admin}
              edit={(customer) => {
                setForm(customer);
                setEdit(customer._id);
                setModal(true);
              }}
              del={del}
            />

          </Panel>
        )}

        {/* ================================
            BILLING
        ================================= */}

        {page === "billing" && (
          <div className="plans">

            <Plan
              n="Basic"
              p="₹499"
              f={[
                "5 customers",
                "Monthly billing",
                "Email support",
              ]}
            />

            <Plan
              n="Pro"
              p="₹1,499"
              f={[
                "50 customers",
                "Advanced billing",
                "Priority support",
              ]}
              hot
            />

            <Plan
              n="Enterprise"
              p="₹4,999"
              f={[
                "Unlimited customers",
                "Role-based access",
                "Dedicated support",
              ]}
            />

          </div>
        )}

        {/* ================================
            ADMIN
        ================================= */}

        {page === "admin" && admin && (
          <div className="admin">

            <Panel title="Role Based Access">

              <p>
                Admins can create, update and delete customers.
                Employees can view customer data.
              </p>

              <div className="role">

                <b>
                  Admin
                </b>

                <span>
                  Full management access
                </span>

              </div>

              <div className="role">

                <b>
                  Employee
                </b>

                <span>
                  View-only customer access
                </span>

              </div>

            </Panel>

            <Panel title="Business Summary">

              <p>
                Total: <b>{stats.total}</b>
              </p>

              <p>
                Active: <b>{stats.active}</b>
              </p>

              <p>
                Past Due: <b>{stats.pastDue}</b>
              </p>

              <p>
                Revenue:{" "}
                <b>
                  ₹{stats.revenue.toLocaleString()}
                </b>
              </p>

            </Panel>

          </div>
        )}

      </main>

      {/* ================================
          CUSTOMER MODAL
      ================================= */}

      {modal && (
        <div className="overlay">

          <form
            className="modal"
            onSubmit={save}
          >

            <h2>
              {edit ? "Edit" : "Add"} Customer
            </h2>

            <div className="grid">

              <Field
                l="Name"
                v={form.name}
                set={(value) =>
                  setForm({
                    ...form,
                    name: value,
                  })
                }
              />

              <Field
                l="Email"
                v={form.email}
                set={(value) =>
                  setForm({
                    ...form,
                    email: value,
                  })
                }
                type="email"
              />

              <Field
                l="Amount"
                v={form.amount}
                set={(value) =>
                  setForm({
                    ...form,
                    amount: value,
                  })
                }
                type="number"
              />

              <label>
                Plan

                <select
                  value={form.plan}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      plan: event.target.value,
                    })
                  }
                >
                  <option>Basic</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                </select>

              </label>

              <label>
                Status

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value,
                    })
                  }
                >
                  <option>Active</option>
                  <option>Trial</option>
                  <option>Past Due</option>
                  <option>Cancelled</option>
                </select>

              </label>

              <label>
                Billing Cycle

                <select
                  value={form.billingCycle}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      billingCycle: event.target.value,
                    })
                  }
                >
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>

              </label>

            </div>

            <div className="actions">

              <button
                type="button"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>

              <button
                className="primary"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : edit
                  ? "Update"
                  : "Create"}
              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
}

/* =====================================================
   LOGIN
===================================================== */

function Login({ onLogin, register, msg }) {

  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  async function submit(event) {

    event.preventDefault();
    setErr("");

    try {

      const response = await fetch(
        API + "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: e,
            password: p,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      onLogin(data);

    } catch (error) {

      setErr(
        error.message || "Login failed"
      );

    }
  }

  return (
    <Auth
      title="Welcome Back"
      sub="Login to your BillFlow account"
      notice={msg}
    >

      {err && (
        <div className="error">
          {err}
        </div>
      )}

      <form onSubmit={submit}>

        <Field
          l="Email"
          v={e}
          set={setE}
          type="email"
        />

        <Field
          l="Password"
          v={p}
          set={setP}
          type="password"
        />

        <button className="primary">
          Login
        </button>

      </form>

      <p className="switch">

        Don't have an account?

        <button onClick={register}>
          Create Account
        </button>

      </p>

    </Auth>
  );
}

/* =====================================================
   REGISTER
===================================================== */

function Register({ onRegister, login }) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
  });

  const [err, setErr] = useState("");

  async function submit(event) {

    event.preventDefault();
    setErr("");

    try {

      await onRegister(form);

    } catch (error) {

      setErr(error.message);

    }
  }

  return (
    <Auth
      title="Create Account"
      sub="Start managing your SaaS customers"
    >

      {err && (
        <div className="error">
          {err}
        </div>
      )}

      <form onSubmit={submit}>

        <Field
          l="Name"
          v={form.name}
          set={(value) =>
            setForm({
              ...form,
              name: value,
            })
          }
        />

        <Field
          l="Email"
          v={form.email}
          set={(value) =>
            setForm({
              ...form,
              email: value,
            })
          }
          type="email"
        />

        <Field
          l="Password"
          v={form.password}
          set={(value) =>
            setForm({
              ...form,
              password: value,
            })
          }
          type="password"
        />

        <label>
          Role

          <select
            value={form.role}
            onChange={(event) =>
              setForm({
                ...form,
                role: event.target.value,
              })
            }
          >
            <option>Employee</option>
            <option>Admin</option>
          </select>

        </label>

        <button className="primary">
          Create Account
        </button>

      </form>

      <p className="switch">

        Already have an account?

        <button onClick={login}>
          Login
        </button>

      </p>

    </Auth>
  );
}

/* =====================================================
   AUTH LAYOUT
===================================================== */

function Auth({
  title,
  sub,
  children,
  notice,
}) {

  return (
    <div className="auth">

      <div className="card">

        <div className="logo">
          ◈
        </div>

        <h1>
          {title}
        </h1>

        <p>
          {sub}
        </p>

        {notice && (
          <div className="msg">
            {notice}
          </div>
        )}

        {children}

      </div>

    </div>
  );
}

/* =====================================================
   INPUT FIELD
===================================================== */

function Field({
  l,
  v,
  set,
  type = "text",
}) {

  return (
    <label>

      {l}

      <input
        type={type}
        value={v}
        onChange={(event) =>
          set(event.target.value)
        }
        required
      />

    </label>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function Stat({ t, v }) {

  return (
    <div className="stat">

      <small>
        {t}
      </small>

      <b>
        {v}
      </b>

    </div>
  );
}

/* =====================================================
   PANEL
===================================================== */

function Panel({
  title,
  children,
}) {

  return (
    <section className="panel">

      <div className="paneltitle">

        <div>

          <h2>
            {title}
          </h2>

          <p>
            Manage your billing data.
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

/* =====================================================
   CUSTOMER TABLE
===================================================== */

function Table({
  data,
  admin,
  edit,
  del,
}) {

  if (!data.length) {

    return (
      <div className="empty">
        No customers found.
      </div>
    );
  }

  return (
    <div className="tablewrap">

      <table>

        <thead>

          <tr>

            <th>
              Customer
            </th>

            <th>
              Plan
            </th>

            <th>
              Amount
            </th>

            <th>
              Status
            </th>

            <th>
              Cycle
            </th>

            {admin && (
              <th>
                Actions
              </th>
            )}

          </tr>

        </thead>

        <tbody>

          {data.map((customer) => (

            <tr key={customer._id}>

              <td>

                <b>
                  {customer.name}
                </b>

                <small>
                  {customer.email}
                </small>

              </td>

              <td>
                {customer.plan}
              </td>

              <td>
                ₹
                {Number(
                  customer.amount || 0
                ).toLocaleString()}
              </td>

              <td>

                <span className="pill">
                  {customer.status}
                </span>

              </td>

              <td>
                {customer.billingCycle}
              </td>

              {admin && (
                <td>

                  <button
                    onClick={() => edit(customer)}
                  >
                    ✎
                  </button>

                  <button
                    onClick={() =>
                      del(customer._id)
                    }
                  >
                    🗑
                  </button>

                </td>
              )}

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

/* =====================================================
   BILLING PLAN
===================================================== */

function Plan({
  n,
  p,
  f,
  hot,
}) {

  return (
    <div
      className={
        hot
          ? "plan hot"
          : "plan"
      }
    >

      {hot && (
        <em>
          POPULAR
        </em>
      )}

      <h2>
        {n}
      </h2>

      <div className="price">

        {p}

        <small>
          /month
        </small>

      </div>

      <ul>

        {f.map((feature) => (

          <li key={feature}>
            ✓ {feature}
          </li>

        ))}

      </ul>

      <button className="secondary">
        Select Plan
      </button>

    </div>
  );
}

export default App;