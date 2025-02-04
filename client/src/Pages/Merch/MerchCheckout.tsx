import { useState } from "react";
import { useLocation } from "react-router-dom";

interface IItem {
    name: string;
    qty: number;
    size: string;
}

const MerchCheckout = () => {
  const location = useLocation();
  const cartData: { tshirts: IItem[] } = location.state?.cartData || { tshirts: [] };

  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEle = e.currentTarget;
    const formDatab = new FormData(formEle);
    console.log("Form Data:", formDatab);
    console.log("Cart Data:", cartData);
    fetch(
        "https://script.google.com/macros/s/AKfycbz3wc1PmVzllQ7GiTbOe_0OfFrch5XOkmbqahC7nlWmQ4aKkAh3TBZOZdOiaRXV1ku0/exec",
        {
          method: "POST",
          body: formDatab
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
  };

  return (
    <main className="container mx-auto py-12 px-4">

    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
            <input name="Cart" value={JSON.stringify(cartData.tshirts)} hidden/>
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

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 w-full">
          Submit
        </button>
      </form>
    </div>
  </main>
  );
};

export default MerchCheckout;
