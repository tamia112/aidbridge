import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { API } from '../config';


const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: '' 
  });

  // Handles all text inputs and the standard select dropdown
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Backend expects 'name', so we combine first and last
    const dataToSend = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: formData.location,
      role: formData.role
    };

    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        // Store session data safely
        localStorage.setItem('token', data.token); 
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Role-based routing logic
        const userRole = data.user.role.toLowerCase();
        if (userRole === 'beneficiary') {
          navigate('/BeneficiaryDashboard');
        } else if (userRole === 'donor') {
          navigate('/DonorDashboard');
        } else if (userRole === 'admin') {
          navigate('/AdminDashboard');
        } else {
          navigate('/');
        }
      } else {
        // If the backend sends an error (e.g. User already exists)
        alert(data.error || "Registration failed. Please check your details.");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      alert("Could not connect to the server. Make sure your Backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left Side: Branding/Image */}
        <div style={styles.imageSide}>
          <div style={styles.imageOverlay}>
            <ShieldCheck size={48} color="white" style={{ marginBottom: '10px' }} />
            <h2 style={styles.imageTitle}>Welcome</h2>
            <p style={styles.imageSubtitle}>Join thousands making a difference through giving</p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div style={styles.formSide}>
          <div style={styles.card}>
            <div style={styles.header}>
              <h2 style={styles.subtitle}>SIGN UP WITH</h2>
              <h1 style={styles.logo}>AidbridgE</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.row}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>First Name</label>
                  <input 
                    name="firstName" 
                    type="text" 
                    style={styles.input} 
                    placeholder="John" 
                    required 
                    value={formData.firstName}
                    onChange={handleChange} 
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Surname</label>
                  <input 
                    name="lastName" 
                    type="text" 
                    style={styles.input} 
                    placeholder="Doe" 
                    required 
                    value={formData.lastName}
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  style={styles.input} 
                  placeholder="name@example.com" 
                  required 
                  value={formData.email}
                  onChange={handleChange} 
                />
              </div>

              <div style={styles.row}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Phone Number</label>
                  <input 
                    name="phone" 
                    type="text" 
                    style={styles.input} 
                    placeholder="0712345678" 
                    required 
                    value={formData.phone}
                    onChange={handleChange} 
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Location (City)</label>
                  <input 
                    name="location" 
                    type="text" 
                    style={styles.input} 
                    placeholder="Nairobi" 
                    required 
                    value={formData.location}
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input 
                  name="password" 
                  type="password" 
                  style={styles.input} 
                  placeholder="••••••••" 
                  required 
                  value={formData.password}
                  onChange={handleChange} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select 
                  name="role" 
                  style={styles.select} 
                  required 
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select your role</option>
                  <option value="donor">Donor</option>
                  <option value="beneficiary">Beneficiary</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : "Create Account"}
              </button>

              <div style={styles.footerText}>
                Have an account? <Link to="/" style={styles.link}>Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Full Width Banner */}
      <section style={styles.bannerSection}>
        <img src="/images/people.png" alt="People" style={styles.bannerImage} />
        <div style={styles.bannerStrip}>
          <h2 style={styles.bannerText}>
            Aidbridge, the place where help and hope go hand in hand.
          </h2>
          <button style={styles.bannerBtnAlt}>
            Start an Aidbridge
          </button>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh'
  },
  container: {
    display: 'flex',
    width: '95%',
    maxWidth: '1100px',
    minHeight: '650px',
    backgroundColor: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    marginTop: '-80px',   // ← THIS pulls it up into the navbar
    zIndex: 10,
    position: 'relative'
  },
  imageSide: {
    flex: 1,
    background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/images/side.jpg') center/cover no-repeat`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  imageOverlay: {
    color: 'white',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  imageTitle: { fontSize: '2.5rem', fontWeight: '800' },
  imageSubtitle: { fontSize: '1rem', marginTop: '10px' },
  formSide: {
    flex: 1.2,
    padding: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: { width: '100%', maxWidth: '360px' },
  header: { textAlign: 'center', marginBottom: '25px' },
  subtitle: { fontSize: '0.8rem', color: '#666', letterSpacing: '1px' },
  logo: { fontSize: '2.5rem', fontWeight: '800', color: '#1db09c' },
  row: { display: 'flex', gap: '15px', marginBottom: '15px' },
  formGroupHalf: { flex: 1 },
  formGroup: { marginBottom: '15px' },
  label: { fontWeight: '600', display: 'block', marginBottom: '5px', fontSize: '0.9rem' },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    fontWeight: '700',
    backgroundColor: '#1db09c',
    cursor: 'pointer',
    marginTop: '10px'
  },
  footerText: { textAlign: 'center', marginTop: '15px', color: '#666' },
  link: { color: '#1db09c', textDecoration: 'none', fontWeight: '700' },
  bannerSection: { width: '100%', marginTop: '60px' },
  bannerImage: { width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' },
  bannerStrip: { width: '100%', backgroundColor: '#1db09c', padding: '50px 20px', textAlign: 'center' },
  bannerText: { color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '25px' },
  bannerBtnAlt: { backgroundColor: 'white', color: '#1db09c', padding: '12px 30px', borderRadius: '30px', border: 'none', fontWeight: '700', cursor: 'pointer' }
};

export default Register;