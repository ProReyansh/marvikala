import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OurStoryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Our Story — Marvikala';
  }, []);

  return (
    <>
      {/* TOP RIBBON */}
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span>📍 Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
          <span>📍 Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery="" onSearch={() => {}} />

      <main className="story-page-wrapper">

        {/* ── Header Row ── */}
        <div className="story-page-header">
          <h1 className="story-page-title">Our Story</h1>
          <button className="story-page-back" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>

        <div className="story-page">

          {/* Hero image area */}
          <div className="story-page-hero">🧶</div>

          {/* Story paragraphs */}
          <p>
            Marvikala was born in the warmth of a small Mumbai apartment, from the quiet rhythm
            of a crochet hook and the endless patience of a mother who believed that handmade
            things carry something no machine ever could — a piece of the person who made them.
            What started as a way to fill Sunday afternoons with colour and texture slowly grew
            into something much more meaningful.
          </p>

          <p>
            When her daughter joined the journey, something magical happened. Two generations,
            one shared love for craft. Together, they began turning yarn into tiny bouquets of
            flowers, cheerful keychains, elegant bookmarks, and beautiful Laddu Gopal outfits —
            each piece carrying a story, each stitch placed with intention. The name Marvikala
            weaves their names and their art into one: a tribute to the bond that made it all
            possible.
          </p>

          <p>
            Every Marvikala creation is truly one-of-a-kind. We don't mass-produce anything.
            We choose our yarns carefully — soft, vibrant, long-lasting — and we take our time.
            There are no shortcuts in handmade. A flower bouquet might take two hours. A Laddu
            Gopal dress might take an afternoon. But when you hold it in your hands, you can feel
            the difference. That's what we make — not just products, but little pieces of happiness.
          </p>

          <p>
            Today, Marvikala ships across India, and our little studio in Mumbai continues to
            grow — one stitch, one smile, one happy customer at a time. We are so grateful for
            every person who has trusted us with their gifts, their celebrations, and their everyday
            moments of joy. Thank you for being part of our story.
          </p>

          {/* Our Values */}
          <h2>Our Values</h2>
          <div className="story-values">
            <div className="story-value">
              <div className="story-value-icon">🧶</div>
              <h3>Handmade with Care</h3>
              <p>Every single piece is made by hand, stitch by stitch, with full attention and love.</p>
            </div>
            <div className="story-value">
              <div className="story-value-icon">🌿</div>
              <h3>Sustainable &amp; Natural</h3>
              <p>We choose soft, quality yarns and natural materials that are kind to people and planet.</p>
            </div>
            <div className="story-value">
              <div className="story-value-icon">📍</div>
              <h3>Made in Mumbai with Love</h3>
              <p>Proudly crafted in our small Mumbai studio — local craft, global warmth.</p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <a
              href="https://wa.me/919769238160"
              target="_blank"
              rel="noreferrer"
              className="btn-wa"
              style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat with us on WhatsApp
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
