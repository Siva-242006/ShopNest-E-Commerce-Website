import { useEffect, useState } from "react";
import "./deliveryAddressForm.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeliveryAddressForm = ({ onAddressSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    otherState: "",
    pincode: "",
    country: "India",
  });

  const [errors, setErrors] = useState({});
  const [previousAddresses, setPreviousAddresses] = useState([]);

  const statesList = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Maharashtra",
    "Delhi",
    "Other",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${apiUrl}/orders/my-orders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();

        const uniqueAddresses = [
          ...new Set(
            data
              .map((order) => JSON.stringify(order.shippingAddress))
              .filter((addr) => addr !== undefined)
          ),
        ].map((str) => JSON.parse(str));

        setPreviousAddresses(uniqueAddresses);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchOrders();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^\d{10}$/.test(formData.phone)) errs.phone = "Phone must be 10 digits";
    if (!formData.street.trim()) errs.street = "Street is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.state.trim()) errs.state = "Please select or enter a state";
    if (!/^\d{6}$/.test(formData.pincode)) errs.pincode = "Pincode must be 6 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalState = formData.state === "Other" ? formData.otherState : formData.state;
    if (validate()) {
      const addressToSubmit = {
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        landmark: formData.landmark,
        city: formData.city,
        state: finalState,
        pincode: formData.pincode,
        country: formData.country,
      };
      onAddressSubmit && onAddressSubmit(addressToSubmit);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectAddress = (e) => {
    const value = e.target.value;
    if (value === "") return;

    const selected = JSON.parse(value);
    
    setFormData({
      ...selected,
      otherState: selected.state !== statesList.includes(selected.state) ? selected.state : "",
      state: statesList.includes(selected.state) ? selected.state : "Other",
    });
  };

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <h2>Delivery Address</h2>

      {previousAddresses.length > 0 && (
        <div className="form-group">
          <label>Select Previous Address:</label>
          <select onChange={handleSelectAddress} defaultValue="">
            <option value="">-- Choose an address --</option>
            {previousAddresses.map((addr, idx) => (
              <option key={idx} value={JSON.stringify(addr)}>
                {`${addr.fullName}, ${addr.street}, ${addr.city}, ${addr.state}, ${addr.pincode}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Full Name:</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
        {errors.fullName && <span className="error">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label>Phone Number:</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          maxLength="10"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label>Street Address:</label>
        <input type="text" name="street" value={formData.street} onChange={handleChange} />
        {errors.street && <span className="error">{errors.street}</span>}
      </div>

      <div className="form-group">
        <label>Landmark (Optional):</label>
        <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>City:</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} />
        {errors.city && <span className="error">{errors.city}</span>}
      </div>

      <div className="form-group">
        <label>State:</label>
        <select name="state" value={formData.state} onChange={handleChange}>
          <option value="">-- Select State --</option>
          {statesList.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
        {formData.state === "Other" && (
          <input
            type="text"
            name="otherState"
            placeholder="Enter your state"
            value={formData.otherState}
            onChange={handleChange}
          />
        )}
        {errors.state && <span className="error">{errors.state}</span>}
      </div>

      <div className="form-group">
        <label>Pincode:</label>
        <input
          type="text"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          maxLength="6"
        />
        {errors.pincode && <span className="error">{errors.pincode}</span>}
      </div>

      <div className="form-group">
        <label>Country:</label>
        <input type="text" name="country" value="India" disabled />
      </div>

      <div className="form-group">
        <label>Payment method:</label>
        <input type="text" name="payment method" value="COD" disabled />
      </div>

      <button type="submit" className="save-btn">
        Save Address
      </button>
    </form>
  );
};

export default DeliveryAddressForm;
