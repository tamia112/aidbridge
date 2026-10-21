/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { API } from '../config';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in (UX Improvement)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role) redirectByRole(user.role.toLowerCase());
    }
  }, []);

  const redirectByRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/AdminDashboard');
        break;
      case 'donor':
        navigate('/DonorDashboard');
        break;
      case 'beneficiary':
        navigate('/BeneficiaryDashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Essential for your ProtectedRoutes
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // ROLE-BASED REDIRECTION
        redirectByRole(data.user.role.toLowerCase());
      } else {
        alert(data.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Could not connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.imageSide}>
          <div style={styles.imageOverlay}>
            <LogIn size={48} color="white" style={{ marginBottom: '10px' }} />
            <h2 style={styles.imageTitle}>Welcome Back</h2>
            <p style={styles.imageSubtitle}>Log in to continue making an impact.</p>
          </div>
        </div>

        <div style={styles.formSide}>
          <div style={styles.card}>
            <div style={styles.header}>
              <h1 style={styles.logo}>AidbridgE</h1>
              <p style={styles.tagline}>CONTINUE YOUR JOURNEY</p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={20} /> : 'Login'}
              </button>

              <div style={styles.signup}>
                Don't have an account?{' '}
                <Link to="/register" style={styles.signupLink}>
                  Sign up now!
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

     
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
    maxWidth: '1000px',
    minHeight: '550px',
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
    background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/images/sides.jpg') center/cover no-repeat`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  imageOverlay: { color: 'white', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.5)' },
  imageTitle: { fontSize: '2.5rem', fontWeight: '800' },
  formSide: { flex: 1, padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { width: '100%', maxWidth: '300px' },
  header: { textAlign: 'center', marginBottom: '30px' },
  logo: { fontSize: '2.5rem', fontWeight: '800', color: '#1db09c' },
  tagline: { color: '#666', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' },
  formGroup: { marginBottom: '20px' },
  label: { fontWeight: '600', display: 'block', marginBottom: '8px' },
  input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '16px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: '700', backgroundColor: '#1db09c', cursor: 'pointer' },
  signup: { textAlign: 'center', marginTop: '20px', color: '#666' },
  signupLink: { color: '#1db09c', textDecoration: 'none', fontWeight: '700' },
  bannerSection: { width: '100%', marginTop: '60px' },
  bannerImage: { width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' },
  bannerStrip: { width: '100%', backgroundColor: '#1db09c', padding: '50px 20px', textAlign: 'center' },
  bannerText: { color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '25px' },
  bannerBtnAlt: { backgroundColor: 'white', color: '#1db09c', padding: '12px 30px', borderRadius: '30px', border: 'none', fontWeight: '700', cursor: 'pointer' }
};
 

export default Login;