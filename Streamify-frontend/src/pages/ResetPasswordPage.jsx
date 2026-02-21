import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const { mutate: resetPassword, isPending } = useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.post(`/auth/reset-password/${token}`, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Password reset successfully");
            navigate("/login");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Something went wrong");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        resetPassword({ password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-5 sm:p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
                    <p className="text-base-content/60">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">New Password</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-base-content/40" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input input-bordered w-full pl-10 pr-10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-base-content/40 hover:text-base-content" />
                                ) : (
                                    <Eye className="h-5 w-5 text-base-content/40 hover:text-base-content" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Resetting Password...
                            </>
                        ) : (
                            "Set New Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
