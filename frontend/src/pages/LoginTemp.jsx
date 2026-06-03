import { useState } from "react";
import API from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  


  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/login", {
        username,
        password,
      });
      console.log(response.data);

      sessionStorage.setItem(
        "token",
        response.data.token
      );

      sessionStorage.setItem(
        "role",
        response.data.role
      );

      sessionStorage.setItem(
        "username",
        response.data.username
      );

      window.location.href = "/";
    } 
    catch (error) {
  console.log("Error:", error.response?.data);
  alert(JSON.stringify(error.response?.data));
}
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
  "linear-gradient(135deg, #0f172a, #1e3a8a)"
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "420px",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-5">
  
          <div className="text-center mb-4">
            <h1>🛒</h1>
  
            <h2 className="fw-bold">
              Grocery Store
            </h2>
  
            <p className="text-muted">
              Management System
            </p>
          </div>
  
          <form onSubmit={login}>
  
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Username
              </label>
  
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>
  
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>
  
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
  
            <button
              type="submit"
              className="btn w-100 py-2 fw-bold text-white"
              style={{
                backgroundColor: "#2563eb",
                border: "none",
}}
            >
              Login
            </button>
  
          </form>
  
        </div>
      </div>
    </div>
  )
}
export default Login;