'use client';

import { useState, useEffect } from 'react';
import { Preloader } from '@/components/preloader/preloader';
import { Navbar } from '@/components/sections/navbar';
import { Hero } from '@/components/sections/hero';
import { TrustedCompanies } from '@/components/sections/trusted-companies';
import { Features } from '@/components/sections/features';
import { Integrations } from '@/components/sections/integrations';
import { HowItWorks } from '@/components/sections/how-it-works';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { About } from '@/components/sections/about';
import { Testimonials } from '@/components/sections/testimonials';
import { FAQ } from '@/components/sections/faq';
import { BookDemo } from '@/components/sections/book-demo';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <Preloader onComplete={() => setReady(true)} />
      <main id="home" className="relative min-h-screen bg-white">
        <div style={{ visibility: ready ? 'visible' : 'hidden' }}>
          <Navbar />
          <Hero />
          <TrustedCompanies />
          <Features />
          <Integrations />
          <HowItWorks />
          <WhyChooseUs />
          <About />
          <Testimonials />
          <FAQ />
          <BookDemo />
          <Contact />
          <Footer />
        </div>
      </main>
    </>
  );
}
