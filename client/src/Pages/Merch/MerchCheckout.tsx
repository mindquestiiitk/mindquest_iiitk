import { useState } from "react";
import { useLocation } from "react-router-dom";

interface IItem {
  name: string;
  qty: number;
  size: string;
}

const MerchCheckout = () => {
  const location = useLocation();
  const cartData: { tshirts: IItem[] } = location.state?.cartData || {
    tshirts: [],
  };

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        // Redirect to login if not authenticated
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?returnUrl=${returnUrl}&action=checkout`;
        return;
      }

      // Prepare data for our secure backend endpoint
      const orderData = {
        name: formData.Name,
        email: formData.Email,
        phone: formData.Phone,
        cart: cartData.tshirts,
      };

      // Send to our secure backend endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/merch/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to submit order");
      }

      // Handle success
      setSubmitSuccess(
        "Order submitted successfully! Thank you for your purchase."
      );

      // Clear form after successful submission
      setFormData({
        Name: "",
        Email: "",
        Phone: "",
      });

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        window.location.href = "/merch/success";
      }, 2000);
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-12 px-4">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        >
          <label className="block mb-2">Name:</label>
          <input
            type="text"
            name="Name"
            required
            value={formData.Name}
            onChange={handleChange}
            className="border p-2 w-full rounded mb-3"
          />

          <label className="block mb-2">Email:</label>
          <input
            type="email"
            name="Email"
            required
            value={formData.Email}
            onChange={handleChange}
            className="border p-2 w-full rounded mb-3"
          />

          <label className="block mb-2">Phone:</label>
          <input
            type="tel"
            name="Phone"
            required
            value={formData.Phone}
            onChange={handleChange}
            className="border p-2 w-full rounded mb-4"
          />

          <h2 className="text-lg font-bold mb-2">Your Cart:</h2>
          <div className="border p-4 rounded">
            <input
              name="Cart"
              value={JSON.stringify(cartData.tshirts)}
              hidden
            />
            {cartData.tshirts.length > 0 ? (
              cartData.tshirts.map((item, index) => (
                <div>
                  <p key={index} className="text-sm">
                    {item.name} - {item.size} x {item.qty}
                  </p>
                </div>
              ))
            ) : (
              <p>No items in cart</p>
            )}
          </div>

          {/* Error and Success Messages */}
          {submitError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
              role="alert"
            >
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">{submitSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 w-full flex justify-center items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Submit Order"
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default MerchCheckout;
