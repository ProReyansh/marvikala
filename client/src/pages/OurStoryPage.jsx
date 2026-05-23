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
          <span>Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span>Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span>Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
          <span>Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span>Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span>Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="sa-page">

        <div className="sa-header-row">
          <h1 className="sa-title">Our Story</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="story-page">

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



        </div>
      </div>

      <Footer />
    </>
  );
}
