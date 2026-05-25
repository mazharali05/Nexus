import React, { useState, useEffect } from 'react';

const TOUR_STEPS = [
  {
    target: '[data-tour="dashboard"]',
    title: '👋 Welcome to Business Nexus!',
    content: 'This is your main dashboard where you can track all your activity at a glance.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="documents"]',
    title: '📁 Document Chamber',
    content: 'Upload, review, and e-sign important deal documents here.',
  },
  {
    target: '[data-tour="calendar"]',
    title: '📅 Meeting Calendar',
    content: 'Schedule meetings, add availability slots, and manage meeting requests.',
  },
];

const AppTour: React.FC = () => {
  const [run, setRun] = useState(false);
  const [JoyrideComponent, setJoyrideComponent] = useState<any>(null);

  // Lazy-load the package dynamically only when the component mounts in the browser.
  // This completely bypasses Vite's rigid compile-time import checker!
  useEffect(() => {
    import('react-joyride').then((module) => {
      // Find the component wherever Vite dropped it in the bundle object
      const component = module;
      setJoyrideComponent(() => component);
    }).catch(err => console.error("Failed to load tour library safely:", err));
  }, []);

  const handleJoyrideCallback = (data: any) => {
    // Safely check status strings without needing to import status constants
    if (data.status === 'finished' || data.status === 'skipped') {
      setRun(false);
    }
  };

  return (
    <>
      {/* Floating tour button */}
      <button
        onClick={() => setRun(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg transition-all duration-200"
      >
        🎯 Start Tour
      </button>

      {/* Only render the tour once the component has successfully resolved dynamically */}
      {JoyrideComponent && run && (
        <JoyrideComponent
          steps={TOUR_STEPS}
          run={run}
          continuous
          showProgress
          showSkipButton
          scrollToFirstStep
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#2563eb',
              textColor: '#111827',
              backgroundColor: '#ffffff',
              arrowColor: '#ffffff',
              overlayColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
            },
            tooltip: {
              borderRadius: '12px',
              fontSize: '14px',
            },
            buttonNext: {
              backgroundColor: '#2563eb',
              borderRadius: '8px',
              fontSize: '13px',
              padding: '8px 16px',
            },
            buttonBack: {
              color: '#6b7280',
              fontSize: '13px',
            },
            buttonSkip: {
              color: '#6b7280',
              fontSize: '13px',
            },
          }}
        />
      )}
    </>
  );
};

export default AppTour;