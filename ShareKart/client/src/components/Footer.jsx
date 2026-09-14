import React from 'react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-primary-container text-on-primary-container border-t border-outline/20 mt-space-32 mb-16 md:mb-0">
      {/* Trust Guarantee Band */}
      <div className="border-b border-outline/20 bg-primary/40 py-space-16">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-gutter-desktop grid grid-cols-1 md:grid-cols-3 gap-space-16">
          <div className="flex items-center gap-space-12">
            <span className="material-symbols-outlined text-secondary-fixed text-[28px]">verified_user</span>
            <div>
              <p className="font-label-bold text-on-primary text-body-md">100% Aadhaar Verified</p>
              <p className="text-body-sm text-on-primary-container">UIDAI-authenticated seller and renter identities.</p>
            </div>
          </div>
          <div className="flex items-center gap-space-12">
            <span className="material-symbols-outlined text-secondary-fixed text-[28px]">shield_with_heart</span>
            <div>
              <p className="font-label-bold text-on-primary text-body-md">Razorpay Escrow Reserve</p>
              <p className="text-body-sm text-on-primary-container">Your security deposit stays protected until return.</p>
            </div>
          </div>
          <div className="flex items-center gap-space-12">
            <span className="material-symbols-outlined text-secondary-fixed text-[28px]">handshake</span>
            <div>
              <p className="font-label-bold text-on-primary text-body-md">Physical Testing on Handover</p>
              <p className="text-body-sm text-on-primary-container">Inspect gear on the spot with local Gandhinagar neighbors.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-gutter-desktop py-space-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-24">
        <div className="flex flex-col gap-space-12">
          <div className="flex items-center gap-space-8">
            <img 
              alt="Sharekart Logo" 
              className="h-7 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida/AEtjO1UM7nAmAg-wn8ekbV1KgaHp_BP1JrxBbMUvzHpWog8Pt_LKP465A8rT68RxdchMiQk7V9tOcZ3hRgnax2OHH2Hqmh275I_sKTFIeUNCPUiK0_09ZvHhvBt3KFDQr2ziZC4xF6G0K9PvPyu9xXO7n0-PhwliRLHuNwvO0pyOlRvnPZ9R6ynfK7cyyx7p8I1FsdqfBkRiJBS3MsKqWf8nfgDxPwseImCdDa9YtrNll44MiCS3IWyT832xcLpP" 
            />
            <span className="font-headline-sm text-on-primary font-bold">Sharekart</span>
          </div>
          <p className="text-body-sm leading-relaxed">
            India's hyperlocal peer-to-peer sharing and pre-owned commerce platform. Save money, monetize idle assets, and connect safely with neighbors.
          </p>
          <div className="flex items-center gap-space-8 text-secondary-fixed text-xs font-bold mt-2">
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Toll-Free Escrow Line: 1800-SHARE-KART</span>
          </div>
        </div>

        <div className="flex flex-col gap-space-8">
          <h4 className="font-label-bold text-on-primary text-body-md uppercase tracking-wider">Top Rental Categories</h4>
          <ul className="flex flex-col gap-space-4 text-body-sm">
            <li><button onClick={() => onNavigate('search', { category: 'cameras-audio' })} className="hover:text-secondary-fixed">Cameras & 4K Gear</button></li>
            <li><button onClick={() => onNavigate('search', { category: 'laptops-mobiles' })} className="hover:text-secondary-fixed">Laptops & Workstations</button></li>
            <li><button onClick={() => onNavigate('search', { category: 'power-tools-machinery' })} className="hover:text-secondary-fixed">Power Drills & Tools</button></li>
            <li><button onClick={() => onNavigate('search', { category: 'bikes-cycles' })} className="hover:text-secondary-fixed">Geared Bicycles</button></li>
            <li><button onClick={() => onNavigate('search', { category: 'home-furniture' })} className="hover:text-secondary-fixed">Ergonomic Chairs</button></li>
          </ul>
        </div>

        <div className="flex flex-col gap-space-8">
          <h4 className="font-label-bold text-on-primary text-body-md uppercase tracking-wider">Lender & Renter Hub</h4>
          <ul className="flex flex-col gap-space-4 text-body-sm">
            <li><button onClick={() => onNavigate('dashboard')} className="hover:text-secondary-fixed">Seller / Lender Dashboard</button></li>
            <li><button onClick={() => onNavigate('orders')} className="hover:text-secondary-fixed">Active Escrow Bookings</button></li>
            <li><span className="hover:text-secondary-fixed cursor-pointer">Aadhaar eKYC Verification</span></li>
            <li><span className="hover:text-secondary-fixed cursor-pointer">Deposit Refund Guidelines</span></li>
            <li><span className="hover:text-secondary-fixed cursor-pointer">Condition Rating Standards</span></li>
          </ul>
        </div>

        <div className="flex flex-col gap-space-8">
          <h4 className="font-label-bold text-on-primary text-body-md uppercase tracking-wider">Hyperlocal Hubs</h4>
          <p className="text-body-sm">Active handover hubs in Gujarat:</p>
          <div className="flex flex-wrap gap-space-4">
            <span className="bg-primary/60 text-secondary-fixed text-badge font-badge px-space-6 py-1 rounded">Infocity Kudasan</span>
            <span className="bg-primary/60 text-secondary-fixed text-badge font-badge px-space-6 py-1 rounded">Sector 7 & 21</span>
            <span className="bg-primary/60 text-secondary-fixed text-badge font-badge px-space-6 py-1 rounded">DA-IICT Campus</span>
            <span className="bg-primary/60 text-secondary-fixed text-badge font-badge px-space-6 py-1 rounded">PDPU Raisan</span>
            <span className="bg-primary/60 text-secondary-fixed text-badge font-badge px-space-6 py-1 rounded">GIFT City Hub</span>
          </div>
        </div>
      </div>

      <div className="border-t border-outline/20 py-space-16 text-center text-body-sm text-on-primary-container">
        <p>© 2025 Sharekart India Technologies Private Limited. All rights reserved.</p>
      </div>
    </footer>
  );
};
