import { useState } from "react";

const SignupForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "https://backend.wanij.com/scraper/auth/register/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        // Duplicate-email case
        if (
          data.error === "Validation failed" &&
          data.details?.email?.[0]?.toLowerCase().includes("already exists")
        ) {
          setMessage(
            "An account with that email already exists. Please try to log in ."
          );
        } else if (data.error) {
          setMessage(data.error);
        } else {
          setMessage("Registration failed. Please try again.");
        }
        setMessageType("error");
      } else {
        // Success path
        setMessage(
          data.message || "Registration request received successfully!"
        );
        setMessageType("success");
        setFormData({ email: "", password: "" });
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error—please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 my-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Request Access
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Company Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Request Access"
          )}
        </button>
      </form>

      {messageType === "success" && (
        <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800 mb-2">
            What's Next?
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              Your registration request has been submitted to our
              administrators.
            </p>
            <p>
              Once approved, you'll receive an email notification with login
              instructions.
            </p>
            <p>
              This typically takes 1–2 business days. Thank you for your
              patience!
            </p>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a
          href="/signin"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Login
        </a>
      </p>
    </div>
  );
};

export default SignupForm;
