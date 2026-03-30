import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const isAdminPage = location.pathname.startsWith('/AdminDashboard');
  
  // Adjusted to catch both variations of the userguide path
  const isUserGuidePage = location.pathname === '/user-guide' || location.pathname === '/userguide';
  const isHomePage = location.pathname === '/';

  if (isAdminPage) return null;

  const categories = [
    { name: 'Adoption',   icon: '👶' },
    { name: 'Animals',    icon: '🐾' },
    { name: 'Education',  icon: '📚' },
    { name: 'Emergency',  icon: '🤝' },
    { name: 'Medical',    icon: '🏥' },
    { name: 'Clothes',    icon: '💼' },
    { name: 'Food',       icon: '🍱' },
    { name: 'Shelter',    icon: '⛪' },
    { name: 'Family',     icon: '👨‍👩‍👧' },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith('/campaign/')) return 'Campaign Details';
    const paths = {
      '/': 'Home',
      '/Login': 'Login',
      '/about': 'About Us',
      '/discover': 'Discover Causes',
      '/Register': 'Start Your Campaign',
      '/user-guide': 'User Guide',
      '/userguide': 'User Guide',
    };
    return paths[location.pathname] || 'AidbridgE';
  };

  const handleCategorySelect = (categoryName) => {
    navigate(`/discover?category=${categoryName}`);
    setIsDropdownOpen(false);
  };

  // Determine header style
  const getHeaderStyle = () => {
    if (isHomePage) return styles.transparentHeader;
    
    if (isUserGuidePage) {
        return {
            ...styles.transparentNoImageHeader,
            position: 'absolute', // Sits ON TOP of the UserGuide hero
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            border: 'none',
            boxShadow: 'none',
            height: 'auto'
        };
    }
    
    return styles.header;
  };

  // For the User Guide, the links should stay white because they sit on the dark Hero Image
  const linkColor = 'white';

  const showHeroContent = !isHomePage && !isUserGuidePage;

  return (
    <header style={getHeaderStyle()}>
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logoContainer}>
            <div style={{ ...styles.logoText, color: linkColor }}>AIDBRIDGE</div>
            <div style={styles.tagline}>GIVE HOPE • SPREAD LOVE</div>
          </div>

          <div style={styles.linksContainer}>
            <Link to="/" style={{ ...styles.link, color: linkColor }}>HOME</Link>
            
            <div
              style={styles.dropdownWrapper}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link to="/discover" style={{ ...styles.link, color: linkColor }}>
                DISCOVER <ChevronDown size={16} style={{ marginLeft: 6 }} />
              </Link>

              {isDropdownOpen && (
                <div style={styles.megaMenu}>
                  <div style={styles.menuHeader}>
                    <span style={styles.menuTitle}>Explore Categories</span>
                    <Link to="/discover" style={styles.seeAll} onClick={() => setIsDropdownOpen(false)}>
                      See All
                    </Link>
                  </div>
                  <div style={styles.menuGrid}>
                    {categories.map((cat) => (
                      <div
                        key={cat.name}
                        style={styles.menuItem}
                        onClick={() => handleCategorySelect(cat.name)}
                      >
                        <span style={styles.catIcon}>{cat.icon}</span>
                        <span style={styles.catName}>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" style={{ ...styles.link, color: linkColor }}>ABOUT</Link>
            <Link to="/user-guide" style={{ ...styles.link, color: linkColor }}>USER GUIDE</Link>
            <Link to="/Login" style={{ ...styles.link, color: linkColor }}>SIGN IN</Link>

            <button
              onClick={() => navigate('/Register')}
              style={styles.ctaButton}
            >
              Start an AidbridgE
            </button>
          </div>
        </div>
      </nav>

      {showHeroContent && (
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{getPageTitle()}</h1>
          <div style={styles.titleUnderline}></div>
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    height: '320px',
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.75), rgba(15,23,42,0.45)), url('/images/header.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#0f172a',
  },
  transparentHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'transparent'
  },
  transparentNoImageHeader: {
    position: 'relative',
    zIndex: 100,
    background: 'transparent',
    padding: 0,
  },
  nav: {
    width: '100%',
    padding: '25px 0',
    position: 'relative',
    zIndex: 10
  },
  navContainer: {
    maxWidth: '1300px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px'
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  logoText: {
    fontSize: '2rem',
    fontWeight: '900',
    letterSpacing: '-1.5px',
    lineHeight: 1
  },
  tagline: {
    fontSize: '0.65rem',
    color: '#26C2B9',
    fontWeight: '900',
    letterSpacing: '2px',
    marginTop: '4px'
  },
  linksContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '35px'
  },
  link: {
    textDecoration: 'none',
    fontWeight: '900',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.5px',
    transition: 'color 0.2s ease'
  },
  ctaButton: {
    background: '#26C2B9',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '16px',
    border: 'none',
    fontWeight: '900',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  dropdownWrapper: {
    position: 'relative',
    paddingBottom: '10px'
  },
  megaMenu: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '480px',
    backgroundColor: 'white',
    borderRadius: '28px',
    padding: '30px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
    zIndex: 200,
    color: '#333'
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '15px'
  },
  menuTitle: {
    fontWeight: '900',
    fontSize: '0.85rem',
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  seeAll: {
    fontSize: '0.8rem',
    color: '#26C2B9',
    fontWeight: '900',
    textDecoration: 'none'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    borderRadius: '18px',
    cursor: 'pointer'
  },
  catName: {
    fontWeight: '900',
    fontSize: '0.9rem',
    color: '#1e293b'
  },
  catIcon: {
    fontSize: '1.4rem'
  },
  heroContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '-2px'
  },
  titleUnderline: {
    width: '60px',
    height: '5px',
    background: '#26C2B9',
    marginTop: '10px',
    borderRadius: '10px'
  }
};

export default Navbar;