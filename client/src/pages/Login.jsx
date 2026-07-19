import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  clearError,
  resetLoading,
  setCredentials,
} from "../redux/slices/authSlice";
import Loading from "../components/common/Loading";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Login() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated && user && token) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(resetLoading());
    };
  }, [dispatch]);

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });

    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log("API URL:", api.defaults.baseURL);

      const res = await api.post("/auth/login", input);

      console.log("Response:", res);
      console.log("Response Data:", res.data);

      if (res.data?.success) {
        dispatch(
          setCredentials({
            user: res.data.user,
            token: res.data.token,
          })
        );

        toast.success(res.data.message);

        navigate("/dashboard");

        setInput({
          email: "",
          password: "",
        });
      } else {
        toast.error(res.data?.message || "Login failed");
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Email"
            className="w-full border rounded-lg p-3"
            required
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={input.password}
              onChange={changeEventHandler}
              placeholder="Password"
              className="w-full border rounded-lg p-3"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/register" className="text-blue-600">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}