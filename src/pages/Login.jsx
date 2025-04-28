import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { Eye, EyeOff } from "lucide-react"; // Using Lucide icons for eye open/close
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post("/login", { email, password });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role);

            // Success toast notification
            toast.success("Login berhasil! Mengalihkan...", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Short delay before navigation to allow the toast to be seen
            setTimeout(() => {
                if (user.role === "admin") {
                    navigate("/admin");
                } else if (user.role === "operator") {
                    navigate("/operator");
                } else {
                    navigate("/");
                }
            }, 2000);
        } catch (err) {
            setError("Login gagal! Periksa email dan password Anda.");
            
            // Error toast notification
            toast.error("Login gagal! Periksa email dan password Anda.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            console.error("Login error:", err.response?.data || err.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex items-center justify-center p-4">
            {/* ToastContainer for showing notifications */}
            <ToastContainer />
            
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
                <div className="mb-6">
                    {/* Header with side-by-side logos and divider */}
                    <div className="flex justify-center items-center mb-4">
                        {/* RFID Logo */}
                        <img 
                            src="./src/assets/logo1.png" 
                            alt="SI-Absen RFID Logo" 
                            className="w-16 h-16"
                        />
                        
                        {/* Vertical divider */}
                        <div className="mx-4 h-12 w-px bg-gray-300"></div>
                        
                        {/* SMK Logo */}
                        <img 
                            src="./src/assets/logo2.png" 
                            alt="SMK Negeri Ciomas Logo" 
                            className="w-16 h-16"
                        />
                    </div>
                    
                    {/* School name centered below logos */}
                    <h2 className="text-2xl font-bold text-blue-900 text-center">SMK NEGERI 1 CIOMAS</h2>
                </div>

                <h3 className="text-xl font-semibold text-blue-800 mb-6 text-center">LOGIN</h3>

                {error && <p className="text-red-600 text-sm text-center mb-4 bg-red-50 p-2 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button 
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-900 text-white font-medium py-3 rounded-lg transition-all shadow-md">
                            LOGIN
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;