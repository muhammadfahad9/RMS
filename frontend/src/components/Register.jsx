import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = ({ toggleForm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const validateName = (value) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!value.trim()) return 'Name is required';
    if (!nameRegex.test(value)) return 'Name must contain only letters';
    return '';
  };

  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!value.trim()) return 'Email is required';
    if (!emailRegex.test(value)) return 'Email must end with @gmail.com';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length !== 8) return 'Password must be exactly 8 characters';
    return '';
  };

  const validatePhone = (value) => {
    const phoneRegex = /^03\d{9}$/;
    if (!value.trim()) return 'Phone is required';
    if (!phoneRegex.test(value)) return 'Phone must start with 03 and be 11 digits';
    return '';
  };

  const formatPhoneDisplay = (value) => {
    if (value.length <= 4) return value;
    return `${value.slice(0, 4)}-${value.slice(4)}`;
  };

  const validateSecurityCode = (value) => {
    if (role === 'admin' && value !== '123') return 'Invalid security code';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      phone: validatePhone(phone),
      securityCode: role === 'admin' ? validateSecurityCode(securityCode) : ''
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      toast.error('Please fix all validation errors');
      return;
    }
    
    const result = await register(name, email, password, role, phone);
    if (result.success) {
      toast.success('Registration successful! Please login.');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">🍽️ Register for RMS</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">👤 Name</label>
            <input
              type="text"
              placeholder="Enter your name (letters only)"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: validateName(e.target.value) });
              }}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">📧 Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: validateEmail(e.target.value) });
              }}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
              }`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">🔒 Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter exactly 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: validatePassword(e.target.value) });
                }}
                maxLength={8}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{password.length}/8 characters</p>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">🎭 Role</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setSecurityCode('');
                setErrors({ ...errors, securityCode: '' });
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {role === 'admin' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">🔐 Security Code</label>
              <input
                type="text"
                placeholder="Enter admin security code"
                value={securityCode}
                onChange={(e) => {
                  setSecurityCode(e.target.value);
                  setErrors({ ...errors, securityCode: validateSecurityCode(e.target.value) });
                }}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.securityCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
                required
              />
              {errors.securityCode && <p className="text-red-500 text-sm mt-1">{errors.securityCode}</p>}
            </div>
          )}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">📞 Phone</label>
            <input
              type="tel"
              placeholder="Enter 11 digit phone number"
              value={formatPhoneDisplay(phone)}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPhone(value);
                setErrors({ ...errors, phone: validatePhone(value) });
              }}
              maxLength={12}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
              }`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{phone.length}/11 digits (Format: 03XX-XXXXXXX)</p>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300 font-semibold">
            Register
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <button
            onClick={toggleForm}
            className="text-blue-500 hover:text-blue-700 font-semibold underline transition duration-300"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;