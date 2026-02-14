import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Loader2, Mail } from "lucide-react";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");

    const { mutate: forgotPassword, isPending } = useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.post("/auth/forgot-password", data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Reset link sent to your email");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Something went wrong");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPassword({ email });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
                    <p className="text-base-content/60">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email Address</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-base-content/40" />
                            </div>
                            <input
                                type="email"
                                className="input input-bordered w-full pl-10"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
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
                                Sending Link...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="text-sm link link-primary hover:underline flex items-center justify-center gap-2"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
