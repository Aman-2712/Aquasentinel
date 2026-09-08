import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FloodDataProvider } from '@/context/FloodDataContext';
import IntroWrapper from '@/components/layout/IntroWrapper';
import ThemeApplier from '@/components/layout/ThemeApplier';

export const metadata: Metadata = {
  title: 'AquaSentinel – Urban Flood Early Warning System',
  description: 'AI + IoT powered flood intelligence and field protection system for Visakhapatnam. Real-time flood risk maps, safe route guidance, and early warnings.',
  keywords: 'flood warning, urban flood, Visakhapatnam, waterlogging, flood alert, AquaSentinel',
  openGraph: {
    title: 'AquaSentinel',
    description: 'AI + IoT Powered Flood Intelligence & Field Protection System',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (!sessionStorage.getItem('aquasentinel_intro_played')) {
                    document.documentElement.classList.add('intro-pending');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeApplier />
          <FloodDataProvider>
            <IntroWrapper>
              {children}
            </IntroWrapper>
          </FloodDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
