import React from 'react';

const AboutUs = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'sans-serif' }}>

      {/* ✅ FIX: This top padding pushes content below the 260px navbar */}
      <div style={{ paddingTop: '0px' }}>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Our Story
            </h1>
            <div style={{ width: '80px', height: '5px', background: '#26C2B9', margin: '0 auto', borderRadius: '10px' }} />
          </div>

          {/* Hero Image */}
          <div style={{ width: '100%', height: '380px', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            <img src="/images/header.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Community Gathering" />
          </div>

          {/* Floating Card */}
          <div style={{
            position: 'relative', marginTop: '-100px', marginLeft: 'auto', marginRight: 'auto',
            maxWidth: '720px', backgroundColor: 'white', padding: '50px',
            borderRadius: '40px', boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
            border: '1px solid #f1f5f9', textAlign: 'center', zIndex: 5
          }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>
              About AidbridgE
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem', fontStyle: 'italic', marginBottom: '16px', fontWeight: '500' }}>
              "AidbridgE was born from a simple observation — aid distribution in Kenya was broken. 
              Generous donors were being defrauded, genuine beneficiaries were going unheard, and 
              informal channels like WhatsApp and Telegram were riddled with scams and delays."
            </p>
            <p style={{ color: '#64748b', lineHeight: '1.8', marginBottom: '30px' }}>
              We built AidbridgE to be a secure, AI-powered platform that creates a centralized, 
              trustworthy channel connecting verified beneficiaries directly with compassionate donors — 
              restoring confidence in the charitable process across Kenya and beyond.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {['Love', 'Faith', 'Hope'].map(val => (
                <div key={val} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                  <p style={{ color: '#26C2B9', fontWeight: '900', fontSize: '1.1rem', margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div style={{ marginTop: '80px', textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>How It Works</h2>
            <div style={{ width: '50px', height: '4px', background: '#26C2B9', margin: '12px auto 0', borderRadius: '10px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', textAlign: 'center' }}>
            {[
              { step: '01', icon: '📋', title: 'Beneficiary Applies', desc: 'A verified beneficiary submits an aid request with supporting documents for food, shelter, clothing or medical help.' },
              { step: '02', icon: '🤖', title: 'AI Verification', desc: 'Our AI microservice automatically checks documents for authenticity and runs fraud detection before any human review.' },
              { step: '03', icon: '✅', title: 'Admin Approves', desc: 'Our admin team reviews the AI report and either approves or rejects the request, updating the beneficiary in real time.' },
              { step: '04', icon: '🔍', title: 'Donor Browses', desc: 'Donors only ever see verified, approved requests — giving them full confidence that their aid reaches someone genuine.' },
              { step: '05', icon: '💚', title: 'Donation Made', desc: 'Donors commit to fulfilling a request through monetary, goods or service contributions and connect via secure chat.' },
              { step: '06', icon: '🎯', title: 'Aid Delivered', desc: 'Once fulfilled, the request is marked complete. Every transaction is logged in an immutable audit trail.' },
            ].map(item => (
              <div key={item.step} style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{item.icon}</div>
                <div style={{ color: '#26C2B9', fontWeight: '900', fontSize: '0.85rem', marginBottom: '8px', letterSpacing: '1px' }}>{item.step}</div>
                <h3 style={{ fontWeight: '900', color: '#0f172a', marginBottom: '10px', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Core Values */}
          <div style={{ marginTop: '80px', textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>Our Values</h2>
            <div style={{ width: '50px', height: '4px', background: '#26C2B9', margin: '12px auto 0', borderRadius: '10px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', textAlign: 'center' }}>
            {[
              { num: '01', title: 'Transparency', desc: 'Every donation is tracked end-to-end with a full audit trail. Donors see exactly where their aid goes.' },
              { num: '02', title: 'Security', desc: 'JWT authentication, bcrypt encryption and AI fraud detection protect every user on the platform.' },
              { num: '03', title: 'Accountability', desc: 'Admins verify every request. Beneficiaries are vetted. No aid moves without oversight.' },
            ].map(item => (
              <div key={item.num}>
                <div style={{ color: '#26C2B9', fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px' }}>{item.num}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontStyle: 'italic', lineHeight: '1.7', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Who It Serves */}
          <div style={{ marginTop: '80px', backgroundColor: '#0f172a', borderRadius: '40px', padding: '50px', color: 'white', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>Who We Serve</h2>
            <div style={{ width: '50px', height: '4px', background: '#26C2B9', margin: '0 auto 40px', borderRadius: '10px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              {[
                { icon: '🙏', title: 'Beneficiaries', desc: 'Individuals and families in Kenya who need food, shelter, clothing, medical or emergency aid.' },
                { icon: '💛', title: 'Donors', desc: 'Generous individuals who want to give with confidence, knowing their contribution reaches the right person.' },
                { icon: '🛡️', title: 'Administrators', desc: 'Our verification team who review requests, manage the platform and ensure every transaction is legitimate.' },
              ].map(item => (
                <div key={item.title} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                  <h3 style={{ fontWeight: '900', color: '#26C2B9', marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: '80px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>Ready to Make a Difference?</h2>
            <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1rem' }}>Join thousands of Kenyans giving hope through AidbridgE.</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/Register" style={{ backgroundColor: '#26C2B9', color: 'white', padding: '16px 36px', borderRadius: '16px', fontWeight: '900', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Start Giving
              </a>
              <a href="/discover" style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px 36px', borderRadius: '16px', fontWeight: '900', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Browse Requests
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;